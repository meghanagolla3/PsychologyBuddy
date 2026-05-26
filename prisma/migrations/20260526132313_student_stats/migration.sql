-- AlterTable
ALTER TABLE "CounselorProfiles" ADD COLUMN     "availability" TEXT,
ADD COLUMN     "specialization" TEXT;

-- CreateTable
CREATE TABLE "ParentNotifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "meetingId" TEXT,
    "relatedUserId" TEXT,

    CONSTRAINT "ParentNotifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessages" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "schoolName" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ParentNotifications" ADD CONSTRAINT "ParentNotifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
