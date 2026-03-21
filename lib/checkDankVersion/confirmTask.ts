import * as vscode from 'vscode'
import { formatProjectList, formatWordProject } from './formatMessages.ts'
import type { DankProjectVersions } from './lookupProjectVersions.ts'
import type { DankVersionTask } from './resolveTask.ts'
import { IS_TEST } from '../env.ts'

// returns true if user confirms upgrading @eighty4/dank version
export function confirmVersionTask(
    task: DankVersionTask,
    projects: Array<DankProjectVersions>,
    latestVersion: string,
): Promise<boolean> {
    if (IS_TEST) {
        return Promise.resolve(true)
    }
    let message: string
    let confirm: string
    let cancel: string
    switch (task) {
        case 'upgrade':
            message = `DANK ${formatWordProject(projects)} ${packageDisplayList(projects)} can upgrade to ${latestVersion}.`
            confirm = 'Get the DANKest'
            cancel = 'Skip it'
            break
        case 'unprod':
            message = `DANK ${formatWordProject(projects)} ${formatProjectList(projects)} should use DANK as a dev dependency.`
            confirm = 'Fix it'
            cancel = 'Leave it'
            break
        default:
            throw Error()
    }
    return new Promise(res => {
        vscode.window
            .showInformationMessage(message, confirm, cancel)
            .then(selection => {
                res(selection === confirm)
            })
    })
}

function packageDisplayList(projects: Array<DankProjectVersions>): string {
    return projects.length === 1
        ? `project ${projects[0].packageName}`
        : `DANK projects ${projects
              .slice(0, -1)
              .map(p => p.packageName)
              .join(', ')} and ${projects.at(-1)?.packageName}`
}
