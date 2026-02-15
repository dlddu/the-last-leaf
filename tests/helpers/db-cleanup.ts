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
 * Clean up specific user's data by email
 */
export async function cleanupUserByEmail(email: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return;
  }

  await prisma.diary.deleteMany({
    where: { user_id: user.user_id },
  });

  await prisma.contact.deleteMany({
    where: { user_id: user.user_id },
  });

  await prisma.user.delete({
    where: { user_id: user.user_id },
  }).catch(() => {
    // Ignore if user doesn't exist
  });
}

/**
 * Clean up specific user's data by user ID
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
 * Clean up test users (emails matching test patterns)
 */
export async function cleanupTestUsers(): Promise<void> {
  const testEmailPatterns = [
    'newuser@gmail.com',
    'existing.google.user@gmail.com',
    'returning.user@gmail.com',
    'preserve.data@gmail.com',
    'duplicate@gmail.com',
    'concurrent@gmail.com',
  ];

  // Delete users with test email patterns
  for (const email of testEmailPatterns) {
    await cleanupUserByEmail(email);
  }

  // Delete users with timestamp-based emails (pictureuser*, newuser*, testuser*)
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: { startsWith: 'pictureuser' } },
        { email: { startsWith: 'newuser' } },
        { email: { startsWith: 'testuser' } },
        { email: { startsWith: 'validformat' } },
        { email: { startsWith: 'cookietest' } },
        { email: { startsWith: 'redirect' } },
        { email: { startsWith: 'updatetime' } },
        { email: { startsWith: 'socialonly' } },
      ],
    },
  });

  for (const user of users) {
    await cleanupUserData(user.user_id);
  }
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
