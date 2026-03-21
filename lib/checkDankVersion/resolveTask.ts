import { lt as isSemverLessThan, valid as isSemverValid } from 'semver'
import type { DankProjectVersions } from './lookupProjectVersions.ts'

export type DankVersionTask = 'upgrade' | 'unprod'

export type DankVersionError = 'invalid'

export type ResolvedDankVersionTask = {
    projects: Array<DankProjectVersions>
} & (
    | {
          kind: DankVersionTask
          isError: false
      }
    | {
          kind: DankVersionError
          isError: true
      }
)

export function resolveVersionTask(
    projects: Array<DankProjectVersions>,
    latestVersion: string,
): ResolvedDankVersionTask | null {
    const invalid = projects.filter(
        p => isInvalid(p.devVersion) || isInvalid(p.prodVersion),
    )
    if (invalid.length) {
        return {
            kind: 'invalid',
            isError: true,
            projects: invalid,
        }
    }
    const outOfDate = projects.filter(
        p =>
            isOutOfDate(p.devVersion, latestVersion) ||
            isOutOfDate(p.prodVersion, latestVersion),
    )
    if (outOfDate.length) {
        return {
            kind: 'upgrade',
            isError: false,
            projects: outOfDate,
        }
    }
    const prodNotDev = projects.filter(p => p.prodVersion !== null)
    if (prodNotDev.length) {
        return {
            kind: 'unprod',
            isError: false,
            projects: prodNotDev,
        }
    }
    return null
}

function isInvalid(v: string | null): boolean {
    return v === null ? false : isSemverValid(v) === null
}

function isOutOfDate(v: string | null, lv: string): boolean {
    return v !== null && isSemverLessThan(v, lv)
}
