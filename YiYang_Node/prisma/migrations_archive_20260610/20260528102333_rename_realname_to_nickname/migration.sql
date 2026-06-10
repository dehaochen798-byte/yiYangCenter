/*
  Warnings:

  - You are about to drop the column `realName` on the `user` table. All the data in the column will be lost.
  - Added the required column `nickName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `realName`,
    ADD COLUMN `nickName` VARCHAR(50) NOT NULL;
