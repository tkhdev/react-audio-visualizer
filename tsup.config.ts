import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: true, // Enable code splitting for dynamic imports
  sourcemap: true,
  clean: true,
  target: 'es2019',
  external: ['react'],
  treeshake: true, // Enable tree shaking
});

