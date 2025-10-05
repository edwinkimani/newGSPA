import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { getUserFromAuthHeader } from '@/lib/server/auth'

// GET /api/certificates - Get all certificates
export async function GET(request: Request) {
  try {
    const authUser = getUserFromAuthHeader(request)
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const authProfile = await prisma.profile.findUnique({ where: { id: authUser.id }, include: { role: true } })
    if (authProfile?.role?.name === 'admin') {
      const all = await prisma.profile.findMany({ where: { certificateIssued: true }, orderBy: { createdAt: 'desc' } })
      return NextResponse.json(all)
    }

    const profile = await prisma.profile.findUnique({ where: { id: authUser.id } })
    if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (!profile.certificateIssued) return NextResponse.json([], { status: 200 })
    return NextResponse.json([profile])
  } catch (error) {
    console.error('Error fetching certificates:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST /api/certificates - Issue a new certificate (admin only)
export async function POST(request: Request) {
  try {
  const authUser = getUserFromAuthHeader(request)
  if (!authUser || !authUser.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const authProfile = await prisma.profile.findUnique({ where: { id: authUser.id }, include: { role: true } })
  if (!authProfile || authProfile.role?.name !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { userId } = body

    const updated = await prisma.profile.update({ where: { id: userId }, data: { certificateIssued: true, certificateUrl: `certificate-${userId}.pdf` } })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error issuing certificate:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
