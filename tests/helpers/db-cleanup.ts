import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Clean up database between tests to ensure isolation
 */
export async function cleanupDatabase(): Promise<void> {
  // Delete in order to respect foreign key constraints
  await prisma.diary.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.user.deleteMany();
}

/**
 * Clean up specific user's data
 */
export async function cleanupUserData(userId: string): Promise<void> {
  await prisma.diary.deleteMany({
    where: { user_id: userId },
  });

  await prisma.contact.deleteMany({
    where: { user_id: userId },
  });

  await prisma.user.delete({
    where: { user_id: userId },
  }).catch(() => {
    // Ignore if user doesn't exist
  });
}

/**
 * Reset database to seed state
 */
export async function resetToSeedState(): Promise<void> {
  await cleanupDatabase();
  // Note: Run seed script separately via `npm run db:seed`
}

/**
 * Disconnect Prisma client
 */
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}

export { prisma };
