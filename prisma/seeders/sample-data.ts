import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Sample test questions
    const questions = [
      {
        question: 'What is the primary purpose of risk assessment in security operations?',
        optionA: 'To increase security budget',
        optionB: 'To identify and evaluate potential threats and vulnerabilities',
        optionC: 'To hire more security personnel',
        optionD: 'To purchase security equipment',
    correctAnswer: 'B',
        category: 'Risk Management',
    difficulty: 'MEDIUM' as any,
        isActive: true
      },
      {
        question: 'Which of the following is NOT a component of physical security?',
        optionA: 'Access control systems',
        optionB: 'Surveillance cameras',
        optionC: 'Social media monitoring',
        optionD: 'Perimeter barriers',
        correctAnswer: 'C',
        category: 'Physical Security',
    difficulty: 'EASY' as any,
        isActive: true
      },
      {
        question: 'What is the first step in creating a security plan?',
        optionA: 'Implement security measures',
        optionB: 'Conduct a threat assessment',
        optionC: 'Train personnel',
        optionD: 'Purchase equipment',
        correctAnswer: 'B',
        category: 'Security Planning',
    difficulty: 'EASY' as any,
        isActive: true
      }
    ]

    for (const q of questions) {
      await prisma.testQuestion.create({ data: {
        question: q.question,
        category: q.category,
        difficulty: q.difficulty,
        isActive: q.isActive,
      }})
    }

    console.log('Created sample test questions')

    // Sample modules
    const modules = [
      {
        title: 'Introduction to Security Management',
        description: 'Learn the fundamentals of security management and risk assessment',
        content: {
          sections: [
            {
              title: 'Understanding Security Management',
              content: "Security management is the identification of an organization's assets..."
            },
            {
              title: 'Risk Assessment Basics',
              content: 'Risk assessment involves identifying potential threats...'
            }
          ]
        },
        order: 1,
        isPublished: true
      },
      {
        title: 'Physical Security Fundamentals',
        description: 'Explore the principles and practices of physical security',
        content: {
          sections: [
            {
              title: 'Access Control Systems',
              content: 'Access control is a fundamental aspect of physical security...'
            },
            {
              title: 'Surveillance Systems',
              content: 'Modern surveillance systems combine various technologies...'
            }
          ]
        },
        order: 2,
        isPublished: true
      }
    ]

    for (const m of modules) {
      await prisma.module.create({ data: {
        title: m.title,
        description: m.description,
        shortDescription: m.description.slice(0, 160),
        category: 'General',
        difficultyLevel: 'BEGINNER',
        price: 0.00,
        createdById: (await prisma.user.findFirst())?.id || '',
        isActive: true,
        isFeatured: false,
      }})
    }

    console.log('Created sample modules')

    console.log('Sample data seeding completed successfully')
  } catch (error) {
    console.error('Error seeding sample data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
