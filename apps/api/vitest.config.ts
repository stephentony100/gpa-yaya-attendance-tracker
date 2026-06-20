import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    testTimeout: 15000,
    // Vitest sets NODE_ENV=test by default before any test file is loaded,
    // which is what makes src/lib/env.ts's TEST_DATABASE_URL guard kick in.
  },
});
