import { prisma } from '../src/db/prisma.js';
import { seedDatabase } from './seed-data.js';

try {
  await seedDatabase(prisma);
  console.log('Seed complete: 32 discoverable mock profiles. Existing swipe history preserved.');
} catch {
  console.error('Seed failed. Check the database connection and run migrations first.');
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
