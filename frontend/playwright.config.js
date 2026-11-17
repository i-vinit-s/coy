import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';

const edgeInstalled =
  process.platform === 'win32' &&
  existsSync('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe');
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3001',
    channel: process.env.PLAYWRIGHT_CHANNEL || (edgeInstalled ? 'msedge' : undefined),
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'], defaultBrowserType: 'chromium' } },
  ],
  webServer: [
    {
      command: 'node ../backend/tests/start-e2e-server.js',
      url: 'http://127.0.0.1:4001/api/health',
      env: { PORT: '4001', FRONTEND_ORIGIN: 'http://localhost:3001' },
      reuseExistingServer: false,
      timeout: 30000,
    },
    {
      command: 'npm run dev -- --port 3001',
      url: 'http://localhost:3001',
      env: {
        NEXT_PUBLIC_API_URL: 'http://127.0.0.1:4001/api',
        NEXT_TELEMETRY_DISABLED: '1',
        NEXT_TEST_MODE: '1',
      },
      reuseExistingServer: false,
      timeout: 120000,
    },
  ],
});
