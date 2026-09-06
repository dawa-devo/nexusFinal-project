import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing records to prevent unique constraint errors on re-run
  await prisma.question.deleteMany();
  await prisma.user.deleteMany();

  // Hash password for sample users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Sample User A
  const userA = await prisma.user.create({
    data: {
      name: 'dawad Developer',
      email: 'dawd@knowledgehub.com',
      password: hashedPassword,
    },
  });

  // Create Sample User B
  const userB = await prisma.user.create({
    data: {
      name: 'sena Coder',
      email: 'sena@knowledgehub.com',
      password: hashedPassword,
    },
  });

  // Create Sample Questions
  await prisma.question.create({
    data: {
      title: 'How to handle JWT authentication in Express?',
      description: 'Looking for best practices on storing tokens securely and implementing refresh tokens.',
      tags: ['express', 'jwt', 'security'],
      authorId: userA.id,
    },
  });

  await prisma.question.create({
    data: {
      title: 'Prisma Client relation queries best practices',
      description: 'What is the most efficient way to fetch related user profiles alongside posts in Prisma?',
      tags: ['prisma', 'postgresql', 'typescript'],
      authorId: userB.id,
    },
  });

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });