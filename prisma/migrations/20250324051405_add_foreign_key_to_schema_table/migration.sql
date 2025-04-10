/*
  Warnings:

  - Added the required column `serviceId` to the `Schema` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Schema" ADD COLUMN     "serviceId" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "Schema" ADD CONSTRAINT "Schema_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
