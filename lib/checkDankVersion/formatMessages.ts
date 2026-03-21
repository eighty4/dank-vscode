import type { DankProjectVersions } from './lookupProjectVersions.ts'

export function formatProjectList(
    projects: Array<DankProjectVersions>,
): string {
    return projects.length === 1
        ? projects[0].packageName
        : `${projects
              .slice(0, -1)
              .map(p => p.packageName)
              .join(', ')} and ${projects.at(-1)?.packageName}`
}

export function formatWordProject(
    projects: Array<DankProjectVersions>,
): string {
    return projects.length === 1 ? 'project' : 'projects'
}

export function formatIrregularVerbBe(
    projects: Array<DankProjectVersions>,
): string {
    return projects.length === 1 ? 'is' : 'are'
}

export function formatPossessiveAdjective(
    projects: Array<DankProjectVersions>,
): string {
    return projects.length === 1 ? 'its' : 'their'
}
