import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { getUserFromAuthHeader } from '@/lib/server/auth'

// GET /api/tests/ongoing - get current user's ongoing test
export async function GET(request: Request) {
  try {
    const authUser = getUserFromAuthHeader(request)
    if (!authUser || !authUser.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const ongoing = await prisma.ongoingTest.findUnique({ where: { userId: authUser.id } })
    return NextResponse.json(ongoing)
  } catch (error) {
    console.error('Error fetching ongoing test:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST /api/tests/ongoing - create ongoing test
export async function POST(request: Request) {
  try {
    const authUser = getUserFromAuthHeader(request)
    if (!authUser || !authUser.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const created = await prisma.ongoingTest.create({ data: { userId: authUser.id, questionsData: body.questionsData || {}, answersData: body.answersData || {}, currentQuestion: body.currentQuestion || 0, timeLeft: body.timeLeft || 3600, testStarted: body.testStarted || false } })
    return NextResponse.json(created)
  } catch (error) {
    console.error('Error creating ongoing test:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PATCH /api/tests/ongoing - update ongoing test for current user
export async function PATCH(request: Request) {
  try {
    const authUser = getUserFromAuthHeader(request)
    if (!authUser || !authUser.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const updated = await prisma.ongoingTest.update({ where: { userId: authUser.id }, data: { questionsData: body.questionsData, answersData: body.answersData, currentQuestion: body.currentQuestion, timeLeft: body.timeLeft, testStarted: body.testStarted } })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating ongoing test:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE /api/tests/ongoing - delete current user's ongoing test
export async function DELETE(request: Request) {
  try {
    const authUser = getUserFromAuthHeader(request)
    if (!authUser || !authUser.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await prisma.ongoingTest.deleteMany({ where: { userId: authUser.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting ongoing test:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
