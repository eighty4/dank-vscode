import { exec, spawn } from 'node:child_process'
import * as vscode from 'vscode'
import type { DankProjectVersions } from './lookupProjectVersions.ts'
import type { DankVersionTask } from './resolveTask.ts'

export async function executeVersionTask(
    task: DankVersionTask,
    projects: Array<DankProjectVersions>,
    latestVersion: string,
) {
    let op: TaskOp
    switch (task) {
        case 'upgrade':
        case 'unprod':
            op = upgrade
            break
        default:
            throw Error()
    }
    await Promise.all(projects.map(project => op(project, latestVersion)))
}

type TaskOp = (p: DankProjectVersions, latestVersion: string) => Promise<void>

async function upgrade(
    project: DankProjectVersions,
    latestVersion: string,
): Promise<void> {
    const pm: 'npm' | 'pnpm' = await resolvePackageManager(project.projectDir)
    const result = await upgradeWithPackageManager(pm, latestVersion, project)
    if (result.success) {
        const message = 'Upgraded DANK to ' + latestVersion
        vscode.window.showInformationMessage(message)
    } else {
        const cmd = `${pm} i -D @eighty4/dank@${latestVersion}`
        const output = vscode.window.createOutputChannel(cmd)
        output.appendLine('Failed to upgrade DANK to ' + latestVersion)
        output.appendLine(`Output from \`${cmd}\`:`)
        output.appendLine('')
        for (const line of result.output.split('\n')) {
            output.appendLine(line.trim())
        }
        output.show()
    }
}

type PackageManager = 'npm' | 'pnpm'

async function resolvePackageManager(
    projectDir: string,
): Promise<PackageManager> {
    return await new Promise(res =>
        exec('pnpm exec pwd', { cwd: projectDir }, err =>
            err ? res('npm') : res('pnpm'),
        ),
    )
}

type PackageUpgradeResult = {
    output: string
    success: boolean
}

async function upgradeWithPackageManager(
    pm: 'npm' | 'pnpm',
    version: string,
    project: DankProjectVersions,
): Promise<PackageUpgradeResult> {
    return new Promise((res, rej) => {
        let success = true
        let output = ''
        const decoder = new TextDecoder()
        const appendOutput = (chunk: any) => (output += decoder.decode(chunk))
        const upgrading = spawn(pm, ['i', '-D', `@eighty4/dank@${version}`], {
            cwd: project.projectDir,
        })
        upgrading.on('error', e => {
            console.log('DANK upgradeWithPackageManager error:', e.message)
            rej(e)
        })
        upgrading.on('exit', exitCode => {
            if (exitCode !== 0) {
                success = false
            }
            res({ success, output })
        })
        upgrading.stdout.on('data', appendOutput)
        upgrading.stderr.on('data', appendOutput)
    })
}
