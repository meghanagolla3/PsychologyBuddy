-- AlterTable
ALTER TABLE "Streaks" ADD COLUMN     "bestStreak" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "CounselorNotifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "alertId" TEXT,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "CounselorNotifications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CounselorNotifications" ADD CONSTRAINT "CounselorNotifications_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "EscalationAlerts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CounselorNotifications" ADD CONSTRAINT "CounselorNotifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
