import { createApp } from '../src/app.js';
import { createTestDatabase } from './helpers/database.js';

const fixture = await createTestDatabase();
const server = createApp(fixture.db).listen(Number(process.env.PORT || 4001), '127.0.0.1', () =>
  console.log('Isolated E2E API ready.'),
);
for (const signal of ['SIGINT', 'SIGTERM'])
  process.once(signal, () =>
    server.close(async () => {
      await fixture.cleanup();
      process.exit(0);
    }),
  );
