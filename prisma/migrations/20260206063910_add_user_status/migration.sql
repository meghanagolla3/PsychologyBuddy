/*
  Warnings:

  - You are about to drop the column `customTrigger` on the `ChatSessions` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `ChatSessions` table. All the data in the column will be lost.
  - You are about to drop the column `trigger` on the `ChatSessions` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `MoodCheckins` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `TriggerSelections` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `googleId` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `userType` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the `Admins` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EmailVerificationOTPs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EmotionLogs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PasswordResetOTPs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `high_risk_alerts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `students` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[studentId]` on the table `Users` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `senderType` on the `ChatMessages` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `userId` to the `ChatSessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `MoodCheckins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `TriggerSelections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleId` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SenderType" AS ENUM ('STUDENT', 'BOT');

-- CreateEnum
CREATE TYPE "ResourceStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MeditationFormat" AS ENUM ('AUDIO', 'VIDEO', 'TEXT');

-- DropForeignKey
ALTER TABLE "Admins" DROP CONSTRAINT "Admins_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "ChatSessions" DROP CONSTRAINT "ChatSessions_studentId_fkey";

-- DropForeignKey
ALTER TABLE "EmotionLogs" DROP CONSTRAINT "EmotionLogs_studentId_fkey";

-- DropForeignKey
ALTER TABLE "MoodCheckins" DROP CONSTRAINT "MoodCheckins_studentId_fkey";

-- DropForeignKey
ALTER TABLE "TriggerSelections" DROP CONSTRAINT "TriggerSelections_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Users" DROP CONSTRAINT "Users_classId_fkey";

-- DropForeignKey
ALTER TABLE "Users" DROP CONSTRAINT "Users_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "high_risk_alerts" DROP CONSTRAINT "high_risk_alerts_studentId_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_adminId_fkey";

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_classId_fkey";

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_schoolId_fkey";

-- AlterTable
ALTER TABLE "ChatMessages" DROP COLUMN "senderType",
ADD COLUMN     "senderType" "SenderType" NOT NULL;

-- AlterTable
ALTER TABLE "ChatSessions" DROP COLUMN "customTrigger",
DROP COLUMN "studentId",
DROP COLUMN "trigger",
ADD COLUMN     "triggers" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MoodCheckins" DROP COLUMN "studentId",
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "date" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "TriggerSelections" DROP COLUMN "studentId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Users" DROP COLUMN "department",
DROP COLUMN "googleId",
DROP COLUMN "role",
DROP COLUMN "userType",
ADD COLUMN     "roleId" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "studentId" TEXT,
ALTER COLUMN "schoolId" DROP NOT NULL;

-- DropTable
DROP TABLE "Admins";

-- DropTable
DROP TABLE "EmailVerificationOTPs";

-- DropTable
DROP TABLE "EmotionLogs";

-- DropTable
DROP TABLE "PasswordResetOTPs";

-- DropTable
DROP TABLE "high_risk_alerts";

-- DropTable
DROP TABLE "notifications";

-- DropTable
DROP TABLE "students";

-- DropEnum
DROP TYPE "Role";

-- DropEnum
DROP TYPE "UserType";

-- CreateTable
CREATE TABLE "StudentProfiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileImage" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "StudentProfiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminProfiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "department" TEXT NOT NULL DEFAULT 'Student Wellness',
    "profileImageUrl" TEXT,

    CONSTRAINT "AdminProfiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "module" TEXT NOT NULL,

    CONSTRAINT "Permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermissions" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "RolePermissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminPermissions" (
    "id" TEXT NOT NULL,
    "adminProfileId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "AdminPermissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Summaries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "mainTopic" TEXT NOT NULL,
    "conversationStart" TEXT NOT NULL,
    "conversationAbout" TEXT NOT NULL,
    "reflection" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalingToolConfig" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "enableWriting" BOOLEAN NOT NULL DEFAULT true,
    "enableAudio" BOOLEAN NOT NULL DEFAULT true,
    "enableArt" BOOLEAN NOT NULL DEFAULT true,
    "maxAudioDuration" INTEGER NOT NULL DEFAULT 300,
    "autoSaveAudio" BOOLEAN NOT NULL DEFAULT true,
    "enableUndo" BOOLEAN NOT NULL DEFAULT true,
    "enableRedo" BOOLEAN NOT NULL DEFAULT true,
    "enableClearCanvas" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "JournalingToolConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WritingJournals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WritingJournals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudioJournals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "audioUrl" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AudioJournals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtJournals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArtJournals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MusicTherapy" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "thumbnailUrl" TEXT,
    "audioUrl" TEXT NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "category" TEXT,
    "supportedMoods" TEXT[],
    "goal" TEXT,
    "status" "ResourceStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MusicTherapy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MusicMood" (
    "id" TEXT NOT NULL,
    "musicId" TEXT NOT NULL,
    "moodId" TEXT NOT NULL,

    CONSTRAINT "MusicMood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MusicGoal" (
    "id" TEXT NOT NULL,
    "musicId" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,

    CONSTRAINT "MusicGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MusicCategory" (
    "id" TEXT NOT NULL,
    "musicId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "MusicCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meditation" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "format" "MeditationFormat" NOT NULL,
    "audioUrl" TEXT,
    "videoUrl" TEXT,
    "durationSec" INTEGER,
    "category" TEXT,
    "supportedMoods" TEXT[],
    "goal" TEXT,
    "status" "ResourceStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Meditation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeditationMood" (
    "id" TEXT NOT NULL,
    "meditationId" TEXT NOT NULL,
    "moodId" TEXT NOT NULL,

    CONSTRAINT "MeditationMood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeditationGoal" (
    "id" TEXT NOT NULL,
    "meditationId" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,

    CONSTRAINT "MeditationGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeditationCategory" (
    "id" TEXT NOT NULL,
    "meditationId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "MeditationCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Articles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "author" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "description" TEXT NOT NULL,
    "status" "ResourceStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleMood" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "moodId" TEXT NOT NULL,

    CONSTRAINT "ArticleMood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleGoal" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,

    CONSTRAINT "ArticleGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleCategory" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "ArticleCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyLogins" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyLogins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceAccess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResourceAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Streaks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Streaks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HighRiskAlerts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "HighRiskAlerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoodLabels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "MoodLabels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoalLabels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "GoalLabels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryLabels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CategoryLabels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfiles_userId_key" ON "StudentProfiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminProfiles_userId_key" ON "AdminProfiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Roles_name_key" ON "Roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permissions_name_key" ON "Permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermissions_roleId_permissionId_key" ON "RolePermissions"("roleId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminPermissions_adminProfileId_permissionId_key" ON "AdminPermissions"("adminProfileId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "JournalingToolConfig_schoolId_key" ON "JournalingToolConfig"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "MusicMood_musicId_moodId_key" ON "MusicMood"("musicId", "moodId");

-- CreateIndex
CREATE UNIQUE INDEX "MusicGoal_musicId_goalId_key" ON "MusicGoal"("musicId", "goalId");

-- CreateIndex
CREATE UNIQUE INDEX "MusicCategory_musicId_categoryId_key" ON "MusicCategory"("musicId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "MeditationMood_meditationId_moodId_key" ON "MeditationMood"("meditationId", "moodId");

-- CreateIndex
CREATE UNIQUE INDEX "MeditationGoal_meditationId_goalId_key" ON "MeditationGoal"("meditationId", "goalId");

-- CreateIndex
CREATE UNIQUE INDEX "MeditationCategory_meditationId_categoryId_key" ON "MeditationCategory"("meditationId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleMood_articleId_moodId_key" ON "ArticleMood"("articleId", "moodId");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleGoal_articleId_goalId_key" ON "ArticleGoal"("articleId", "goalId");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleCategory_articleId_categoryId_key" ON "ArticleCategory"("articleId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyLogins_userId_date_key" ON "DailyLogins"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "MoodLabels_name_key" ON "MoodLabels"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GoalLabels_name_key" ON "GoalLabels"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryLabels_name_key" ON "CategoryLabels"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionId_key" ON "Session"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Users_studentId_key" ON "Users"("studentId");

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfiles" ADD CONSTRAINT "StudentProfiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminProfiles" ADD CONSTRAINT "AdminProfiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermissions" ADD CONSTRAINT "RolePermissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermissions" ADD CONSTRAINT "RolePermissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminPermissions" ADD CONSTRAINT "AdminPermissions_adminProfileId_fkey" FOREIGN KEY ("adminProfileId") REFERENCES "AdminProfiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminPermissions" ADD CONSTRAINT "AdminPermissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatSessions" ADD CONSTRAINT "ChatSessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoodCheckins" ADD CONSTRAINT "MoodCheckins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TriggerSelections" ADD CONSTRAINT "TriggerSelections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Summaries" ADD CONSTRAINT "Summaries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Summaries" ADD CONSTRAINT "Summaries_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ChatSessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalingToolConfig" ADD CONSTRAINT "JournalingToolConfig_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WritingJournals" ADD CONSTRAINT "WritingJournals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioJournals" ADD CONSTRAINT "AudioJournals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtJournals" ADD CONSTRAINT "ArtJournals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicTherapy" ADD CONSTRAINT "MusicTherapy_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicMood" ADD CONSTRAINT "MusicMood_musicId_fkey" FOREIGN KEY ("musicId") REFERENCES "MusicTherapy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicMood" ADD CONSTRAINT "MusicMood_moodId_fkey" FOREIGN KEY ("moodId") REFERENCES "MoodLabels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicGoal" ADD CONSTRAINT "MusicGoal_musicId_fkey" FOREIGN KEY ("musicId") REFERENCES "MusicTherapy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicGoal" ADD CONSTRAINT "MusicGoal_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "GoalLabels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicCategory" ADD CONSTRAINT "MusicCategory_musicId_fkey" FOREIGN KEY ("musicId") REFERENCES "MusicTherapy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicCategory" ADD CONSTRAINT "MusicCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CategoryLabels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meditation" ADD CONSTRAINT "Meditation_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeditationMood" ADD CONSTRAINT "MeditationMood_meditationId_fkey" FOREIGN KEY ("meditationId") REFERENCES "Meditation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeditationMood" ADD CONSTRAINT "MeditationMood_moodId_fkey" FOREIGN KEY ("moodId") REFERENCES "MoodLabels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeditationGoal" ADD CONSTRAINT "MeditationGoal_meditationId_fkey" FOREIGN KEY ("meditationId") REFERENCES "Meditation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeditationGoal" ADD CONSTRAINT "MeditationGoal_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "GoalLabels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeditationCategory" ADD CONSTRAINT "MeditationCategory_meditationId_fkey" FOREIGN KEY ("meditationId") REFERENCES "Meditation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeditationCategory" ADD CONSTRAINT "MeditationCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CategoryLabels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Articles" ADD CONSTRAINT "Articles_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleMood" ADD CONSTRAINT "ArticleMood_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleMood" ADD CONSTRAINT "ArticleMood_moodId_fkey" FOREIGN KEY ("moodId") REFERENCES "MoodLabels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleGoal" ADD CONSTRAINT "ArticleGoal_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleGoal" ADD CONSTRAINT "ArticleGoal_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "GoalLabels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleCategory" ADD CONSTRAINT "ArticleCategory_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleCategory" ADD CONSTRAINT "ArticleCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CategoryLabels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyLogins" ADD CONSTRAINT "DailyLogins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceAccess" ADD CONSTRAINT "ResourceAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Streaks" ADD CONSTRAINT "Streaks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HighRiskAlerts" ADD CONSTRAINT "HighRiskAlerts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
