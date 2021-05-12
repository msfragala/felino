const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/cli.ts', 'src/api.ts'],
  bundle: true,
  outdir: 'dist',
  sourcemap: false,
  logLevel: process.argv.includes('--silent') ? 'silent' : 'info',
  platform: 'node',
  target: 'node12',
  format: 'cjs',
  minify: true,
  watch: process.argv.includes('--watch'),
});
