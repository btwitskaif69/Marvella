// src/db/prismaClient.js
const { PrismaClient } = require('@prisma/client');

// Reuse the Prisma client in dev to avoid exhausting connections on hot-reloads
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.__prisma__ ||
  new PrismaClient({
    // log: ['query', 'info', 'warn', 'error'], // uncomment if you want prisma logs
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prisma__ = prisma;
}

module.exports = prisma;
