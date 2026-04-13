import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')

  try {
    const environments = await prisma.environment.findMany({
      where: projectId ? { projectId } : {},
      include: { project: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(environments)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch environments' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, baseUrl, projectId, headers, variables } = body
    
    if (!name || !baseUrl || !projectId) {
      return NextResponse.json({ error: 'Name, Base URL, and Project ID are required' }, { status: 400 })
    }

    const environment = await prisma.environment.create({
      data: {
        name,
        baseUrl,
        projectId,
        headers: headers || {},
        variables: variables || {},
      },
    })
    return NextResponse.json(environment)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create environment' }, { status: 500 })
  }
}
