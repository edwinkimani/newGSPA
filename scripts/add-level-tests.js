const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addLevelTests() {
  try {
    console.log('Adding Level Tests for existing levels...');

    // Find all levels that don't have level tests
    const levelsWithoutTests = await prisma.level.findMany({
      where: {
        levelTest: null
      },
      include: {
        module: true,
        subTopics: true
      }
    });

    console.log(`Found ${levelsWithoutTests.length} levels without tests`);

    if (levelsWithoutTests.length === 0) {
      console.log('All levels already have tests!');
      return;
    }

    // Find some questions to use for the tests
    const availableQuestions = await prisma.testQuestion.findMany({
      where: { isActive: true },
      include: { options: true },
      take: 50 // Get enough questions
    });

    console.log(`Found ${availableQuestions.length} available questions`);

    // Find a creator (admin or master practitioner)
    const creator = await prisma.user.findFirst({
      include: {
        profile: {
          include: {
            role: true
          }
        }
      },
      where: {
        profile: {
          role: {
            name: {
              in: ['admin', 'master_practitioner']
            }
          }
        }
      }
    });

    if (!creator) {
      console.log('No admin or master practitioner found. Please run the main seeder first.');
      return;
    }

    console.log('Using creator:', creator.email);

    // Create level tests for each level
    for (const level of levelsWithoutTests) {
      console.log(`Creating test for level: ${level.title}`);

      // Select random questions for this level test (up to 10 questions or available count)
      const questionsForTest = availableQuestions
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(10, availableQuestions.length));

      // Transform questions to the format expected by the test
      const formattedQuestions = questionsForTest.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options.map(opt => ({
          id: opt.id,
          optionText: opt.optionText,
          isCorrect: opt.isCorrect,
          optionLetter: opt.optionLetter
        })).sort((a, b) => a.optionLetter.localeCompare(b.optionLetter))
      }));

      // Create the level test
      const levelTest = await prisma.levelTest.create({
        data: {
          levelId: level.id,
          title: `${level.title} Assessment`,
          description: `Test your knowledge of ${level.title}`,
          questions: formattedQuestions,
          totalQuestions: formattedQuestions.length,
          passingScore: 70,
          timeLimit: 1800, // 30 minutes
          isActive: true
        }
      });

      console.log(`Created level test: ${levelTest.id} for level: ${level.title}`);
    }

    console.log('Successfully added level tests for all levels!');

  } catch (error) {
    console.error('Error adding level tests:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addLevelTests();