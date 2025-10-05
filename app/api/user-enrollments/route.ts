import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma/client"
import { authOptions } from "../auth/[...nextauth]/route"

// Helper function to calculate progress based on completed subtopics
async function calculateModuleProgress(enrollmentId: string) {
  try {
    // Get the enrollment with module details
    const enrollment = await prisma.moduleEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        module: {
          include: {
            levels: {
              include: {
                subTopics: true,
              },
            },
          },
        },
      },
    })

    if (!enrollment) return 0

    // Count total subtopics in the module
    const totalSubtopics = enrollment.module.levels.reduce((total, level) => {
      return total + level.subTopics.length
    }, 0)

    if (totalSubtopics === 0) return 0

    // For now, we'll use a simple approach: assume subtopics are completed
    // when they have been accessed (we'll need to add completion tracking)
    // TODO: Implement proper subtopic completion tracking
    const completedSubtopics = 0 // This will be calculated based on actual completion

    const progressPercentage = Math.round((completedSubtopics / totalSubtopics) * 100)

    // Update the enrollment with the calculated progress
    await prisma.moduleEnrollment.update({
      where: { id: enrollmentId },
      data: { progressPercentage },
    })

    return progressPercentage
  } catch (error) {
    console.error("Error calculating module progress:", error)
    return 0
  }
}

// GET /api/user-enrollments - Get user's module enrollments
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    if (!userId) return NextResponse.json({ error: "User ID is required" }, { status: 400 })

    // Check if user is requesting their own data or is admin/master practitioner
    const profile = await prisma.profile.findUnique({
      where: { id: session.user.id },
      include: { role: true },
    })

    const isAdminOrMaster = ["admin", "master_practitioner"].includes(profile?.role?.name || "")
    if (userId !== session.user.id && !isAdminOrMaster) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const enrollments = await prisma.moduleEnrollment.findMany({
      where: {
        userId,
        // Include both completed and pending enrollments for the user
      },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            difficultyLevel: true,
            estimatedDuration: true,
            instructorName: true,
            price: true,
            currency: true,
          },
        },
      },
      orderBy: { enrollmentDate: "desc" },
    })

    return NextResponse.json(enrollments)
  } catch (error) {
    console.error("Error fetching user enrollments:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// POST /api/user-enrollments - Create a new enrollment (for payment completion)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { moduleId, paymentReference, paymentStatus = "COMPLETED", examDate } = body

    if (!moduleId) return NextResponse.json({ error: "Module ID is required" }, { status: 400 })

    const module = await prisma.module.findUnique({
      where: { id: moduleId },
    })

    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 })
    }

    // Check if user already has an enrollment for this module
    const existingEnrollment = await prisma.moduleEnrollment.findUnique({
      where: {
        userId_moduleId: {
          userId: session.user.id,
          moduleId,
        },
      },
    })

    let enrollment

    if (existingEnrollment) {
      if (existingEnrollment.paymentStatus === "COMPLETED" && paymentStatus === "COMPLETED") {
        return NextResponse.json({ error: "Enrollment already completed" }, { status: 400 })
      }

      // Update existing enrollment (for payment completion)
      enrollment = await prisma.moduleEnrollment.update({
        where: {
          id: existingEnrollment.id,
        },
        data: {
          paymentStatus: paymentStatus,
          paymentReference: paymentReference || existingEnrollment.paymentReference,
          examDate: examDate ? new Date(examDate) : existingEnrollment.examDate,
        },
        include: {
          module: {
            select: {
              id: true,
              title: true,
              description: true,
              category: true,
              difficultyLevel: true,
              estimatedDuration: true,
              instructorName: true,
              price: true,
              currency: true,
            },
          },
        },
      })
    } else {
      // Create new enrollment (for initial enrollment)
      enrollment = await prisma.moduleEnrollment.create({
        data: {
          userId: session.user.id,
          moduleId,
          paymentStatus: paymentStatus,
          paymentReference: paymentReference || null,
          examDate: examDate ? new Date(examDate) : null,
          progressPercentage: 0,
        },
        include: {
          module: {
            select: {
              id: true,
              title: true,
              description: true,
              category: true,
              difficultyLevel: true,
              estimatedDuration: true,
              instructorName: true,
              price: true,
              currency: true,
            },
          },
        },
      })
    }

    return NextResponse.json(enrollment)
  } catch (error) {
    console.error("Error creating enrollment:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
