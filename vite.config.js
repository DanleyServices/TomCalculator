import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

// Dynamically discover all HTML files in the root directory to support multi-page building
const getHtmlEntryPoints = () => {
  const files = fs.readdirSync('.');
  const entryPoints = {};
  files.forEach(file => {
    if (file.endsWith('.html')) {
      const name = file.replace('.html', '');
      entryPoints[name] = resolve('.', file);
    }
  });
  return entryPoints;
};

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: getHtmlEntryPoints(),
    },
  },
  server: {
    port: 8085,
    open: true,
  },
});
