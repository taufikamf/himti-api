/*
  Warnings:

  - The `status` column on the `Forum` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ForumStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'REJECTED');

-- AlterTable
ALTER TABLE "Forum" DROP COLUMN "status",
ADD COLUMN     "status" "ForumStatus" NOT NULL DEFAULT 'DRAFT';
