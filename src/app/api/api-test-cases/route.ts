import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')

  try {
    const cases = await prisma.apiTestCase.findMany({
      where: projectId ? { projectId } : {},
      include: { project: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(cases)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch api test cases' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, method, url, headers, params, body: reqBody, assertions, projectId } = body
    
    if (!name || !method || !url || !projectId) {
      return NextResponse.json({ error: 'Name, Method, URL, and Project ID are required' }, { status: 400 })
    }

    const testCase = await prisma.apiTestCase.create({
      data: {
        name,
        method,
        url,
        projectId,
        headers: headers || {},
        params: params || {},
        body: reqBody || {},
        assertions: assertions || [],
      },
    })
    return NextResponse.json(testCase)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create api test case' }, { status: 500 })
  }
}
