-- CreateTable
CREATE TABLE "CounselorProfiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "department" TEXT NOT NULL DEFAULT 'Student Counseling',
    "profileImageUrl" TEXT,

    CONSTRAINT "CounselorProfiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CounselorProfiles_userId_key" ON "CounselorProfiles"("userId");

-- AddForeignKey
ALTER TABLE "CounselorProfiles" ADD CONSTRAINT "CounselorProfiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
