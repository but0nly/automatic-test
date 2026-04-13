import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.environment.delete({
      where: { id },
    })
    return NextResponse.json({ message: 'Environment deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete environment' }, { status: 500 })
  }
}
