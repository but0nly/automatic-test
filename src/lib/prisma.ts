import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  console.log('Initializing new PrismaClient instance...')
  return new PrismaClient()
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

globalThis.prisma = prisma
