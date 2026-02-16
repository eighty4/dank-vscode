import assert from 'node:assert/strict'
import { join } from 'node:path'
import * as vscode from 'vscode'

suite('HtmlDefinitionProvider', () => {
    suite('partial path definitions', () => {
        suite('resolves', () => {
            test('partial path to uri', async () => {
                const dankHtmlUri = vscode.Uri.file(
                    join(__dirname, '../fixtures/dank-project/pages/dank.html'),
                )
                const doc = await vscode.workspace.openTextDocument(dankHtmlUri)
                const partialPathRegex = /<!--\s+{{\s+(?<pp>.*)\s+}}-->/d
                const partialPathMatch = partialPathRegex.exec(doc.getText())
                if (!partialPathMatch) {
                    assert.fail()
                }
                const [start, end] = partialPathMatch.indices!.groups!.pp
                const middle = start + (end - start) / 2
                const pos = doc.positionAt(middle)
                const definitions =
                    await vscode.commands.executeCommand<Array<vscode.LocationLink> | null>(
                        'vscode.executeDefinitionProvider',
                        doc.uri,
                        pos,
                    )
                assert.equal(definitions?.length, 1)
                assert.equal(
                    definitions[0].targetUri.fsPath,
                    vscode.Uri.file(
                        join(
                            __dirname,
                            '../fixtures/dank-project/pages/partial.html',
                        ),
                    ).fsPath,
                )
            })

            test('partial path string as an entire word', async () => {
                const dankHtmlUri = vscode.Uri.file(
                    join(__dirname, '../fixtures/dank-project/pages/dank.html'),
                )
                const doc = await vscode.workspace.openTextDocument(dankHtmlUri)
                const partialPathRegex = /<!--\s+{{\s+(?<pp>.*)\s+}}-->/d
                const partialPathMatch = partialPathRegex.exec(doc.getText())
                if (!partialPathMatch) {
                    assert.fail()
                }
                const [start, end] = partialPathMatch.indices!.groups!.pp
                for (let i = start; i < end + 1; i++) {
                    const pos = doc.positionAt(i)
                    const definitions =
                        await vscode.commands.executeCommand<Array<vscode.LocationLink> | null>(
                            'vscode.executeDefinitionProvider',
                            doc.uri,
                            pos,
                        )
                    assert.equal(definitions?.length, 1)
                }
            })
        })
    })
})
