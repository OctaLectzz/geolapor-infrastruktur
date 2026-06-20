import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '@generated/prisma/client'

function createPrismaClient(): PrismaClient {
  const connectionString = process.env['DATABASE_URL']

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set.')
  }

  const adapter = new PrismaPg(connectionString)

  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as typeof globalThis & {
  prisma: PrismaClient | undefined
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient()

if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma.prisma = prisma
}
