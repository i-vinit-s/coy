import { createApp } from './app.js';
import { prisma } from './db/prisma.js';
import { config, DEMO_USER_ID } from './config.js';

try {
  await prisma.$connect();
  if (!(await prisma.user.findUnique({ where: { id: DEMO_USER_ID }, select: { id: true } }))) {
    throw new Error('Run npm run db:setup before starting the API.');
  }
  const server = createApp(prisma).listen(config.port, () =>
    console.log(`Coy API ready at http://localhost:${config.port}/api`),
  );
  server.on('error', async (error) => {
    console.error('API could not listen:', error.code);
    await prisma.$disconnect();
    process.exitCode = 1;
  });
  for (const signal of ['SIGINT', 'SIGTERM'])
    process.once(signal, () => {
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    });
} catch {
  console.error('API startup failed. Check DATABASE_URL and run npm run db:setup.');
  await prisma.$disconnect();
  process.exitCode = 1;
}
