const { PrismaClient } = require('@prisma/client');

// Singleton – one connection pool shared across the whole process.
// Previously every controller/middleware spun up its own PrismaClient,
// which wastes connections and can hit MySQL's max_connections limit fast.
const prisma = new PrismaClient();

module.exports = prisma;
