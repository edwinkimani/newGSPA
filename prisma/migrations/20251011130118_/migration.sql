-- AlterTable
ALTER TABLE `ModuleEnrollment` ADD COLUMN `levelTestScores` JSON NULL;

-- CreateTable
CREATE TABLE `LevelTestResult` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `levelTestId` VARCHAR(191) NOT NULL,
    `moduleId` VARCHAR(191) NOT NULL,
    `levelId` VARCHAR(191) NOT NULL,
    `score` INTEGER NOT NULL,
    `totalQuestions` INTEGER NOT NULL,
    `correctAnswers` INTEGER NOT NULL,
    `answers` JSON NOT NULL,
    `passed` BOOLEAN NOT NULL,
    `timeSpent` INTEGER NULL,
    `completedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `LevelTestResult_userId_levelTestId_key`(`userId`, `levelTestId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LevelTestResult` ADD CONSTRAINT `LevelTestResult_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LevelTestResult` ADD CONSTRAINT `LevelTestResult_levelTestId_fkey` FOREIGN KEY (`levelTestId`) REFERENCES `LevelTest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LevelTestResult` ADD CONSTRAINT `LevelTestResult_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `Module`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LevelTestResult` ADD CONSTRAINT `LevelTestResult_levelId_fkey` FOREIGN KEY (`levelId`) REFERENCES `Level`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
