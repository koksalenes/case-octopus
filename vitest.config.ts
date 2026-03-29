import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

const TEST_ENV_DEFAULTS = {
  NODE_ENV: 'test',
  NEXT_PUBLIC_API_URL: 'https://dummyjson.com',
  NEXT_PUBLIC_CDN_URL: 'https://cdn.dummyjson.com',
} as const;

export default defineConfig(() => {
  return {
    plugins: [react()],
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      exclude: ['**/node_modules/**', '**/tests/**', '**/.next/**'],
      env: {
        ...TEST_ENV_DEFAULTS,
        ...Object.fromEntries(
          (Object.keys(TEST_ENV_DEFAULTS) as (keyof typeof TEST_ENV_DEFAULTS)[])
            .filter((key) => process.env[key])
            .map((key) => [key, process.env[key]!]),
        ),
      },
      coverage: {
        provider: 'v8' as const,
        reporter: ['text', 'lcov'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/mocks/**'],
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'next/image': path.resolve(
          __dirname,
          './src/test/mocks/next-image.tsx',
        ),
        'next/link': path.resolve(__dirname, './src/test/mocks/next-link.tsx'),
        'next/navigation': path.resolve(
          __dirname,
          './src/test/mocks/next-navigation.ts',
        ),
      },
    },
  };
});
