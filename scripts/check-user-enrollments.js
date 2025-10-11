const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserEnrollments() {
  try {
    const userId = '77101e23-0ca6-4e3b-90bf-0fd8f97b7d08';

    console.log(`Checking enrollments for user: ${userId}`);

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`User: ${user.email}`);

    // Find enrollments
    const enrollments = await prisma.moduleEnrollment.findMany({
      where: { userId: userId },
      include: {
        module: {
          select: { id: true, title: true }
        }
      }
    });

    console.log(`\n📋 Enrollments: ${enrollments.length}`);
    enrollments.forEach(e => {
      console.log(`  - Module: ${e.module.title} (${e.module.id})`);
      console.log(`    Progress: ${e.progressPercentage}%`);
      console.log(`    Payment: ${e.paymentStatus}`);
      console.log('');
    });

    // Check if user has enrollment for digital forensics
    const digitalForensicsEnrollment = enrollments.find(e => e.module.id === 'module-digital-forensics');
    if (digitalForensicsEnrollment) {
      console.log('✅ User has enrollment for Digital Forensics');
    } else {
      console.log('❌ User does NOT have enrollment for Digital Forensics');
      console.log('Creating enrollment...');

      // Create enrollment
      const newEnrollment = await prisma.moduleEnrollment.create({
        data: {
          userId: userId,
          moduleId: 'module-digital-forensics',
          paymentStatus: 'COMPLETED',
          progressPercentage: 0
        }
      });

      console.log('✅ Created enrollment:', newEnrollment.id);
    }

  } catch (error) {
    console.error('Error checking user enrollments:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserEnrollments();