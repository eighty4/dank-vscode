import * as vscode from 'vscode'
import { confirmVersionTask } from './confirmTask.ts'
import { executeVersionTask } from './executeTask.ts'
import {
    formatIrregularVerbBe,
    formatPossessiveAdjective,
    formatProjectList,
    formatWordProject,
} from './formatMessages.ts'
import { getLatestVersion } from './getLatestVersion.ts'
import {
    type DankProjectVersions,
    lookupProjectVersions,
} from './lookupProjectVersions.ts'
import { resolveVersionTask, type DankVersionError } from './resolveTask.ts'

export function registerCheckDependencyCommand(): vscode.Disposable {
    return vscode.commands.registerCommand(
        'DANK.checkDependency',
        async (stubbedLatestVersion?: string) => {
            return await checkDankVersion(stubbedLatestVersion)
        },
    )
}

async function checkDankVersion(stubbedLatestVersion?: string) {
    const readingDankProjects = lookupProjectVersions()
    const latestVersion = stubbedLatestVersion ?? (await getLatestVersion())
    const dankProjects = await readingDankProjects
    if (latestVersion === null) {
        return
    }
    const task = resolveVersionTask(dankProjects, latestVersion)
    if (task === null) {
        return
    }
    if (task.isError) {
        showError(task.kind, task.projects)
    } else {
        if (await confirmVersionTask(task.kind, task.projects, latestVersion)) {
            await executeVersionTask(task.kind, dankProjects, latestVersion)
        }
    }
}

function showError(
    error: DankVersionError,
    projects: Array<DankProjectVersions>,
) {
    let message: string
    switch (error) {
        case 'invalid':
            message = `DANK ${formatWordProject(projects)} ${formatProjectList(projects)} ${formatIrregularVerbBe(projects)} incorrectly declared in ${formatPossessiveAdjective(projects)} package.json.`
            break
        default:
            throw Error()
    }
    vscode.window.showErrorMessage(message).then()
}
