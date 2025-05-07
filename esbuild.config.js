const { build } = require('esbuild');

build({
  entryPoints: ['src/cli.ts'],
  bundle: true,
  platform: 'node',
  outfile: 'dist/cli.js',
  external: ['commander', 'iconv-lite'],
  banner: {
    js: '#!/usr/bin/env node',
  },
}).catch(() => process.exit(1));