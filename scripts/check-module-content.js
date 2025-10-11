const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkModuleContent() {
  try {
    console.log('Checking ModuleContent vs SubTopicContent...\n');

    // Check ModuleContent
    const moduleContents = await prisma.moduleContent.findMany({
      where: {
        level: {
          moduleId: 'module-digital-forensics'
        }
      },
      include: {
        level: true
      }
    });

    console.log(`ModuleContent records: ${moduleContents.length}`);
    moduleContents.forEach(mc => {
      console.log(`  - ${mc.title} (${mc.id}) - Level: ${mc.level.title}`);
    });

    // Check SubTopicContent
    const subTopicContents = await prisma.subTopicContent.findMany({
      where: {
        subTopic: {
          level: {
            moduleId: 'module-digital-forensics'
          }
        }
      },
      include: {
        subTopic: true
      }
    });

    console.log(`\nSubTopicContent records: ${subTopicContents.length}`);
    subTopicContents.forEach(stc => {
      console.log(`  - ${stc.title} (${stc.id}) - SubTopic: ${stc.subTopic.title}`);
    });

    // Check if the old progress content ID exists in either table
    const oldContentId = '83a5ac84-6427-4561-b233-001529603690';

    const moduleContentExists = await prisma.moduleContent.findUnique({
      where: { id: oldContentId }
    });

    const subTopicContentExists = await prisma.subTopicContent.findUnique({
      where: { id: oldContentId }
    });

    console.log(`\nChecking content ID ${oldContentId}:`);
    console.log(`  - Exists in ModuleContent: ${!!moduleContentExists}`);
    console.log(`  - Exists in SubTopicContent: ${!!subTopicContentExists}`);

  } catch (error) {
    console.error('Error checking content:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkModuleContent();