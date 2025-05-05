/*
  Warnings:

  - You are about to drop the `Article` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ArticleLike` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BankData` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Department` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Division` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Event` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Forum` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ForumComment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ForumLike` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Gallery` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Member` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Article" DROP CONSTRAINT "Article_author_id_fkey";

-- DropForeignKey
ALTER TABLE "ArticleLike" DROP CONSTRAINT "ArticleLike_article_id_fkey";

-- DropForeignKey
ALTER TABLE "ArticleLike" DROP CONSTRAINT "ArticleLike_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Division" DROP CONSTRAINT "Division_department_id_fkey";

-- DropForeignKey
ALTER TABLE "Forum" DROP CONSTRAINT "Forum_author_id_fkey";

-- DropForeignKey
ALTER TABLE "ForumComment" DROP CONSTRAINT "ForumComment_forum_id_fkey";

-- DropForeignKey
ALTER TABLE "ForumComment" DROP CONSTRAINT "ForumComment_user_id_fkey";

-- DropForeignKey
ALTER TABLE "ForumLike" DROP CONSTRAINT "ForumLike_forum_id_fkey";

-- DropForeignKey
ALTER TABLE "ForumLike" DROP CONSTRAINT "ForumLike_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Gallery" DROP CONSTRAINT "Gallery_event_id_fkey";

-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_division_id_fkey";

-- DropTable
DROP TABLE "Article";

-- DropTable
DROP TABLE "ArticleLike";

-- DropTable
DROP TABLE "BankData";

-- DropTable
DROP TABLE "Department";

-- DropTable
DROP TABLE "Division";

-- DropTable
DROP TABLE "Event";

-- DropTable
DROP TABLE "Forum";

-- DropTable
DROP TABLE "ForumComment";

-- DropTable
DROP TABLE "ForumLike";

-- DropTable
DROP TABLE "Gallery";

-- DropTable
DROP TABLE "Member";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "t_user" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "email" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "password" VARCHAR NOT NULL,
    "profile_picture" VARCHAR,
    "otp" VARCHAR,
    "otpExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "t_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_member" (
    "id" TEXT NOT NULL,
    "division_id" TEXT,
    "name" VARCHAR NOT NULL,
    "photo" VARCHAR,
    "position" VARCHAR NOT NULL,

    CONSTRAINT "t_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_division" (
    "id" TEXT NOT NULL,
    "department_id" TEXT,
    "division" VARCHAR NOT NULL,

    CONSTRAINT "t_division_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_department" (
    "id" TEXT NOT NULL,
    "department" VARCHAR NOT NULL,

    CONSTRAINT "t_department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_event" (
    "id" TEXT NOT NULL,
    "name" VARCHAR NOT NULL,

    CONSTRAINT "t_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_gallery" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "photo_url" VARCHAR NOT NULL,

    CONSTRAINT "t_gallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_forum" (
    "id" TEXT NOT NULL,
    "title" VARCHAR NOT NULL,
    "thumbnail" VARCHAR NOT NULL,
    "author_id" TEXT NOT NULL,
    "content" VARCHAR NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ForumStatus" NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "t_forum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_forum_like" (
    "id" TEXT NOT NULL,
    "forum_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "t_forum_like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_forum_comment" (
    "id" TEXT NOT NULL,
    "forum_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "comments" VARCHAR NOT NULL,

    CONSTRAINT "t_forum_comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_article" (
    "id" TEXT NOT NULL,
    "title" VARCHAR NOT NULL,
    "content" VARCHAR NOT NULL,
    "thumbnail" VARCHAR NOT NULL,
    "author" VARCHAR NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "author_id" TEXT NOT NULL,

    CONSTRAINT "t_article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_article_like" (
    "id" TEXT NOT NULL,
    "article_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "t_article_like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_bank_data" (
    "id" TEXT NOT NULL,
    "title" VARCHAR NOT NULL,
    "link" VARCHAR NOT NULL,

    CONSTRAINT "t_bank_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "t_user_email_key" ON "t_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "t_forum_like_forum_id_user_id_key" ON "t_forum_like"("forum_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "t_article_like_article_id_user_id_key" ON "t_article_like"("article_id", "user_id");

-- AddForeignKey
ALTER TABLE "t_member" ADD CONSTRAINT "t_member_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "t_division"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_division" ADD CONSTRAINT "t_division_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "t_department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_gallery" ADD CONSTRAINT "t_gallery_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "t_event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_forum" ADD CONSTRAINT "t_forum_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "t_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_forum_like" ADD CONSTRAINT "t_forum_like_forum_id_fkey" FOREIGN KEY ("forum_id") REFERENCES "t_forum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_forum_like" ADD CONSTRAINT "t_forum_like_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "t_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_forum_comment" ADD CONSTRAINT "t_forum_comment_forum_id_fkey" FOREIGN KEY ("forum_id") REFERENCES "t_forum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_forum_comment" ADD CONSTRAINT "t_forum_comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "t_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_article" ADD CONSTRAINT "t_article_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "t_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_article_like" ADD CONSTRAINT "t_article_like_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "t_article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_article_like" ADD CONSTRAINT "t_article_like_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "t_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
