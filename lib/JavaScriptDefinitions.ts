import * as vscode from 'vscode'
import {
    relativeTargetUriIfExists,
    isCursorWithinCaptureGroup,
} from './codeParsing.ts'

export function registerJavaScriptDefinitionProvider(): vscode.Disposable {
    return vscode.languages.registerDefinitionProvider(
        ['javascript', 'javascriptreact', 'typescript', 'typescriptreact'],
        new JavaScriptDefinitionProvider(),
    )
}

const WORKER_CTOR =
    /new(?:\s|\r?\n)+(?:Shared)?Worker(?:\s|\r?\n)*\((?:\s|\r?\n)*/

class JavaScriptDefinitionProvider implements vscode.DefinitionProvider {
    async provideDefinition(
        doc: vscode.TextDocument,
        pos: vscode.Position,
    ): Promise<Array<vscode.LocationLink> | null> {
        const line = doc.lineAt(pos)
        const workerUrlExcerpt = rangeOfStringAtCursor(line, pos)
        if (
            workerUrlExcerpt === null ||
            !verifyWorkerConstructor(doc, line, workerUrlExcerpt)
        ) {
            return null
        }
        const targetUri = await relativeTargetUriIfExists(
            doc,
            workerUrlExcerpt.content,
        )
        if (targetUri === null) {
            return null
        }
        return [
            {
                originSelectionRange: workerUrlExcerpt.range,
                targetRange: new vscode.Range(0, 0, 0, 0),
                targetUri,
            },
        ]
    }
}

const WITHIN_STRING =
    /(?:'(?<wus>.+\.(?:ts|js|mjs))'|"(?<wud>.+\.(?:ts|js|mjs))")/dg
const WITHIN_STRING_NCG = ['wus', 'wud']

type TextExcerpt = {
    content: string
    range: vscode.Range
}

function rangeOfStringAtCursor(
    line: vscode.TextLine,
    pos: vscode.Position,
): TextExcerpt | null {
    WITHIN_STRING.lastIndex = 0
    let match
    while ((match = WITHIN_STRING.exec(line.text)) !== null) {
        for (const ncg of WITHIN_STRING_NCG) {
            if (
                match.groups![ncg] &&
                isCursorWithinCaptureGroup(pos, match.indices!.groups![ncg])
            ) {
                return {
                    content: match.groups![ncg],
                    range: new vscode.Range(
                        line.range.start.translate(
                            0,
                            match.indices!.groups![ncg][0],
                        ),
                        line.range.start.translate(
                            0,
                            match.indices!.groups![ncg][1],
                        ),
                    ),
                }
            }
        }
    }
    return null
}

function verifyWorkerConstructor(
    doc: vscode.TextDocument,
    line: vscode.TextLine,
    workerUrlExcerpt: TextExcerpt,
): boolean {
    let search = line.text.substring(
        0,
        workerUrlExcerpt.range.start.character - 1,
    )
    const lastIndexOfNew = search.lastIndexOf('new')
    if (lastIndexOfNew !== -1) {
        return WORKER_CTOR.test(search.substring(lastIndexOfNew))
    }
    let lineIndex = line.range.start.line
    do {
        lineIndex--
        const newLine = doc.getText(doc.lineAt(lineIndex).range)
        const lastIndexOfNew = newLine.lastIndexOf('new')
        if (lastIndexOfNew !== -1) {
            search = doc.getText(doc.lineAt(lineIndex).range) + search
            return WORKER_CTOR.test(search.substring(lastIndexOfNew))
        }
    } while (
        lineIndex > 0 &&
        search.substring(lastIndexOfNew || 0).trim().length === 0
    )
    return false
}
