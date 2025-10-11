const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkLevels() {
  try {
    console.log('Checking levels...');

    const levels = await prisma.level.findMany({
      include: {
        module: true,
        levelTest: true
      }
    });

    console.log(`Found ${levels.length} levels:`);
    levels.forEach(level => {
      console.log(`- ${level.title} (Module: ${level.module.title}) - Has Test: ${!!level.levelTest}`);
    });

  } catch (error) {
    console.error('Error checking levels:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLevels();