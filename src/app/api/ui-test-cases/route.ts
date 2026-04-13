import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')

  try {
    const cases = await prisma.uiTestCase.findMany({
      where: projectId ? { projectId } : {},
      include: { project: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(cases)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch ui test cases' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, steps, script, projectId } = body
    
    if (!name || !projectId) {
      return NextResponse.json({ error: 'Name and Project ID are required' }, { status: 400 })
    }

    const testCase = await prisma.uiTestCase.create({
      data: {
        name,
        projectId,
        steps: steps || [],
        script: script || '',
      },
    })
    return NextResponse.json(testCase)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create ui test case' }, { status: 500 })
  }
}
