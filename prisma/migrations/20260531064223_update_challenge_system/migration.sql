/*
  Warnings:

  - Added the required column `updatedAt` to the `UserChallenges` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ModuleType" AS ENUM ('JOURNALING', 'MEDITATION', 'MUSIC', 'ARTICLE');

-- CreateEnum
CREATE TYPE "ChallengeType" AS ENUM ('DAILY', 'WEEKLY', 'STREAK', 'MILESTONE');

-- CreateEnum
CREATE TYPE "TargetUnit" AS ENUM ('ENTRIES', 'SESSIONS', 'MINUTES', 'DAYS', 'ARTICLES');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "UserChallengeStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED');

-- AlterTable
ALTER TABLE "Challenges" ADD COLUMN     "badgeId" TEXT,
ADD COLUMN     "challengeType" "ChallengeType",
ADD COLUMN     "difficulty" "Difficulty",
ADD COLUMN     "moduleType" "ModuleType",
ADD COLUMN     "rewardPoints" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "targetUnit" "TargetUnit",
ADD COLUMN     "targetValue" INTEGER;

-- AlterTable
ALTER TABLE "UserBadges" ADD COLUMN     "challengeId" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "UserChallenges" ADD COLUMN     "challengeStatus" "UserChallengeStatus" NOT NULL DEFAULT 'NOT_STARTED',
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "currentProgress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "dateOfBirth" TEXT;

-- CreateTable
CREATE TABLE "UserProfiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "currentLevel" INTEGER NOT NULL DEFAULT 1,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "challengesCompleted" INTEGER NOT NULL DEFAULT 0,
    "badgesEarned" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityEvents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeId" TEXT,
    "moduleType" "ModuleType" NOT NULL,
    "action" TEXT NOT NULL,
    "value" INTEGER,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityEvents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfiles_userId_key" ON "UserProfiles"("userId");

-- RenameForeignKey
ALTER TABLE "UserBadges" RENAME CONSTRAINT "UserBadges_userId_fkey" TO "UserBadges_userId_fkey2";

-- AddForeignKey
ALTER TABLE "UserBadges" ADD CONSTRAINT "UserBadges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challenges" ADD CONSTRAINT "Challenges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badges"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfiles" ADD CONSTRAINT "UserProfiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityEvents" ADD CONSTRAINT "ActivityEvents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityEvents" ADD CONSTRAINT "ActivityEvents_userId_fkey2" FOREIGN KEY ("userId") REFERENCES "UserProfiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityEvents" ADD CONSTRAINT "ActivityEvents_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenges"("id") ON DELETE SET NULL ON UPDATE CASCADE;
