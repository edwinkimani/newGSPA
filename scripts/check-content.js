const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkContent() {
  try {
    console.log('Checking content for subtopics...\n');

    const subtopics = await prisma.subTopic.findMany({
      where: {
        level: {
          module: {
            id: 'module-digital-forensics'
          }
        }
      },
      include: {
        contents: true
      }
    });

    console.log(`Found ${subtopics.length} subtopics in Digital Forensics module:`);

    for (const subtopic of subtopics) {
      console.log(`\n📚 Subtopic: ${subtopic.title} (${subtopic.id})`);
      console.log(`   Contents: ${subtopic.contents.length}`);

      subtopic.contents.forEach(content => {
        console.log(`     - ${content.title} (${content.id}) - Published: ${content.isPublished}`);
      });
    }

    // Check what content IDs are in the old progress data
    const enrollment = await prisma.moduleEnrollment.findFirst({
      where: {
        moduleId: 'module-digital-forensics',
        completedSubTopics: {
          not: null
        }
      }
    });

    if (enrollment && enrollment.completedSubTopics) {
      const completedData = enrollment.completedSubTopics;
      console.log('\n📊 Old progress data:');
      console.log(JSON.stringify(completedData, null, 2));
    }

  } catch (error) {
    console.error('Error checking content:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkContent();