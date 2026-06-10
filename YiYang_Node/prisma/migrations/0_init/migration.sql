-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mobile` VARCHAR(20) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `realName` VARCHAR(50) NOT NULL,
    `nickName` VARCHAR(50) NOT NULL,
    `age` INTEGER NOT NULL,
    `gender` ENUM('MALE', 'FEMALE') NOT NULL,
    `status` ENUM('ACTIVE', 'DISABLED') NOT NULL DEFAULT 'ACTIVE',
    `roleName` VARCHAR(50) NULL,
    `departmentName` VARCHAR(50) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_mobile_key`(`mobile`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Resident` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `currentBedId` INTEGER NULL,
    `careLevelId` INTEGER NULL,
    `fullName` VARCHAR(50) NOT NULL,
    `age` INTEGER NOT NULL,
    `gender` ENUM('MALE', 'FEMALE') NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `idCard` VARCHAR(30) NULL,
    `emergencyContactName` VARCHAR(50) NULL,
    `emergencyContactPhone` VARCHAR(20) NULL,
    `status` ENUM('PENDING', 'ACTIVE', 'CHECKED_OUT') NOT NULL DEFAULT 'PENDING',
    `note` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Resident_currentBedId_key`(`currentBedId`),
    UNIQUE INDEX `Resident_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Room` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `building` VARCHAR(50) NULL,
    `roomNo` VARCHAR(30) NOT NULL,
    `floor` INTEGER NOT NULL,
    `roomType` VARCHAR(50) NULL,
    `bedCount` INTEGER NOT NULL,
    `description` VARCHAR(255) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Room_roomNo_key`(`roomNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Bed` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roomId` INTEGER NOT NULL,
    `bedNo` VARCHAR(30) NOT NULL,
    `label` VARCHAR(50) NULL,
    `status` ENUM('VACANT', 'OCCUPIED', 'DISABLED') NOT NULL DEFAULT 'VACANT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isDelete` BOOLEAN NOT NULL DEFAULT false,
    `deleteAt` DATETIME(3) NULL,
    `deleteVersion` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `Bed_roomId_bedNo_deleteVersion_key`(`roomId`, `bedNo`, `deleteVersion`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MealPlan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `residentId` INTEGER NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `dietaryRestrictions` VARCHAR(255) NULL,
    `allergens` VARCHAR(255) NULL,
    `nutritionTags` VARCHAR(255) NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MealCalendar` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campus` VARCHAR(50) NULL,
    `weekLabel` VARCHAR(50) NOT NULL,
    `weekStartDate` DATETIME(3) NOT NULL,
    `monday` VARCHAR(255) NULL,
    `tuesday` VARCHAR(255) NULL,
    `wednesday` VARCHAR(255) NULL,
    `thursday` VARCHAR(255) NULL,
    `friday` VARCHAR(255) NULL,
    `saturday` VARCHAR(255) NULL,
    `sunday` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CheckIn` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `residentId` INTEGER NOT NULL,
    `bedId` INTEGER NOT NULL,
    `checkInAt` DATETIME(3) NOT NULL,
    `note` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CheckOut` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `residentId` INTEGER NOT NULL,
    `bedId` INTEGER NULL,
    `checkOutAt` DATETIME(3) NOT NULL,
    `reason` TEXT NULL,
    `handoverNote` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Outing` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `residentId` INTEGER NOT NULL,
    `startAt` DATETIME(3) NOT NULL,
    `expectedReturnAt` DATETIME(3) NULL,
    `actualReturnAt` DATETIME(3) NULL,
    `destination` VARCHAR(255) NULL,
    `reason` VARCHAR(255) NULL,
    `status` ENUM('PENDING', 'OUTING', 'RETURNED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServiceTarget` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `residentId` INTEGER NOT NULL,
    `managerUserId` INTEGER NULL,
    `managerName` VARCHAR(50) NOT NULL,
    `managerMobile` VARCHAR(20) NOT NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `relationNote` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServiceFocus` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `residentId` INTEGER NOT NULL,
    `serviceName` VARCHAR(100) NOT NULL,
    `detail` TEXT NULL,
    `serviceStartAt` DATETIME(3) NULL,
    `serviceEndAt` DATETIME(3) NULL,
    `status` ENUM('ACTIVE', 'PAUSED', 'ENDED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CareLevel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(30) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CareLevel_code_key`(`code`),
    UNIQUE INDEX `CareLevel_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CareItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `careLevelId` INTEGER NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `frequency` VARCHAR(50) NULL,
    `durationMinutes` INTEGER NULL,
    `instructions` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CareRecord` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `residentId` INTEGER NOT NULL,
    `careItemId` INTEGER NOT NULL,
    `operatorId` INTEGER NOT NULL,
    `executedAt` DATETIME(3) NOT NULL,
    `note` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Resident` ADD CONSTRAINT `Resident_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Resident` ADD CONSTRAINT `Resident_currentBedId_fkey` FOREIGN KEY (`currentBedId`) REFERENCES `Bed`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Resident` ADD CONSTRAINT `Resident_careLevelId_fkey` FOREIGN KEY (`careLevelId`) REFERENCES `CareLevel`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bed` ADD CONSTRAINT `Bed_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MealPlan` ADD CONSTRAINT `MealPlan_residentId_fkey` FOREIGN KEY (`residentId`) REFERENCES `Resident`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CheckIn` ADD CONSTRAINT `CheckIn_residentId_fkey` FOREIGN KEY (`residentId`) REFERENCES `Resident`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CheckIn` ADD CONSTRAINT `CheckIn_bedId_fkey` FOREIGN KEY (`bedId`) REFERENCES `Bed`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CheckOut` ADD CONSTRAINT `CheckOut_residentId_fkey` FOREIGN KEY (`residentId`) REFERENCES `Resident`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CheckOut` ADD CONSTRAINT `CheckOut_bedId_fkey` FOREIGN KEY (`bedId`) REFERENCES `Bed`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Outing` ADD CONSTRAINT `Outing_residentId_fkey` FOREIGN KEY (`residentId`) REFERENCES `Resident`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceTarget` ADD CONSTRAINT `ServiceTarget_residentId_fkey` FOREIGN KEY (`residentId`) REFERENCES `Resident`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceTarget` ADD CONSTRAINT `ServiceTarget_managerUserId_fkey` FOREIGN KEY (`managerUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceFocus` ADD CONSTRAINT `ServiceFocus_residentId_fkey` FOREIGN KEY (`residentId`) REFERENCES `Resident`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CareItem` ADD CONSTRAINT `CareItem_careLevelId_fkey` FOREIGN KEY (`careLevelId`) REFERENCES `CareLevel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CareRecord` ADD CONSTRAINT `CareRecord_residentId_fkey` FOREIGN KEY (`residentId`) REFERENCES `Resident`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CareRecord` ADD CONSTRAINT `CareRecord_careItemId_fkey` FOREIGN KEY (`careItemId`) REFERENCES `CareItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CareRecord` ADD CONSTRAINT `CareRecord_operatorId_fkey` FOREIGN KEY (`operatorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

