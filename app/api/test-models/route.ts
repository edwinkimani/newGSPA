import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '../auth/[...nextauth]/route'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is master practitioner
    const userProfile = await prisma.profile.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    })

    if (userProfile?.role?.name !== 'master_practitioner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all test models
    const subTopicTests = await prisma.subTopicTest.findMany({
      include: { subTopic: { include: { level: { include: { module: true } } } } }
    })

    const levelTests = await prisma.levelTest.findMany({
      include: { level: { include: { module: true } } }
    })

    const moduleTests = await prisma.moduleTest.findMany({
      include: { module: true }
    })

    const examConfigurations = await prisma.examConfiguration.findMany()

    const testModels = [
      ...subTopicTests.map(test => ({
        id: `subtopic-${test.id}`,
        type: 'subtopic',
        name: test.title,
        description: test.description,
        moduleName: test.subTopic?.level?.module?.title,
        levelName: test.subTopic?.level?.title,
        subTopicName: test.subTopic?.title,
        totalQuestions: test.totalQuestions,
        passingScore: test.passingScore,
        timeLimit: test.timeLimit,
        isActive: test.isActive
      })),
      ...levelTests.map(test => ({
        id: `level-${test.id}`,
        type: 'level',
        name: test.title,
        description: test.description,
        moduleName: test.level?.module?.title,
        levelName: test.level?.title,
        totalQuestions: test.totalQuestions,
        passingScore: test.passingScore,
        timeLimit: test.timeLimit,
        isActive: test.isActive
      })),
      ...moduleTests.map(test => ({
        id: `module-${test.id}`,
        type: 'module',
        name: test.title,
        description: test.description,
        moduleName: test.module?.title,
        totalQuestions: test.totalQuestions,
        passingScore: test.passingScore,
        timeLimit: test.timeLimit,
        isActive: test.isActive
      })),
      ...examConfigurations.map(config => ({
        id: `exam-${config.id}`,
        type: 'exam',
        name: config.name,
        description: config.description,
        totalQuestions: config.totalQuestions,
        passingScore: config.passingScore,
        timeLimit: config.timeLimit,
        isActive: config.isActive
      }))
    ]

    return NextResponse.json(testModels)
  } catch (error) {
    console.error('Error fetching test models:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
