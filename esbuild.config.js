const { build } = require('esbuild');

build({
  entryPoints: ['src/cli.ts'],
  bundle: true,
  minify: true,
  platform: 'node',
  outfile: 'dist/cli.js',
  external: ['commander', 'iconv-lite'],
}).catch(() => process.exit(1));