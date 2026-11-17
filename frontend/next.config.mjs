import path from 'node:path';
import { fileURLToPath } from 'node:url';

export default {
  poweredByHeader: false,
  devIndicators: false,
  distDir: process.env.NEXT_TEST_MODE === '1' ? '.next-e2e' : '.next',
  turbopack: { root: path.dirname(fileURLToPath(import.meta.url)) },
};
