const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/cli.js', 'src/api.js'],
  bundle: true,
  outdir: 'dist',
  sourcemap: false,
  logLevel: 'info',
  platform: 'node',
  target: 'node14.16.1',
  format: 'cjs',
  watch: process.argv.includes('--watch'),
});
