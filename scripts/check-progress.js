const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProgress() {
  try {
    console.log('Checking progress tracking data...\n');

    // Check UserProgress table
    const userProgressCount = await prisma.userProgress.count();
    console.log(`📊 UserProgress records: ${userProgressCount}`);

    if (userProgressCount > 0) {
      const sampleProgress = await prisma.userProgress.findMany({
        take: 3,
        include: {
          enrollment: {
            include: {
              module: true,
              user: true
            }
          }
        }
      });
      console.log('Sample UserProgress records:');
      sampleProgress.forEach(p => {
        console.log(`  - User: ${p.enrollment.user.email}, Module: ${p.enrollment.module.title}, Content: ${p.contentId}, Completed: ${p.completed}`);
      });
    }

    // Check ModuleEnrollment progress
    const enrollments = await prisma.moduleEnrollment.findMany({
      include: {
        module: true,
        user: true
      }
    });

    console.log(`\n📈 Module Enrollments: ${enrollments.length}`);
    enrollments.forEach(e => {
      const completedSubTopics = Array.isArray(e.completedSubTopics)
        ? e.completedSubTopics.length
        : (e.completedSubTopics?.subtopics?.length || 0);
      console.log(`  - User: ${e.user.email}`);
      console.log(`    Module: ${e.module.title}`);
      console.log(`    Progress: ${e.progressPercentage}%`);
      console.log(`    Completed SubTopics: ${completedSubTopics}`);
      console.log(`    Raw completedSubTopics: ${JSON.stringify(e.completedSubTopics)}`);
    });

    // Check test results
    const subTopicTestResults = await prisma.subTopicTestResult.count();
    const levelTestResults = await prisma.levelTestResult.count();

    console.log(`\n📝 Test Results:`);
    console.log(`  - SubTopic Test Results: ${subTopicTestResults}`);
    console.log(`  - Level Test Results: ${levelTestResults}`);

  } catch (error) {
    console.error('Error checking progress:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProgress();