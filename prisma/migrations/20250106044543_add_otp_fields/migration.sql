/*
  Warnings:

  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "otp" VARCHAR,
ADD COLUMN     "otpExpiry" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- Then, update existing rows with a default value for updatedAt
UPDATE "User" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;

-- Finally, make updatedAt required
ALTER TABLE "User" ALTER COLUMN "updatedAt" SET NOT NULL;
