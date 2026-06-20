import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['src/use-cases/**/*.spec.ts', 'src/utils/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/use-cases/**/*.ts', 'src/utils/**/*.ts'],
      exclude: [
        'src/use-cases/**/*.spec.ts',
        'src/utils/**/*.spec.ts',
        'src/use-cases/factories/**',
        'src/utils/test/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
})
