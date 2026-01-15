import { rm } from 'node:fs/promises'
import esbuild from 'esbuild'

await rm('lib_js', { force: true, recursive: true })

const production = process.argv.includes('--production')

await esbuild.build({
    entryPoints: ['lib/extension.ts'],
    bundle: true,
    format: 'esm',
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: 'node',
    outfile: 'lib_js/extension.js',
    external: ['vscode'],
    logLevel: 'info',
})
