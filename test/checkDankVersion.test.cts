import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import * as vscode from 'vscode'

suite('checkDankVersion', () => {
    let workspaceDir: string
    let packageJsonPath: string

    async function readPackageJson(): Promise<any> {
        return JSON.parse(await readFile(packageJsonPath, 'utf8'))
    }

    async function writePackageJson(s: string): Promise<void> {
        await writeFile(packageJsonPath, s)
    }

    setup(async () => {
        workspaceDir = vscode.workspace.workspaceFolders![0].uri.fsPath
        packageJsonPath = join(workspaceDir, 'package.json')
    })

    suite('upgrading DANK version', () => {
        test('upgrade dev dependency', async () => {
            await writePackageJson(`\
{
    "name": "dank-n-eggs",
    "devDependencies": {
        "@eighty4/dank": "0.0.2"
    }
}
`)
            await vscode.commands.executeCommand(
                'DANK.checkDependency',
                '0.0.4',
            )
            const packageJson = await readPackageJson()
            assert.equal(packageJson.devDependencies['@eighty4/dank'], '0.0.4')
        })

        test('move prod dependency to dev and upgrade', async () => {
            await writePackageJson(`\
{
    "name": "dank-n-eggs",
    "dependencies": {
        "@eighty4/dank": "0.0.2"
    }
}
`)
            await vscode.commands.executeCommand(
                'DANK.checkDependency',
                '0.0.4',
            )
            const packageJson = await readPackageJson()
            assert.ok(!packageJson.dependencies)
            assert.ok(!!packageJson.devDependencies)
            assert.equal(packageJson.devDependencies['@eighty4/dank'], '0.0.4')
        })

        test('removes dupe from prod', async () => {
            await writePackageJson(`\
{
    "name": "dank-n-eggs",
    "devDependencies": {
        "@eighty4/dank": "0.0.2"
    },
    "dependencies": {
        "@eighty4/dank": "0.0.2"
    }
}
`)
            await vscode.commands.executeCommand(
                'DANK.checkDependency',
                '0.0.4',
            )
            const packageJson = await readPackageJson()
            assert.ok(!packageJson.dependencies)
            assert.ok(!!packageJson.devDependencies)
            assert.equal(packageJson.devDependencies['@eighty4/dank'], '0.0.4')
        })
    })
})
