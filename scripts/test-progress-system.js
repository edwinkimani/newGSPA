const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testProgressSystem() {
  try {
    console.log('🧪 Testing new UserProgress-based system...\n');

    // Get a test user with enrollment
    const testUser = await prisma.user.findFirst({
      where: {
        enrollments: {
          some: {
            moduleId: 'module-digital-forensics'
          }
        }
      },
      select: { id: true, email: true }
    });

    if (!testUser) {
      console.log('❌ No test user found with Digital Forensics enrollment');
      return;
    }

    console.log(`👤 Test User: ${testUser.email} (${testUser.id})`);

    // Check UserProgress records for this user
    const userProgressRecords = await prisma.userProgress.count({
      where: { userId: testUser.id }
    });

    console.log(`📊 UserProgress records: ${userProgressRecords}`);

    // Check enrollment progress
    const enrollment = await prisma.moduleEnrollment.findFirst({
      where: {
        userId: testUser.id,
        moduleId: 'module-digital-forensics'
      }
    });

    if (enrollment) {
      console.log(`📈 Enrollment Progress: ${enrollment.progressPercentage}%`);
      console.log(`📝 Completed SubTopics (legacy): ${JSON.stringify(enrollment.completedSubTopics)}`);
    }

    // Simulate subtopic completion check
    console.log('\n🔍 Testing subtopic completion logic...');

    const module = await prisma.module.findUnique({
      where: { id: 'module-digital-forensics' },
      include: {
        levels: {
          include: {
            subTopics: {
              include: {
                contents: true
              }
            }
          }
        }
      }
    });

    if (!module) {
      console.log('❌ Module not found');
      return;
    }

    // Count total subtopics
    let totalSubtopics = 0;
    for (const level of module.levels) {
      totalSubtopics += level.subTopics.length;
    }

    // Count completed subtopics from JSON field
    const completedData = enrollment.completedSubTopics;
    const completedSubtopics = Array.isArray(completedData)
      ? completedData.length
      : (completedData?.subtopics || []).length;

    console.log(`🔍 Testing subtopic completion parsing...`);
    console.log(`   Raw completedData: ${JSON.stringify(completedData)}`);
    console.log(`   Is Array: ${Array.isArray(completedData)}`);
    if (!Array.isArray(completedData) && completedData?.subtopics) {
      console.log(`   Subtopics array: ${JSON.stringify(completedData.subtopics)}`);
    }

    const calculatedProgress = totalSubtopics > 0 ? Math.round((completedSubtopics / totalSubtopics) * 100) : 0;

    console.log(`\n📊 Summary:`);
    console.log(`   Total Subtopics: ${totalSubtopics}`);
    console.log(`   Completed Subtopics: ${completedSubtopics}`);
    console.log(`   Calculated Progress: ${calculatedProgress}%`);
    console.log(`   Stored Progress: ${enrollment?.progressPercentage || 0}%`);

    if (calculatedProgress === (enrollment?.progressPercentage || 0)) {
      console.log('✅ Progress calculation matches!');
    } else {
      console.log('❌ Progress mismatch - system needs fixing');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testProgressSystem();