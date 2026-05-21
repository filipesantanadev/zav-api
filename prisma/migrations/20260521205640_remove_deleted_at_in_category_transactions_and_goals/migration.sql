/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `goals` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `transactions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "categories" DROP COLUMN "deleted_at";

-- AlterTable
ALTER TABLE "goals" DROP COLUMN "deleted_at";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "deleted_at";
