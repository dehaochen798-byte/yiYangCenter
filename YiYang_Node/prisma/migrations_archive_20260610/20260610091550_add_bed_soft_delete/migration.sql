/*
  Warnings:

  - You are about to drop the column `isOccupied` on the `bed` table. All the data in the column will be lost.
  - You are about to drop the column `endAt` on the `outing` table. All the data in the column will be lost.
  - The values [APPROVED] on the enum `Outing_status` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[roomId,bedNo,deleteVersion]` on the table `Bed` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `CareLevel` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[currentBedId]` on the table `Resident` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `CareLevel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weekStartDate` to the `MealCalendar` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `bed` DROP FOREIGN KEY `Bed_roomId_fkey`;

-- DropIndex
DROP INDEX `Bed_roomId_bedNo_key` ON `bed`;

-- AlterTable
ALTER TABLE `bed` DROP COLUMN `isOccupied`,
    ADD COLUMN `deleteAt` DATETIME(3) NULL,
    ADD COLUMN `deleteVersion` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `isDelete` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `label` VARCHAR(50) NULL,
    ADD COLUMN `status` ENUM('VACANT', 'OCCUPIED', 'DISABLED') NOT NULL DEFAULT 'VACANT';

-- AlterTable
ALTER TABLE `careitem` ADD COLUMN `durationMinutes` INTEGER NULL,
    ADD COLUMN `frequency` VARCHAR(50) NULL,
    ADD COLUMN `instructions` TEXT NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `carelevel` ADD COLUMN `code` VARCHAR(30) NOT NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `checkout` ADD COLUMN `bedId` INTEGER NULL,
    ADD COLUMN `handoverNote` TEXT NULL;

-- AlterTable
ALTER TABLE `mealcalendar` ADD COLUMN `campus` VARCHAR(50) NULL,
    ADD COLUMN `weekStartDate` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `mealplan` ADD COLUMN `allergens` VARCHAR(255) NULL,
    ADD COLUMN `dietaryRestrictions` VARCHAR(255) NULL,
    ADD COLUMN `endDate` DATETIME(3) NULL,
    ADD COLUMN `nutritionTags` VARCHAR(255) NULL,
    ADD COLUMN `startDate` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `outing` DROP COLUMN `endAt`,
    ADD COLUMN `actualReturnAt` DATETIME(3) NULL,
    ADD COLUMN `expectedReturnAt` DATETIME(3) NULL,
    ADD COLUMN `reason` VARCHAR(255) NULL,
    MODIFY `status` ENUM('PENDING', 'OUTING', 'RETURNED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `resident` ADD COLUMN `careLevelId` INTEGER NULL,
    ADD COLUMN `currentBedId` INTEGER NULL,
    ADD COLUMN `emergencyContactName` VARCHAR(50) NULL,
    ADD COLUMN `emergencyContactPhone` VARCHAR(20) NULL,
    ADD COLUMN `idCard` VARCHAR(30) NULL;

-- AlterTable
ALTER TABLE `room` ADD COLUMN `building` VARCHAR(50) NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `roomType` VARCHAR(50) NULL;

-- AlterTable
ALTER TABLE `servicefocus` ADD COLUMN `serviceEndAt` DATETIME(3) NULL,
    ADD COLUMN `serviceStartAt` DATETIME(3) NULL,
    ADD COLUMN `status` ENUM('ACTIVE', 'PAUSED', 'ENDED') NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE `servicetarget` ADD COLUMN `endDate` DATETIME(3) NULL,
    ADD COLUMN `managerUserId` INTEGER NULL,
    ADD COLUMN `startDate` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `departmentName` VARCHAR(50) NULL,
    ADD COLUMN `roleName` VARCHAR(50) NULL,
    ADD COLUMN `status` ENUM('ACTIVE', 'DISABLED') NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE UNIQUE INDEX `Bed_roomId_bedNo_deleteVersion_key` ON `Bed`(`roomId`, `bedNo`, `deleteVersion`);

-- CreateIndex
CREATE UNIQUE INDEX `CareLevel_code_key` ON `CareLevel`(`code`);

-- CreateIndex
CREATE UNIQUE INDEX `Resident_currentBedId_key` ON `Resident`(`currentBedId`);

-- AddForeignKey
ALTER TABLE `Resident` ADD CONSTRAINT `Resident_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Resident` ADD CONSTRAINT `Resident_currentBedId_fkey` FOREIGN KEY (`currentBedId`) REFERENCES `Bed`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Resident` ADD CONSTRAINT `Resident_careLevelId_fkey` FOREIGN KEY (`careLevelId`) REFERENCES `CareLevel`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CheckOut` ADD CONSTRAINT `CheckOut_bedId_fkey` FOREIGN KEY (`bedId`) REFERENCES `Bed`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceTarget` ADD CONSTRAINT `ServiceTarget_managerUserId_fkey` FOREIGN KEY (`managerUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
