import { z } from 'zod';

/*
 * Defines the shape and validation rules for every environment variable
 * consumed by the application.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production'], {
    error: 'NODE_ENV must be one of: "development", "test", "production"',
  }),
  NEXT_PUBLIC_API_URL: z
    .string({ error: 'NEXT_PUBLIC_API_URL is required' })
    .check(
      z.url({
        error:
          'NEXT_PUBLIC_API_URL must be a valid URL (e.g. https://api.example.com)',
      }),
    ),
  NEXT_PUBLIC_CDN_URL: z
    .string({ error: 'NEXT_PUBLIC_CDN_URL is required' })
    .check(
      z.url({
        error:
          'NEXT_PUBLIC_CDN_URL must be a valid URL (e.g. https://cdn.example.com)',
      }),
    ),
});

export type Env = z.infer<typeof envSchema>;

// ---------------------------------------------------------------------------
// Validation (fail-fast at startup)
// ---------------------------------------------------------------------------

const result = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_CDN_URL: process.env.NEXT_PUBLIC_CDN_URL,
});

if (!result.success) {
  const tree = z.treeifyError(result.error);

  console.error('────────────────────────────────────────────────────');
  console.error('  Invalid environment variables detected:');
  console.error('');

  Object.entries(tree.properties ?? {}).forEach(([key, node]) => {
    const details = (node.errors ?? []).join(', ');
    console.error(`  ✗  ${key}: ${details}`);
  });

  console.error('');
  console.error('  → Check your env file and restart.');
  console.error('────────────────────────────────────────────────────');

  throw new Error(
    'Invalid environment variables. See console output above for details.',
  );
}

export const env: Env = result.data;
