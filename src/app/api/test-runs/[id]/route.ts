import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const run = await prisma.testRun.findUnique({
      where: { id },
      include: {
        suite: { include: { project: true } },
        results: {
          include: {
            apiTestCase: true,
            uiTestCase: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })
    return NextResponse.json(run)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch test run details' }, { status: 500 })
  }
}
