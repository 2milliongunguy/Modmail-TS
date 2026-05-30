/*
  Warnings:

  - Added the required column `authorName` to the `message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "guildConfig" ADD COLUMN     "name" TEXT;

-- AlterTable
ALTER TABLE "message" ADD COLUMN     "authorName" TEXT NOT NULL,
ADD COLUMN     "authorProfileLink" TEXT;
