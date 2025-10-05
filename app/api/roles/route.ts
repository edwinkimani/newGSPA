import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

// GET /api/roles - Get all available roles
export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { name: 'asc' }
    })

    // Transform to match the expected interface
    const transformedRoles = roles.map(role => ({
      id: role.id,
      name: role.name as 'admin' | 'master_practitioner' | 'practitioner',
      display_name: role.displayName || role.name,
      description: role.description || ''
    }))

    return NextResponse.json(transformedRoles)
  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
