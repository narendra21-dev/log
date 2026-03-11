import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// In development, always create a fresh client to pick up schema changes
// This is needed when new models are added to the Prisma schema
const createPrismaClient = () => {
  return new PrismaClient({
    log: ['query'],
  })
}

export const db = process.env.NODE_ENV === 'production'
  ? (globalForPrisma.prisma ?? createPrismaClient())
  : createPrismaClient()

if (process.env.NODE_ENV === 'production') {
  globalForPrisma.prisma = db
}
