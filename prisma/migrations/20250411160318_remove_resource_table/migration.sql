/*
  Warnings:

  - You are about to drop the `Embedding` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Resource` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Embedding" DROP CONSTRAINT "Embedding_resourceId_fkey";

-- DropTable
DROP TABLE "Embedding";

-- DropTable
DROP TABLE "Resource";
