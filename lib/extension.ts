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

    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider('html', {
            async provideDefinition(
                doc: TextDocument,
                pos: Position,
                _token: CancellationToken,
            ): Promise<Array<LocationLink> | null> {
                const line = doc.lineAt(pos.line)
                const partialRegex = /<!--\s*\{\{\s*(?<pp>.+?)\s*\}\}\s*-->/dg
                let partialPathMatch: RegExpExecArray | null = null
                while (
                    (partialPathMatch = partialRegex.exec(line.text)) !== null
                ) {
                    const [start, end] = partialPathMatch.indices!.groups!.pp
                    const cursorWithinMatch =
                        pos.character >= start && pos.character <= end
                    if (!cursorWithinMatch) {
                        continue
                    }
                    const partialPath = partialPathMatch.groups!.pp.trim()
                    if (extname(partialPath) !== '.html') {
                        break
                    }
                    const docDir = dirname(doc.uri.fsPath)
                    const absPartialPath = join(docDir, partialPath)
                    const targetUri = vscode.Uri.file(absPartialPath)
                    let targetDoc: TextDocument | null = null
                    try {
                        targetDoc =
                            await vscode.workspace.openTextDocument(targetUri)
                    } catch {
                        console.warn('could not open', targetUri.toString())
                    }
                    if (targetDoc === null) {
                        break
                    }
                    const locationLink: LocationLink = {
                        originSelectionRange: new vscode.Range(
                            line.range.start.translate(0, start),
                            line.range.start.translate(0, end),
                        ),
                        targetRange: new vscode.Range(0, 0, 0, 0),
                        targetUri,
                    }
                    return [locationLink]
                }
                return null
            },
        }),
    )
}

export function deactivate() {
    console.log('DANK extension deactivated')
}
