const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkModules() {
  try {
    console.log('Checking modules...');

    const modules = await prisma.module.findMany({
      select: {
        id: true,
        title: true,
        isActive: true
      }
    });

    console.log(`Found ${modules.length} modules:`);
    modules.forEach(module => {
      console.log(`  - ID: ${module.id}`);
      console.log(`    Title: ${module.title}`);
      console.log(`    Active: ${module.isActive}`);
      console.log('');
    });

    // Check specific module
    const specificModule = await prisma.module.findUnique({
      where: { id: 'module-digital-forensics' },
      select: {
        id: true,
        title: true,
        isActive: true
      }
    });

    if (specificModule) {
      console.log('✅ Module "module-digital-forensics" exists:', specificModule);
    } else {
      console.log('❌ Module "module-digital-forensics" not found');
    }

  } catch (error) {
    console.error('Error checking modules:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkModules();