-- CreateTable
CREATE TABLE "t_media" (
    "id" TEXT NOT NULL,
    "url" VARCHAR NOT NULL,
    "filename" VARCHAR NOT NULL,
    "mimetype" VARCHAR NOT NULL,
    "size" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "t_media_pkey" PRIMARY KEY ("id")
);
