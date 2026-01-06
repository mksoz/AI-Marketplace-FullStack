import axios from 'axios';

const GITHUB_API_BASE = 'https://api.github.com';

interface GitHubRepo {
    owner: string;
    name: string;
    stars: number;
    forks: number;
    language: string;
    open_issues: number;
}

interface GitHubCommitData {
    sha: string;
    commit: {
        message: string;
        author: {
            name: string;
            email: string;
            date: string;
        };
    };
    author: {
        avatar_url: string;
    } | null;
    stats?: {
        additions: number;
        deletions: number;
        total: number;
    };
    files?: Array<any>;
}

export class GitHubService {
    private token?: string;

    constructor(token?: string) {
        this.token = token;
    }

    private getHeaders() {
        const headers: any = {
            'Accept': 'application/vnd.github.v3+json',
        };
        if (this.token) {
            headers['Authorization'] = `token ${this.token}`;
        }
        return headers;
    }

    /**
     * Parse GitHub URL to extract owner and repo name
     * Supports: https://github.com/owner/repo, git@github.com:owner/repo.git
     */
    parseGitHubUrl(url: string): { owner: string; name: string } | null {
        // HTTPS format
        const httpsMatch = url.match(/github\.com\/([^\/]+)\/([^\/\.]+)/);
        if (httpsMatch) {
            return { owner: httpsMatch[1], name: httpsMatch[2] };
        }

        // SSH format
        const sshMatch = url.match(/git@github\.com:([^\/]+)\/(.+)\.git/);
        if (sshMatch) {
            return { owner: sshMatch[1], name: sshMatch[2] };
        }

        return null;
    }

    /**
     * Fetch repository information
     */
    async getRepository(owner: string, repo: string): Promise<GitHubRepo> {
        const response = await axios.get(
            `${GITHUB_API_BASE}/repos/${owner}/${repo}`,
            { headers: this.getHeaders() }
        );

        return {
            owner: response.data.owner.login,
            name: response.data.name,
            stars: response.data.stargazers_count,
            forks: response.data.forks_count,
            language: response.data.language,
            open_issues: response.data.open_issues_count,
        };
    }

    /**
     * Fetch commits for a repository
     * @param since - ISO date string to fetch commits after this date
     */
    async getCommits(
        owner: string,
        repo: string,
        branch: string = 'main',
        since?: string,
        perPage: number = 30
    ): Promise<GitHubCommitData[]> {
        const params: any = {
            sha: branch,
            per_page: perPage,
        };

        if (since) {
            params.since = since;
        }

        const response = await axios.get(
            `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits`,
            {
                headers: this.getHeaders(),
                params
            }
        );

        return response.data;
    }

    /**
     * Fetch detailed commit info including stats
     */
    async getCommitDetails(owner: string, repo: string, sha: string): Promise<GitHubCommitData> {
        const response = await axios.get(
            `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits/${sha}`,
            { headers: this.getHeaders() }
        );

        return response.data;
    }
}
