-- CreateTable
CREATE TABLE "GitHubSync" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "repoUrl" TEXT NOT NULL,
    "repoOwner" TEXT NOT NULL,
    "repoName" TEXT NOT NULL,
    "repoBranch" TEXT NOT NULL DEFAULT 'main',
    "lastSyncAt" TIMESTAMP(3),
    "syncStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "syncError" TEXT,
    "repoStars" INTEGER NOT NULL DEFAULT 0,
    "repoForks" INTEGER NOT NULL DEFAULT 0,
    "repoLanguage" TEXT,
    "repoOpenIssues" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GitHubSync_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GitHubCommit" (
    "id" TEXT NOT NULL,
    "syncId" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "authorEmail" TEXT,
    "authorAvatar" TEXT,
    "committedAt" TIMESTAMP(3) NOT NULL,
    "additions" INTEGER NOT NULL DEFAULT 0,
    "deletions" INTEGER NOT NULL DEFAULT 0,
    "changedFiles" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GitHubCommit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GitHubSync_projectId_key" ON "GitHubSync"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "GitHubCommit_sha_key" ON "GitHubCommit"("sha");

-- CreateIndex
CREATE INDEX "GitHubCommit_syncId_committedAt_idx" ON "GitHubCommit"("syncId", "committedAt" DESC);

-- AddForeignKey
ALTER TABLE "GitHubSync" ADD CONSTRAINT "GitHubSync_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GitHubCommit" ADD CONSTRAINT "GitHubCommit_syncId_fkey" FOREIGN KEY ("syncId") REFERENCES "GitHubSync"("id") ON DELETE CASCADE ON UPDATE CASCADE;
