-- CreateTable
CREATE TABLE "ParentProfiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "childName" TEXT NOT NULL,
    "childClass" TEXT NOT NULL,

    CONSTRAINT "ParentProfiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ParentProfiles_userId_key" ON "ParentProfiles"("userId");

-- AddForeignKey
ALTER TABLE "ParentProfiles" ADD CONSTRAINT "ParentProfiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
