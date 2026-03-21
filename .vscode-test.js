import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { defineConfig } from '@vscode/test-cli'

async function makeTempFixture() {
    const dir = await mkdtemp(join(tmpdir(), 'dank-vscode-test-'))
    await writeFile(join(dir, 'dank.config.ts'), '')
    return dir
}

export default defineConfig([
    dankVscodeTest({
        label: 'html',
        files: 'test_js/html/*.test.cjs',
    }),
    dankVscodeTest({
        label: 'js',
        files: 'test_js/js/*.test.cjs',
    }),
    dankVscodeTest({
        label: 'checkDependency',
        files: 'test_js/checkDankVersion.test.cjs',
        workspaceFolder: await makeTempFixture(),
    }),
])

function dankVscodeTest(testConfig) {
    return {
        workspaceFolder: 'fixtures/dank-project',
        ...testConfig,
        version: 'stable',
        env: {
            DANK_VSCODE_TEST: '1',
        },
    }
}
