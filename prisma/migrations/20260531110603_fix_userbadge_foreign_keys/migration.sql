-- DropForeignKey
ALTER TABLE "UserBadges" DROP CONSTRAINT "UserBadges_userId_fkey";

-- RenameForeignKey
ALTER TABLE "UserBadges" RENAME CONSTRAINT "UserBadges_userId_fkey2" TO "UserBadges_userId_fkey";
