import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { testQueue } from '@/lib/queue'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')

  try {
    const runs = await prisma.testRun.findMany({
      where: projectId ? { suite: { projectId } } : {},
      include: { 
        suite: { include: { project: true } },
        _count: { select: { results: true } }
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(runs)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch test runs' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { suiteId, environmentId } = body
    
    if (!suiteId || !environmentId) {
      return NextResponse.json({ error: 'Suite ID and Environment ID are required' }, { status: 400 })
    }

    const testRun = await prisma.testRun.create({
      data: {
        suiteId,
        environmentId,
        status: 'PENDING',
      },
    })

    // Add job to BullMQ
    await testQueue.add('execute-test', { runId: testRun.id })

    return NextResponse.json(testRun)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to trigger test run' }, { status: 500 })
  }
}
