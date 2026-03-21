import { readFile } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import * as vscode from 'vscode'

export type DankProjectVersions = {
    projectDir: string
    packageJsonPath: string
    packageName: string
    devVersion: string | null
    prodVersion: string | null
}

export async function lookupProjectVersions(): Promise<
    Array<DankProjectVersions>
> {
    const dankConfigUris = await vscode.workspace.findFiles('dank.config.ts')
    const result = await Promise.all(
        dankConfigUris.map(async dankConfigUri => {
            const projectDir = dirname(dankConfigUri.fsPath)
            const packageJsonPath = join(projectDir, 'package.json')
            const packageJsonString = await readPackageJson(packageJsonPath)
            if (packageJsonString === null) {
                return null
            }
            const packageJson = JSON.parse(packageJsonString)
            const packageName = packageJson.name?.length
                ? packageJson.name
                : `dir \`${basename(projectDir)}\``
            return {
                projectDir,
                packageJsonPath,
                packageName,
                devVersion: checkDankDependency(packageJson, 'devDependencies'),
                prodVersion: checkDankDependency(packageJson, 'dependencies'),
            }
        }),
    )
    return result.filter(dpv => dpv !== null)
}

async function readPackageJson(p: string): Promise<string | null> {
    try {
        return await readFile(p, 'utf8')
    } catch (e) {
        return null
    }
}

function checkDankDependency(
    dankPackageJson: any,
    deps: 'dependencies' | 'devDependencies',
): string | null {
    if (
        !dankPackageJson[deps] ||
        typeof dankPackageJson[deps]['@eighty4/dank'] === 'undefined'
    ) {
        return null
    } else {
        return dankPackageJson[deps]['@eighty4/dank']
    }
}
