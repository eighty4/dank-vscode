import { defineConfig } from '@vscode/test-cli'

export default defineConfig([
    {
        files: 'test_js/**/*.test.cjs',
        version: 'insiders',
        workspaceFolder: 'fixtures/dank-project',
    },
])
