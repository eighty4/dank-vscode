import { dirname, join } from 'node:path'
import * as vscode from 'vscode'

export function isCursorWithinCaptureGroup(
    pos: vscode.Position,
    [start, end]: [number, number],
): boolean {
    return pos.character >= start && pos.character <= end
}

export async function symbolAtPointer(
    doc: vscode.TextDocument,
    pos: vscode.Position,
): Promise<vscode.DocumentSymbol | null> {
    const symbols = await vscode.commands.executeCommand<
        vscode.DocumentSymbol[]
    >('vscode.executeDocumentSymbolProvider', doc.uri)
    console.log(doc.uri.fsPath, 'typeof symbols', typeof symbols)
    for (const symbol of symbols) {
        if (symbol.range.contains(pos)) {
            return symbol
        }
    }
    return null
}

export async function relativeTargetUriIfExists(
    from: vscode.TextDocument,
    to: string,
): Promise<vscode.Uri | null> {
    return await targetUriIfExists(join(dirname(from.uri.fsPath), to))
}

export async function targetUriIfExists(
    absPath: string,
): Promise<vscode.Uri | null> {
    const targetUri = vscode.Uri.file(absPath)
    const targetDoc = await openDefinitionTargetDoc(vscode.Uri.file(absPath))
    if (targetDoc === null) {
        return null
    }
    return targetUri
}

export async function openDefinitionTargetDoc(
    targetUri: vscode.Uri,
): Promise<vscode.TextDocument | null> {
    try {
        return await vscode.workspace.openTextDocument(targetUri)
    } catch {
        return null
    }
}
