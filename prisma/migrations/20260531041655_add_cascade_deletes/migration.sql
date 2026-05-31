-- DropForeignKey
ALTER TABLE `booking` DROP FOREIGN KEY `Booking_houseId_fkey`;

-- DropForeignKey
ALTER TABLE `booking` DROP FOREIGN KEY `Booking_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `contract` DROP FOREIGN KEY `Contract_houseId_fkey`;

-- DropForeignKey
ALTER TABLE `contract` DROP FOREIGN KEY `Contract_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `favorite` DROP FOREIGN KEY `Favorite_houseId_fkey`;

-- DropForeignKey
ALTER TABLE `favorite` DROP FOREIGN KEY `Favorite_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `house` DROP FOREIGN KEY `House_landlordId_fkey`;

-- DropForeignKey
ALTER TABLE `payment` DROP FOREIGN KEY `Payment_userId_fkey`;

-- DropForeignKey
ALTER TABLE `viewhistory` DROP FOREIGN KEY `ViewHistory_houseId_fkey`;

-- DropForeignKey
ALTER TABLE `viewhistory` DROP FOREIGN KEY `ViewHistory_studentId_fkey`;

-- AddForeignKey
ALTER TABLE `House` ADD CONSTRAINT `House_landlordId_fkey` FOREIGN KEY (`landlordId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_houseId_fkey` FOREIGN KEY (`houseId`) REFERENCES `House`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contract` ADD CONSTRAINT `Contract_houseId_fkey` FOREIGN KEY (`houseId`) REFERENCES `House`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contract` ADD CONSTRAINT `Contract_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favorite` ADD CONSTRAINT `Favorite_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favorite` ADD CONSTRAINT `Favorite_houseId_fkey` FOREIGN KEY (`houseId`) REFERENCES `House`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ViewHistory` ADD CONSTRAINT `ViewHistory_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ViewHistory` ADD CONSTRAINT `ViewHistory_houseId_fkey` FOREIGN KEY (`houseId`) REFERENCES `House`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
