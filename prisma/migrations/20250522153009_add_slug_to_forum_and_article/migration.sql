/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `t_article` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `t_forum` will be added. If there are existing duplicate values, this will fail.

*/
-- First add the column as nullable
ALTER TABLE "t_article" ADD COLUMN "slug" VARCHAR;
ALTER TABLE "t_forum" ADD COLUMN "slug" VARCHAR;

-- Update existing records with a slug generated from id and title
UPDATE "t_article" SET "slug" = CONCAT(LOWER(REPLACE(title, ' ', '-')), '-', id) WHERE "slug" IS NULL;
UPDATE "t_forum" SET "slug" = CONCAT(LOWER(REPLACE(title, ' ', '-')), '-', id) WHERE "slug" IS NULL;

-- Make the column required
ALTER TABLE "t_article" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "t_forum" ALTER COLUMN "slug" SET NOT NULL;

-- Create unique indexes
CREATE UNIQUE INDEX "t_article_slug_key" ON "t_article"("slug");
CREATE UNIQUE INDEX "t_forum_slug_key" ON "t_forum"("slug");
