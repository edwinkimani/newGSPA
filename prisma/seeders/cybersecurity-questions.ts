import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Starting cybersecurity questions seeding...')

    // First, create a cybersecurity module if it doesn't exist
    let cybersecurityModule = await prisma.module.findFirst({
      where: { title: 'Cybersecurity Fundamentals' }
    })

    if (!cybersecurityModule) {
      cybersecurityModule = await prisma.module.create({
        data: {
          title: 'Cybersecurity Fundamentals',
          description: 'Comprehensive introduction to cybersecurity principles, threats, and best practices',
          shortDescription: 'Learn essential cybersecurity concepts and protection strategies',
          category: 'Cybersecurity',
          difficultyLevel: 'BEGINNER',
          price: 99.99,
          currency: 'USD',
          isActive: true,
          isFeatured: true,
          createdById: (await prisma.user.findFirst())?.id || '',
        }
      })
      console.log('Created cybersecurity module')
    }

    // Create a level for the module
    let cybersecurityLevel = await prisma.level.findFirst({
      where: {
        moduleId: cybersecurityModule.id,
        title: 'Basic Cybersecurity Concepts'
      }
    })

    if (!cybersecurityLevel) {
      cybersecurityLevel = await prisma.level.create({
        data: {
          moduleId: cybersecurityModule.id,
          title: 'Basic Cybersecurity Concepts',
          description: 'Fundamental concepts of cybersecurity and information security',
          orderIndex: 1,
          isActive: true,
        }
      })
      console.log('Created cybersecurity level')
    }

    // Create a sub-topic
    let cybersecuritySubTopic = await prisma.subTopic.findFirst({
      where: {
        levelId: cybersecurityLevel.id,
        title: 'Network Security Basics'
      }
    })

    if (!cybersecuritySubTopic) {
      cybersecuritySubTopic = await prisma.subTopic.create({
        data: {
          levelId: cybersecurityLevel.id,
          title: 'Network Security Basics',
          description: 'Understanding network security fundamentals and common threats',
          orderIndex: 1,
          isActive: true,
        }
      })
      console.log('Created cybersecurity sub-topic')
    }

    // Create a sub-topic test
    let cybersecurityTest = await prisma.subTopicTest.findFirst({
      where: { subTopicId: cybersecuritySubTopic.id }
    })

    if (!cybersecurityTest) {
      cybersecurityTest = await prisma.subTopicTest.create({
        data: {
          subTopicId: cybersecuritySubTopic.id,
          title: 'Network Security Fundamentals Quiz',
          description: 'Test your knowledge of basic network security concepts',
          questions: [], // Will be populated with question IDs
          totalQuestions: 0,
          passingScore: 70,
          timeLimit: 600, // 10 minutes
          isActive: true,
        }
      })
      console.log('Created cybersecurity sub-topic test')
    }

    // Cybersecurity questions data
    const cybersecurityQuestions = [
      {
        question: 'What is the primary goal of cybersecurity?',
        options: [
          { optionLetter: 'A', optionText: 'To make computers run faster', isCorrect: false },
          { optionLetter: 'B', optionText: 'To protect information and systems from unauthorized access', isCorrect: true },
          { optionLetter: 'C', optionText: 'To create new software applications', isCorrect: false },
          { optionLetter: 'D', optionText: 'To improve internet connectivity', isCorrect: false }
        ],
        category: 'Cybersecurity Fundamentals',
        difficulty: 'EASY' as const,
        subjectModel: 'cybersecurity',
        modelType: 'subtopic',
        modelId: cybersecurityTest.id
      },
      {
        question: 'Which of the following is NOT a common type of cyber attack?',
        options: [
          { optionLetter: 'A', optionText: 'Phishing', isCorrect: false },
          { optionLetter: 'B', optionText: 'Malware', isCorrect: false },
          { optionLetter: 'C', optionText: 'DDoS', isCorrect: false },
          { optionLetter: 'D', optionText: 'Power outage', isCorrect: true }
        ],
        category: 'Cyber Threats',
        difficulty: 'EASY' as const,
        subjectModel: 'cybersecurity',
        modelType: 'subtopic',
        modelId: cybersecurityTest.id
      },
      {
        question: 'What does "CIA" stand for in cybersecurity?',
        options: [
          { optionLetter: 'A', optionText: 'Central Intelligence Agency', isCorrect: false },
          { optionLetter: 'B', optionText: 'Confidentiality, Integrity, Availability', isCorrect: true },
          { optionLetter: 'C', optionText: 'Computer Internet Access', isCorrect: false },
          { optionLetter: 'D', optionText: 'Cybersecurity Intelligence Agency', isCorrect: false }
        ],
        category: 'Cybersecurity Principles',
        difficulty: 'MEDIUM' as const,
        subjectModel: 'cybersecurity',
        modelType: 'subtopic',
        modelId: cybersecurityTest.id
      },
      {
        question: 'Which authentication method is considered the strongest?',
        options: [
          { optionLetter: 'A', optionText: 'Password only', isCorrect: false },
          { optionLetter: 'B', optionText: 'Username and password', isCorrect: false },
          { optionLetter: 'C', optionText: 'Multi-factor authentication (MFA)', isCorrect: true },
          { optionLetter: 'D', optionText: 'Security questions', isCorrect: false }
        ],
        category: 'Authentication',
        difficulty: 'MEDIUM' as const,
        subjectModel: 'cybersecurity',
        modelType: 'subtopic',
        modelId: cybersecurityTest.id
      },
      {
        question: 'What is a firewall primarily used for?',
        options: [
          { optionLetter: 'A', optionText: 'Speeding up internet connection', isCorrect: false },
          { optionLetter: 'B', optionText: 'Monitoring network traffic and blocking unauthorized access', isCorrect: true },
          { optionLetter: 'C', optionText: 'Creating backups of data', isCorrect: false },
          { optionLetter: 'D', optionText: 'Scanning for viruses', isCorrect: false }
        ],
        category: 'Network Security',
        difficulty: 'EASY' as const,
        subjectModel: 'cybersecurity',
        modelType: 'subtopic',
        modelId: cybersecurityTest.id
      },
      {
        question: 'Which of the following is an example of social engineering?',
        options: [
          { optionLetter: 'A', optionText: 'Installing antivirus software', isCorrect: false },
          { optionLetter: 'B', optionText: 'Tricking someone into revealing confidential information', isCorrect: true },
          { optionLetter: 'C', optionText: 'Updating system passwords regularly', isCorrect: false },
          { optionLetter: 'D', optionText: 'Encrypting sensitive files', isCorrect: false }
        ],
        category: 'Social Engineering',
        difficulty: 'MEDIUM' as const,
        subjectModel: 'cybersecurity',
        modelType: 'subtopic',
        modelId: cybersecurityTest.id
      },
      {
        question: 'What does "encryption" do?',
        options: [
          { optionLetter: 'A', optionText: 'Makes data unreadable to unauthorized users', isCorrect: true },
          { optionLetter: 'B', optionText: 'Speeds up data transmission', isCorrect: false },
          { optionLetter: 'C', optionText: 'Compresses data for storage', isCorrect: false },
          { optionLetter: 'D', optionText: 'Deletes old data automatically', isCorrect: false }
        ],
        category: 'Data Protection',
        difficulty: 'MEDIUM' as const,
        subjectModel: 'cybersecurity',
        modelType: 'subtopic',
        modelId: cybersecurityTest.id
      },
      {
        question: 'Which protocol is commonly used for secure web browsing?',
        options: [
          { optionLetter: 'A', optionText: 'HTTP', isCorrect: false },
          { optionLetter: 'B', optionText: 'FTP', isCorrect: false },
          { optionLetter: 'C', optionText: 'HTTPS', isCorrect: true },
          { optionLetter: 'D', optionText: 'SMTP', isCorrect: false }
        ],
        category: 'Web Security',
        difficulty: 'EASY' as const,
        subjectModel: 'cybersecurity',
        modelType: 'subtopic',
        modelId: cybersecurityTest.id
      },
      {
        question: 'What is the purpose of a VPN?',
        options: [
          { optionLetter: 'A', optionText: 'To speed up internet connection', isCorrect: false },
          { optionLetter: 'B', optionText: 'To create a secure connection over a public network', isCorrect: true },
          { optionLetter: 'C', optionText: 'To block all incoming traffic', isCorrect: false },
          { optionLetter: 'D', optionText: 'To monitor internet usage', isCorrect: false }
        ],
        category: 'Network Security',
        difficulty: 'MEDIUM' as const,
        subjectModel: 'cybersecurity',
        modelType: 'subtopic',
        modelId: cybersecurityTest.id
      },
      {
        question: 'Which of the following is a strong password practice?',
        options: [
          { optionLetter: 'A', optionText: 'Using "password123" as your password', isCorrect: false },
          { optionLetter: 'B', optionText: 'Using the same password for all accounts', isCorrect: false },
          { optionLetter: 'C', optionText: 'Using a combination of uppercase, lowercase, numbers, and symbols', isCorrect: true },
          { optionLetter: 'D', optionText: 'Writing passwords on sticky notes', isCorrect: false }
        ],
        category: 'Password Security',
        difficulty: 'EASY' as const,
        subjectModel: 'cybersecurity',
        modelType: 'subtopic',
        modelId: cybersecurityTest.id
      }
    ]

    // Create questions and associate them with the test
    const createdQuestions = []

    for (const qData of cybersecurityQuestions) {
      const question = await prisma.testQuestion.create({
        data: {
          question: qData.question,
          category: qData.category,
          difficulty: qData.difficulty,
          isActive: true,
          options: {
            create: qData.options
          }
        }
      })

      // Fetch the question with options
      const questionWithOptions = await prisma.testQuestion.findUnique({
        where: { id: question.id },
        include: { options: true }
      })

      if (questionWithOptions) {
        createdQuestions.push({
          id: questionWithOptions.id,
          question: questionWithOptions.question,
          options: questionWithOptions.options.reduce((acc: any, opt: any) => {
            acc[opt.optionLetter] = opt.optionText;
            return acc;
          }, {}),
          correctAnswer: questionWithOptions.options.find((opt: any) => opt.isCorrect)?.optionLetter || 'A',
          category: questionWithOptions.category,
          difficulty: questionWithOptions.difficulty
        })
      }
    }

    // Update the sub-topic test with the questions
    await prisma.subTopicTest.update({
      where: { id: cybersecurityTest.id },
      data: {
        questions: createdQuestions,
        totalQuestions: createdQuestions.length
      }
    })

    console.log(`Created ${createdQuestions.length} cybersecurity questions`)
    console.log('Cybersecurity questions seeding completed successfully')

  } catch (error) {
    console.error('Error seeding cybersecurity questions:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

export default main
