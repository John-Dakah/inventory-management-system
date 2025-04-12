/*
  Warnings:

  - Added the required column `address` to the `Supplier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `notes` to the `Supplier` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OUR_USER" ALTER COLUMN "department" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT NOT NULL;
