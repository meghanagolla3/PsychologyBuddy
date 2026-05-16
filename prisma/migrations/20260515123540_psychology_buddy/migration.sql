-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'MISSED');

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "parentId" TEXT;

-- CreateTable
CREATE TABLE "ParentMeetings" (
    "id" TEXT NOT NULL,
    "counselorId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "parentName" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "discussion" TEXT,
    "recommendations" TEXT,
    "requestedBy" TEXT NOT NULL DEFAULT 'COUNSELOR',
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParentMeetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Challenges" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "schoolId" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3) NOT NULL DEFAULT (now() + interval '7 days'),
    "requiresMeditation" BOOLEAN NOT NULL DEFAULT false,
    "requiresMusic" BOOLEAN NOT NULL DEFAULT false,
    "requiresPsychoeducation" BOOLEAN NOT NULL DEFAULT false,
    "requiresJournaling" BOOLEAN NOT NULL DEFAULT false,
    "assignmentType" TEXT NOT NULL DEFAULT 'INDIVIDUAL',
    "targetClassId" TEXT,
    "targetSchoolId" TEXT,

    CONSTRAINT "Challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserChallenges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ASSIGNED',
    "progressPercentage" INTEGER NOT NULL DEFAULT 0,
    "lastActivityAt" TIMESTAMP(3),

    CONSTRAINT "UserChallenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeAssignments" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "assignmentType" TEXT NOT NULL,
    "targetUserId" TEXT,
    "targetClassId" TEXT,
    "targetSchoolId" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChallengeAssignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CounselingSessions" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "counselorId" TEXT NOT NULL,
    "escalationId" TEXT,
    "classId" TEXT,
    "section" TEXT,
    "sessionType" TEXT NOT NULL,
    "level" TEXT,
    "title" TEXT,
    "status" "SessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "notes" TEXT,
    "outcome" TEXT,
    "followUpNeeded" BOOLEAN NOT NULL DEFAULT false,
    "nextSessionAt" TIMESTAMP(3),
    "previousSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CounselingSessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionIntakes" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "basicInfo" JSONB NOT NULL DEFAULT '{}',
    "complaints" JSONB NOT NULL DEFAULT '{}',
    "factors" JSONB NOT NULL DEFAULT '{}',
    "familyHistory" TEXT NOT NULL DEFAULT '',
    "personalHistory" JSONB NOT NULL DEFAULT '{}',
    "sessionReport" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionIntakes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionReports" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "behavioralTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "summary" TEXT NOT NULL DEFAULT '',
    "recommendations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionReports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CounselorAssignments" (
    "id" TEXT NOT NULL,
    "counselorId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "escalationAlertId" TEXT,
    "assignedBy" TEXT,
    "level" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "sessionStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CounselorAssignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserChallenges_userId_challengeId_key" ON "UserChallenges"("userId", "challengeId");

-- CreateIndex
CREATE UNIQUE INDEX "CounselingSessions_escalationId_key" ON "CounselingSessions"("escalationId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionIntakes_sessionId_key" ON "SessionIntakes"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionReports_sessionId_key" ON "SessionReports"("sessionId");

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentMeetings" ADD CONSTRAINT "ParentMeetings_counselorId_fkey" FOREIGN KEY ("counselorId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentMeetings" ADD CONSTRAINT "ParentMeetings_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentMeetings" ADD CONSTRAINT "ParentMeetings_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challenges" ADD CONSTRAINT "Challenges_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challenges" ADD CONSTRAINT "Challenges_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChallenges" ADD CONSTRAINT "UserChallenges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChallenges" ADD CONSTRAINT "UserChallenges_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeAssignments" ADD CONSTRAINT "ChallengeAssignments_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeAssignments" ADD CONSTRAINT "ChallengeAssignments_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeAssignments" ADD CONSTRAINT "ChallengeAssignments_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeAssignments" ADD CONSTRAINT "ChallengeAssignments_targetClassId_fkey" FOREIGN KEY ("targetClassId") REFERENCES "Classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeAssignments" ADD CONSTRAINT "ChallengeAssignments_targetSchoolId_fkey" FOREIGN KEY ("targetSchoolId") REFERENCES "Schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CounselingSessions" ADD CONSTRAINT "CounselingSessions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CounselingSessions" ADD CONSTRAINT "CounselingSessions_counselorId_fkey" FOREIGN KEY ("counselorId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CounselingSessions" ADD CONSTRAINT "CounselingSessions_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CounselingSessions" ADD CONSTRAINT "CounselingSessions_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CounselingSessions" ADD CONSTRAINT "CounselingSessions_escalationId_fkey" FOREIGN KEY ("escalationId") REFERENCES "EscalationAlerts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CounselingSessions" ADD CONSTRAINT "CounselingSessions_previousSessionId_fkey" FOREIGN KEY ("previousSessionId") REFERENCES "CounselingSessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionIntakes" ADD CONSTRAINT "SessionIntakes_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CounselingSessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionReports" ADD CONSTRAINT "SessionReports_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CounselingSessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CounselorAssignments" ADD CONSTRAINT "CounselorAssignments_counselorId_fkey" FOREIGN KEY ("counselorId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CounselorAssignments" ADD CONSTRAINT "CounselorAssignments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CounselorAssignments" ADD CONSTRAINT "CounselorAssignments_escalationAlertId_fkey" FOREIGN KEY ("escalationAlertId") REFERENCES "EscalationAlerts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
