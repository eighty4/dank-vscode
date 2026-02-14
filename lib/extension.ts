import { dirname, extname, join } from 'node:path'
import * as vscode from 'vscode'
import type {
    CancellationToken,
    ExtensionContext,
    LocationLink,
    Position,
    TextDocument,
} from 'vscode'

export function activate(context: ExtensionContext) {
    console.log(
        'DANK extension activated for website development with @eighty4/dank',
    )

    // extend html wordPattern to treat a complete file path as a word in `<!-- {{ ../sw.html }} -->`
    context.subscriptions.push(
        vscode.languages.setLanguageConfiguration('html', {
            wordPattern:
                /(?<=<!--\s*{{\s*)(\.?\.?\/)?[a-zA-Z0-9._-]+?(?=\s*}}\s*-->)/,
        }),
    )

    // reset .lastIndex to 0 before use and only reuse synchronously
    const HTML_DEF_PARTIAL_REGEX = /<!--\s*\{\{\s*(?<pp>.+?)\s*\}\}\s*-->/dg

    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider('html', {
            async provideDefinition(
                doc: TextDocument,
                pos: Position,
                _token: CancellationToken,
            ): Promise<Array<LocationLink> | null> {
                const line = doc.lineAt(pos.line)
                HTML_DEF_PARTIAL_REGEX.lastIndex = 0
                let htmlDefMatch: RegExpExecArray | null = null
                while (
                    (htmlDefMatch = HTML_DEF_PARTIAL_REGEX.exec(line.text)) !==
                    null
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
            },
        }),
    )

    const TS_DEF_WORKER_REGEX =
        /new(?:\s|\r?\n)+(?:Shared)?Worker(?:\s|\r?\n)*\((?:\s|\r?\n)*(?<wu>('.+\.(ts|js|mjs)'|".+\.(ts|js|mjs)"))(?:\s|\r?\n)*(?:[\),])/d

    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(
            ['javascript', 'javascriptreact', 'typescript', 'typescriptreact'],
            {
                async provideDefinition(
                    doc: TextDocument,
                    pos: Position,
                    _token: CancellationToken,
                ): Promise<Array<LocationLink> | null> {
                    const symbols = await vscode.commands.executeCommand<
                        vscode.DocumentSymbol[]
                    >('vscode.executeDocumentSymbolProvider', doc.uri)
                    const symbol = symbols.find(symbol =>
                        symbol.range.contains(pos),
                    )
                    if (!symbol) {
                        return null
                    }
                    const code = doc.getText(symbol.range)
                    const tsDefMatch = TS_DEF_WORKER_REGEX.exec(code)
                    if (!tsDefMatch) {
                        return null
                    }
                    const workerUrl = tsDefMatch.groups!.wu.substring(
                        1,
                        tsDefMatch.groups!.wu.length - 1,
                    )
                    const targetUri = await relativeTargetUriIfExists(
                        doc,
                        workerUrl,
                    )
                    if (targetUri === null) {
                        return null
                    }
                    const [start, end] = tsDefMatch.indices!.groups!.wu
                    const range = new vscode.Range(
                        doc.positionAt(
                            doc.offsetAt(symbol.range.start) + start,
                        ),
                        doc.positionAt(doc.offsetAt(symbol.range.start) + end),
                    )
                    if (!range.contains(pos)) {
                        return null
                    }
                    return [
                        {
                            originSelectionRange: range,
                            targetRange: new vscode.Range(0, 0, 0, 0),
                            targetUri,
                        },
                    ]
                },
            },
        ),
    )
}

function isCursorWithinCaptureGroup(
    pos: Position,
    [start, end]: [number, number],
): boolean {
    return pos.character >= start && pos.character <= end
}

async function relativeTargetUriIfExists(
    from: TextDocument,
    to: string,
): Promise<vscode.Uri | null> {
    return await targetUriIfExists(join(dirname(from.uri.fsPath), to))
}

async function targetUriIfExists(absPath: string): Promise<vscode.Uri | null> {
    const targetUri = vscode.Uri.file(absPath)
    const targetDoc = await openDefinitionTargetDoc(vscode.Uri.file(absPath))
    if (targetDoc === null) {
        return null
    }
    return targetUri
}

async function openDefinitionTargetDoc(
    targetUri: vscode.Uri,
): Promise<TextDocument | null> {
    try {
        return await vscode.workspace.openTextDocument(targetUri)
    } catch {
        console.warn('could not open', targetUri.toString())
        return null
    }
}

export function deactivate() {
    console.log('DANK extension deactivated')
}
