import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const testCase = await prisma.apiTestCase.findUnique({
      where: { id },
      include: { project: true },
    })
    return NextResponse.json(testCase)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch api test case' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const testCase = await prisma.apiTestCase.update({
      where: { id },
      data: body,
    })
    return NextResponse.json(testCase)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update api test case' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.apiTestCase.delete({
      where: { id },
    })
    return NextResponse.json({ message: 'API Test case deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete api test case' }, { status: 500 })
  }
}
