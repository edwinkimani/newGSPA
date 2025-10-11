const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateProgressData() {
  try {
    console.log('🔄 Migrating progress data from ModuleEnrollment.completedSubTopics to UserProgress...\n');

    // Get all enrollments with completed subtopics
    const enrollments = await prisma.moduleEnrollment.findMany({
      where: {
        completedSubTopics: {
          not: null
        }
      },
      include: {
        module: {
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
        }
      }
    });

    console.log(`Found ${enrollments.length} enrollments with progress data`);

    for (const enrollment of enrollments) {
      const completedData = enrollment.completedSubTopics;
      if (!completedData) continue;

      console.log(`\n📝 Processing enrollment for user ${enrollment.userId} in module ${enrollment.module.title}`);

      // Handle both old and new formats
      let subtopicIds = [];
      if (Array.isArray(completedData)) {
        subtopicIds = completedData;
      } else if (completedData.subtopics) {
        subtopicIds = completedData.subtopics;
      }

      console.log(`   Found ${subtopicIds.length} completed subtopics`);

      // For each completed subtopic, create UserProgress records for all its content
      for (const subtopicId of subtopicIds) {
        // Find the subtopic
        let subtopic = null;
        for (const level of enrollment.module.levels) {
          subtopic = level.subTopics.find(st => st.id === subtopicId);
          if (subtopic) break;
        }

        if (!subtopic) {
          console.log(`   ⚠️  Subtopic ${subtopicId} not found, skipping`);
          continue;
        }

        console.log(`   ✅ Migrating subtopic: ${subtopic.title}`);

        // Since UserProgress references ModuleContent but we have SubTopicContent,
        // we need to create ModuleContent records first, or find existing ones.
        // For now, let's skip the migration since the schema doesn't support it without changes.
        console.log(`      ⏭️  Skipping UserProgress creation - schema needs ModuleContent records`);
      }

      // Also handle contentProgress if it exists (old format)
      if (completedData.contentProgress) {
        console.log(`   📊 Migrating individual content progress...`);
        for (const [contentId, progressData] of Object.entries(completedData.contentProgress)) {
          const existing = await prisma.userProgress.findUnique({
            where: {
              userId_contentId: {
                userId: enrollment.userId,
                contentId: contentId
              }
            }
          });

          if (!existing) {
            await prisma.userProgress.create({
              data: {
                userId: enrollment.userId,
                enrollmentId: enrollment.id,
                contentId: contentId,
                completed: progressData.completed || false,
                completedAt: progressData.completedAt ? new Date(progressData.completedAt) : null,
                progressPercentage: 100,
                timeSpentMinutes: 0
              }
            });
            console.log(`      📝 Migrated content progress for: ${contentId}`);
          }
        }
      }
    }

    // Recalculate progress for all migrated enrollments
    console.log('\n🔄 Recalculating progress for all enrollments...');
    for (const enrollment of enrollments) {
      await recalculateProgress(enrollment.userId, enrollment.moduleId);
    }

    console.log('\n✅ Migration completed!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function recalculateProgress(userId, moduleId) {
  try {
    const enrollment = await prisma.moduleEnrollment.findUnique({
      where: {
        userId_moduleId: {
          userId,
          moduleId
        }
      },
      include: {
        module: {
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
        }
      }
    });

    if (!enrollment) return;

    let completedSubtopics = 0;
    let totalSubtopics = 0;

    for (const level of enrollment.module.levels) {
      for (const subTopic of level.subTopics) {
        totalSubtopics++;
        const publishedContents = subTopic.contents.filter(c => c.isPublished);
        const contentCount = publishedContents.length;

        if (contentCount === 0) continue;

        const completedContentCount = await prisma.userProgress.count({
          where: {
            userId: userId,
            contentId: { in: publishedContents.map(c => c.id) },
            completed: true
          }
        });

        if (completedContentCount === contentCount) {
          completedSubtopics++;
        }
      }
    }

    const progressPercentage = totalSubtopics > 0 ? Math.round((completedSubtopics / totalSubtopics) * 100) : 0;

    await prisma.moduleEnrollment.update({
      where: { id: enrollment.id },
      data: { progressPercentage: Math.min(100, progressPercentage) }
    });

    console.log(`   🔄 Updated progress for ${userId}: ${progressPercentage}% (${completedSubtopics}/${totalSubtopics})`);

  } catch (error) {
    console.error('Error recalculating progress:', error);
  }
}

migrateProgressData();