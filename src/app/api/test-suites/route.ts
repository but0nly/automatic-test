import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')

  try {
    const suites = await prisma.testSuite.findMany({
      where: projectId ? { projectId } : {},
      include: { 
        project: true,
        _count: { select: { items: true } }
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(suites)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch test suites' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, projectId, apiCaseIds, uiCaseIds } = body
    
    if (!name || !projectId) {
      return NextResponse.json({ error: 'Name and Project ID are required' }, { status: 400 })
    }

    const suite = await prisma.testSuite.create({
      data: {
        name,
        description,
        projectId,
        items: {
          create: [
            ...(apiCaseIds || []).map((id: string, index: number) => ({
              apiTestCaseId: id,
              order: index
            })),
            ...(uiCaseIds || []).map((id: string, index: number) => ({
              uiTestCaseId: id,
              order: (apiCaseIds?.length || 0) + index
            }))
          ]
        }
      },
    })
    return NextResponse.json(suite)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create test suite' }, { status: 500 })
  }
}
