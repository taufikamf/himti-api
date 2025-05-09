/*
  Warnings:

  - A unique constraint covering the columns `[division,department_id]` on the table `t_division` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('LEAD', 'SECRETARY', 'STAFF');

-- AlterTable
ALTER TABLE "t_member" ADD COLUMN     "role" "MemberRole" NOT NULL DEFAULT 'STAFF';

-- CreateIndex
CREATE UNIQUE INDEX "t_division_division_department_id_key" ON "t_division"("division", "department_id");
