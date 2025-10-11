import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma/client"
import { authOptions } from '@/lib/auth/config'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const enrollments = await prisma.moduleEnrollment.findMany({
      where: { userId: session.user.id },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            description: true
          }
        }
      },
      orderBy: { enrollmentDate: 'desc' }
    })

    return NextResponse.json(enrollments)
  } catch (error) {
    console.error("Error fetching module enrollments:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}