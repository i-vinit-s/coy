import { PrismaClient } from '@prisma/client';
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { seedDatabase } from '../../prisma/seed-data.js';

const testRoot = fileURLToPath(new URL('../.tmp/', import.meta.url));
const migration = fileURLToPath(
  new URL('../../prisma/migrations/202611170001_initial/migration.sql', import.meta.url),
);

export async function createTestDatabase() {
  await mkdir(testRoot, { recursive: true });
  const directory = await mkdtemp(path.join(testRoot, 'coy-'));
  const url = `file:${path.join(directory, 'test.db').replaceAll('\\', '/')}`;
  const db = new PrismaClient({ datasourceUrl: url });
  const statements = (await readFile(migration, 'utf8'))
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
  for (const statement of statements) await db.$executeRawUnsafe(statement);
  await seedDatabase(db);
  return {
    db,
    url,
    async cleanup() {
      await db.$disconnect();
      if (path.dirname(directory) !== path.resolve(testRoot))
        throw new Error('Invalid fixture directory');
      await rm(directory, { recursive: true, force: true });
    },
  };
}
