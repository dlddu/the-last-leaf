import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

async function main() {
  console.log('Starting database seed...');

  // Clean existing data
  await prisma.diary.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.user.deleteMany();

  console.log('Existing data cleaned.');

  // Create test user
  const hashedPassword = await bcrypt.hash('testpassword123', SALT_ROUNDS);

  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password_hash: hashedPassword,
      nickname: 'Test User',
      timer_status: 'inactive',
      timer_idle_threshold_sec: 300,
    },
  });

  console.log('Test user created:', {
    user_id: testUser.user_id,
    email: testUser.email,
    nickname: testUser.nickname,
  });

  // Create test diaries
  const diary1 = await prisma.diary.create({
    data: {
      user_id: testUser.user_id,
      content: 'This is my first test diary entry. I am testing the diary feature.',
    },
  });

  const diary2 = await prisma.diary.create({
    data: {
      user_id: testUser.user_id,
      content: 'This is my second test diary entry. The weather is nice today.',
    },
  });

  console.log('Test diaries created:', {
    diary1_id: diary1.diary_id,
    diary2_id: diary2.diary_id,
  });

  // Create test contact
  const contact = await prisma.contact.create({
    data: {
      user_id: testUser.user_id,
      email: 'emergency@example.com',
      phone: '+1-555-0100',
    },
  });

  console.log('Test contact created:', {
    contact_id: contact.contact_id,
  });

  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
