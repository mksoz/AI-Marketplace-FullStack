import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { GitHubService } from '../services/github.service';

const prisma = new PrismaClient();

/**
 * Helper function to fetch commits for a synced repository
 */
async function fetchCommitsForSync(syncId: string) {
    const sync = await prisma.gitHubSync.findUnique({
        where: { id: syncId },
    });

    if (!sync) throw new Error('Sync not found');

    const githubService = new GitHubService();

    // Fetch commits since last sync or all if first time
    const since = sync.lastSyncAt?.toISOString();
    const commits = await githubService.getCommits(
        sync.repoOwner,
        sync.repoName,
        sync.repoBranch,
        since,
        50 // Fetch up to 50 commits
    );

    // Store commits in database
    for (const commitData of commits) {
        // Check if commit already exists
        const existing = await prisma.gitHubCommit.findUnique({
            where: { sha: commitData.sha },
        });

        if (!existing) {
            // Fetch detailed stats if not available
            let stats = commitData.stats;
            if (!stats) {
                const details = await githubService.getCommitDetails(
                    sync.repoOwner,
                    sync.repoName,
                    commitData.sha
                );
                stats = details.stats;
            }

            await prisma.gitHubCommit.create({
                data: {
                    syncId,
                    sha: commitData.sha,
                    message: commitData.commit.message,
                    author: commitData.commit.author.name,
                    authorEmail: commitData.commit.author.email,
                    authorAvatar: commitData.author?.avatar_url,
                    committedAt: new Date(commitData.commit.author.date),
                    additions: stats?.additions || 0,
                    deletions: stats?.deletions || 0,
                    changedFiles: 0, // Will be updated if we fetch files
                },
            });
        }
    }

    // Update last sync time
    await prisma.gitHubSync.update({
        where: { id: syncId },
        data: { lastSyncAt: new Date() },
    });
}

/**
 * Sync a GitHub repository with a project
 * POST /projects/:projectId/github/sync
 * Body: { repoUrl, branch? }
 */
export const syncRepository = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const { repoUrl, branch = 'main' } = req.body;
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Verify project exists and user is vendor
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { vendor: true },
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Authorization: Only vendor can sync repo
        if (project.vendor?.userId !== user.userId) {
            return res.status(403).json({ message: 'Only the project vendor can sync repository' });
        }

        // Parse GitHub URL
        const githubService = new GitHubService();
        const parsed = githubService.parseGitHubUrl(repoUrl);

        if (!parsed) {
            return res.status(400).json({ message: 'Invalid GitHub repository URL' });
        }

        // Verify repo exists on GitHub
        let repoInfo;
        try {
            repoInfo = await githubService.getRepository(parsed.owner, parsed.name);
        } catch (error: any) {
            if (error.response?.status === 404) {
                return res.status(404).json({ message: 'Repository not found on GitHub' });
            }
            throw error;
        }

        // Create or update GitHubSync
        const sync = await prisma.gitHubSync.upsert({
            where: { projectId },
            create: {
                projectId,
                repoUrl,
                repoOwner: parsed.owner,
                repoName: parsed.name,
                repoBranch: branch,
                repoStars: repoInfo.stars,
                repoForks: repoInfo.forks,
                repoLanguage: repoInfo.language,
                repoOpenIssues: repoInfo.open_issues,
                syncStatus: 'ACTIVE',
            },
            update: {
                repoUrl,
                repoOwner: parsed.owner,
                repoName: parsed.name,
                repoBranch: branch,
                repoStars: repoInfo.stars,
                repoForks: repoInfo.forks,
                repoLanguage: repoInfo.language,
                repoOpenIssues: repoInfo.open_issues,
                syncStatus: 'ACTIVE',
                syncError: null,
            },
        });

        // Fetch initial commits
        await fetchCommitsForSync(sync.id);

        res.json({
            message: 'Repository synced successfully',
            sync,
        });
    } catch (error: any) {
        console.error('Sync repository error:', error);
        res.status(500).json({ message: error.message || 'Failed to sync repository' });
    }
};

/**
 * Get repository info and commits
 * GET /projects/:projectId/github
 */
export const getRepositoryInfo = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Verify project access
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                vendor: true,
                client: true,
            },
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Authorization: Client or Vendor can view
        const isClient = project.client?.userId === user.userId;
        const isVendor = project.vendor?.userId === user.userId;

        if (!isClient && !isVendor) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Fetch sync info with commits
        const sync = await prisma.gitHubSync.findUnique({
            where: { projectId },
            include: {
                commits: {
                    orderBy: { committedAt: 'desc' },
                    take: 50,
                },
            },
        });

        if (!sync) {
            return res.json({ synced: false });
        }

        res.json({
            synced: true,
            repository: {
                url: sync.repoUrl,
                owner: sync.repoOwner,
                name: sync.repoName,
                branch: sync.repoBranch,
                stars: sync.repoStars,
                forks: sync.repoForks,
                language: sync.repoLanguage,
                openIssues: sync.repoOpenIssues,
                lastSyncAt: sync.lastSyncAt,
                status: sync.syncStatus,
            },
            commits: sync.commits,
            isVendor,
        });
    } catch (error: any) {
        console.error('Get repository info error:', error);
        res.status(500).json({ message: error.message || 'Failed to fetch repository info' });
    }
};

/**
 * Refresh commits from GitHub
 * POST /projects/:projectId/github/refresh
 */
export const refreshCommits = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const sync = await prisma.gitHubSync.findUnique({
            where: { projectId },
            include: { project: { include: { vendor: true, client: true } } },
        });

        if (!sync) {
            return res.status(404).json({ message: 'No repository synced' });
        }

        // Authorization: Both client and vendor can refresh
        const isClient = sync.project.client?.userId === user.userId;
        const isVendor = sync.project.vendor?.userId === user.userId;

        if (!isClient && !isVendor) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await fetchCommitsForSync(sync.id);

        res.json({ message: 'Commits refreshed successfully' });
    } catch (error: any) {
        console.error('Refresh commits error:', error);
        res.status(500).json({ message: error.message || 'Failed to refresh commits' });
    }
};

/**
 * Unlink repository
 * DELETE /projects/:projectId/github
 */
export const unlinkRepository = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const sync = await prisma.gitHubSync.findUnique({
            where: { projectId },
            include: { project: { include: { vendor: true } } },
        });

        if (!sync) {
            return res.status(404).json({ message: 'No repository synced' });
        }

        // Authorization: Only vendor can unlink
        if (sync.project.vendor?.userId !== user.userId) {
            return res.status(403).json({ message: 'Only vendor can unlink repository' });
        }

        // Delete sync (cascade will delete commits)
        await prisma.gitHubSync.delete({
            where: { id: sync.id },
        });

        res.json({ message: 'Repository unlinked successfully' });
    } catch (error: any) {
        console.error('Unlink repository error:', error);
        res.status(500).json({ message: error.message || 'Failed to unlink repository' });
    }
};
