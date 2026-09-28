import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/browser',
  testIgnore: process.env.CAPTURE_VISUAL ? [] : ['**/reference-captures.spec.ts'],
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1680, height: 939 } } }],
  webServer: {
    command: 'bun run preview',
    env: { NITRO_HOST: '127.0.0.1', NITRO_PORT: '4173' },
    url: 'http://127.0.0.1:4173/invite/demo?qa=static',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
