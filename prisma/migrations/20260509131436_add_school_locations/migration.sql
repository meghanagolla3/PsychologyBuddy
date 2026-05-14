/*
  Warnings:

  - You are about to drop the column `bestStreak` on the `Streaks` table. All the data in the column will be lost.
  - You are about to drop the `CounselorProfiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ParentProfiles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CounselorProfiles" DROP CONSTRAINT "CounselorProfiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "ParentProfiles" DROP CONSTRAINT "ParentProfiles_userId_fkey";

-- AlterTable
ALTER TABLE "Classes" ADD COLUMN     "locationId" TEXT;

-- AlterTable
ALTER TABLE "Streaks" DROP COLUMN "bestStreak";

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "locationId" TEXT;

-- DropTable
DROP TABLE "CounselorProfiles";

-- DropTable
DROP TABLE "ParentProfiles";

-- CreateTable
CREATE TABLE "SchoolLocations" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postalCode" TEXT,
    "notes" TEXT,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolLocations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "SchoolLocations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolLocations" ADD CONSTRAINT "SchoolLocations_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classes" ADD CONSTRAINT "Classes_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "SchoolLocations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
