CREATE TABLE `AuditLog` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `eventId` VARCHAR(80) NOT NULL,
  `eventType` VARCHAR(100) NOT NULL,
  `module` VARCHAR(50) NOT NULL,
  `action` VARCHAR(50) NOT NULL,
  `summary` VARCHAR(255) NOT NULL,
  `payload` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `AuditLog_eventId_key`(`eventId`),
  INDEX `AuditLog_eventType_createdAt_idx`(`eventType`, `createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
