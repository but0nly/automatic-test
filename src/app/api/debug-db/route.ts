import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET() {
  const diagnostics: any = {
    env: process.env.NODE_ENV,
    databaseUrlSet: !!process.env.DATABASE_URL,
    timestamp: new Date().toISOString(),
  }

  try {
    // 1. Check environment variables (masked)
    const dbUrl = process.env.DATABASE_URL || ''
    diagnostics.dbUrlProtocol = dbUrl.split(':')[0]
    diagnostics.dbUrlHasHost = dbUrl.includes('@')
    
    // 2. Try to ping the database host if possible (only on Linux/Mac)
    if (dbUrl.includes('@')) {
      const hostPart = dbUrl.split('@')[1].split(':')[0].split('/')[0]
      diagnostics.dbHost = hostPart
      try {
        const { stdout } = await execAsync(`ping -c 1 -W 1 ${hostPart} || echo "Ping failed"`)
        diagnostics.pingResult = stdout.trim()
      } catch (e: any) {
        diagnostics.pingError = e.message
      }
    }

    // 3. Test Prisma connection
    try {
      await prisma.$queryRaw`SELECT 1`
      diagnostics.prismaRawQuery = 'success'
    } catch (e: any) {
      diagnostics.prismaRawQuery = 'failed'
      diagnostics.prismaRawQueryError = e.message
      diagnostics.prismaRawQueryCode = e.code
    }

    // 4. Test Model access
    try {
      const count = await prisma.project.count()
      diagnostics.projectCount = count
      diagnostics.prismaModelAccess = 'success'
    } catch (e: any) {
      diagnostics.prismaModelAccess = 'failed'
      diagnostics.prismaModelAccessError = e.message
    }

    return NextResponse.json(diagnostics)
  } catch (error: any) {
    return NextResponse.json({
      error: 'Diagnostics failed',
      message: error.message,
      stack: error.stack,
    }, { status: 500 })
  }
}
