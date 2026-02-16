import { extname } from 'node:path'
import * as vscode from 'vscode'
import {
    isCursorWithinCaptureGroup,
    relativeTargetUriIfExists,
} from './codeParsing.ts'

export function registerHtmlDefinitionProvider(): Array<vscode.Disposable> {
    return [
        // extend html wordPattern to treat a complete file path as a word in `<!-- {{ ../sw.html }} -->`
        vscode.languages.setLanguageConfiguration('html', {
            wordPattern:
                /(?<=<!--\s*{{\s*)(\.?\.?\/)?[a-zA-Z0-9._-]+?(?=\s*}}\s*-->)/,
        }),
        vscode.languages.registerDefinitionProvider(
            'html',
            new HtmlDefinitionProvider(),
        ),
    ]
}

// reset .lastIndex to 0 before use and only reuse synchronously
const HTML_DEF_PARTIAL_REGEX = /<!--\s*\{\{\s*(?<pp>.+?)\s*\}\}\s*-->/dg

class HtmlDefinitionProvider implements vscode.DefinitionProvider {
    async provideDefinition(
        doc: vscode.TextDocument,
        pos: vscode.Position,
        _token: vscode.CancellationToken,
    ): Promise<Array<vscode.LocationLink> | null> {
        const line = doc.lineAt(pos.line)
        HTML_DEF_PARTIAL_REGEX.lastIndex = 0
        let htmlDefMatch: RegExpExecArray | null = null
        while (
            (htmlDefMatch = HTML_DEF_PARTIAL_REGEX.exec(line.text)) !== null
        ) {
            const partialPath = htmlDefMatch.groups!.pp
            if (
                partialPath &&
                isCursorWithinCaptureGroup(
                    pos,
                    htmlDefMatch.indices!.groups!.pp,
                )
            ) {
                if (extname(partialPath) !== '.html') {
                    return null
                }
                const targetUri = await relativeTargetUriIfExists(
                    doc,
                    partialPath,
                )
                if (targetUri === null) {
                    return null
                }
                const [start, end] = htmlDefMatch.indices!.groups!.pp
                return [
                    {
                        originSelectionRange: new vscode.Range(
                            line.range.start.translate(0, start),
                            line.range.start.translate(0, end),
                        ),
                        targetRange: new vscode.Range(0, 0, 0, 0),
                        targetUri,
                    },
                ]
            }
        }
        return null
    }
}
