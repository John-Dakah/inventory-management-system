/*
  Warnings:

  - Added the required column `department` to the `OUR_USER` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OUR_USER" ADD COLUMN     "department" TEXT NOT NULL;
