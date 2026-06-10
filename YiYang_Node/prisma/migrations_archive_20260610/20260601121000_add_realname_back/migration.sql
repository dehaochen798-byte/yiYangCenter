ALTER TABLE `user`
    ADD COLUMN `realName` VARCHAR(50) NULL;

UPDATE `user`
SET `realName` = `nickName`
WHERE `realName` IS NULL;

ALTER TABLE `user`
    MODIFY COLUMN `realName` VARCHAR(50) NOT NULL;
