import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/auth/config'

// POST /api/modules/[id]/enroll - Enroll in a module
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const module = await prisma.module.findUnique({
      where: { id: params.id },
    })

    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 })
    }

    if (!module.isActive) {
      return NextResponse.json({ error: "Module is not available for enrollment" }, { status: 400 })
    }

    const existing = await prisma.moduleEnrollment.findUnique({
      where: {
        userId_moduleId: {
          userId: session.user.id,
          moduleId: params.id,
        },
      },
    })

    if (existing) return NextResponse.json({ error: "Already enrolled in this module" }, { status: 400 })

    const enrollment = await prisma.moduleEnrollment.create({
      data: {
        userId: session.user.id,
        moduleId: params.id,
        progressPercentage: 0,
        completedAt: null,
        paymentStatus: "PENDING",
      },
    })

    return NextResponse.json(enrollment)
  } catch (error) {
    console.error("Error enrolling in module:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// PATCH /api/modules/[id]/enroll - Update enrollment progress
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { progress, completed } = body

    if (progress !== undefined && (progress < 0 || progress > 100)) {
      return NextResponse.json({ error: "Progress must be between 0 and 100" }, { status: 400 })
    }

    const existing = await prisma.moduleEnrollment.findUnique({
      where: {
        userId_moduleId: {
          userId: session.user.id,
          moduleId: params.id,
        },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 })
    }

    const updated = await prisma.moduleEnrollment.update({
      where: {
        userId_moduleId: {
          userId: session.user.id,
          moduleId: params.id,
        },
      },
      data: {
        progressPercentage: progress ?? existing.progressPercentage,
        completedAt: completed ? new Date() : null,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating enrollment:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
