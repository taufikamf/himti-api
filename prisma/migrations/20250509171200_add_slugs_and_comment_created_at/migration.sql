-- AlterTable
ALTER TABLE "t_department" ADD COLUMN     "slug" VARCHAR;

-- AlterTable
ALTER TABLE "t_division" ADD COLUMN     "slug" VARCHAR;

-- AlterTable
ALTER TABLE "t_forum_comment" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
