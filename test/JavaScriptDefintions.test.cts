import assert from 'node:assert/strict'
import { join } from 'node:path'
import * as vscode from 'vscode'

function fixtureUri(
    filename:
        | 'badExtension'
        | 'badPath'
        | 'doubleQuote'
        | 'multiline'
        | 'singleQuote'
        | 'worker',
): vscode.Uri {
    return vscode.Uri.file(
        join(
            __dirname,
            `../fixtures/dank-project/pages/jsDefinitions/${filename}.ts`,
        ),
    )
}

suite('JavaScriptDefinitionProvider', () => {
    suite('worker url definitions', () => {
        suite('resolves', () => {
            test('single quoted worker url to uri', async () => {
                const doc = await vscode.workspace.openTextDocument(
                    fixtureUri('singleQuote'),
                )
                const workerUrlRegex =
                    /new (?:Shared)?Worker\((?:'|")(?<wu>.*?)(?:'|")\)/d
                const workerUrlMatch = workerUrlRegex.exec(doc.getText())
                if (!workerUrlMatch) {
                    assert.fail()
                }
                const [start, end] = workerUrlMatch.indices!.groups!.wu
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
                    fixtureUri('worker').fsPath,
                )
            })

            test('double quoted worker url to uri', async () => {
                const doc = await vscode.workspace.openTextDocument(
                    fixtureUri('doubleQuote'),
                )
                const workerUrlRegex =
                    /new (?:Shared)?Worker\((?:'|")(?<wu>.*?)(?:'|")\)/d
                const workerUrlMatch = workerUrlRegex.exec(doc.getText())
                if (!workerUrlMatch) {
                    assert.fail()
                }
                const [start, end] = workerUrlMatch.indices!.groups!.wu
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
                    fixtureUri('worker').fsPath,
                )
            })

            test('multiline worker ctor worker url to uri', async () => {
                const doc = await vscode.workspace.openTextDocument(
                    fixtureUri('multiline'),
                )
                const pos = doc.positionAt(
                    doc.getText().indexOf(`'./worker.ts'`) + 4,
                )
                const definitions =
                    await vscode.commands.executeCommand<Array<vscode.LocationLink> | null>(
                        'vscode.executeDefinitionProvider',
                        doc.uri,
                        pos,
                    )
                assert.equal(definitions?.length, 1)
                assert.equal(
                    definitions[0].targetUri.fsPath,
                    fixtureUri('worker').fsPath,
                )
            })

            test('worker url string as an entire word', async () => {
                const doc = await vscode.workspace.openTextDocument(
                    fixtureUri('singleQuote'),
                )
                const workerUrl = `./worker.ts`
                const start = doc.getText().indexOf(workerUrl)
                if (start === -1) assert.fail()
                const end = start + workerUrl.length
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

        suite('returns null', () => {
            test('when worker url is path to missing source file', async () => {
                const doc = await vscode.workspace.openTextDocument(
                    fixtureUri('badPath'),
                )
                const workerUrlRegex =
                    /new (?:Shared)?Worker\((?:'|")(?<wu>.*?)(?:'|")\)/d
                const workerUrlMatch = workerUrlRegex.exec(doc.getText())
                if (!workerUrlMatch) {
                    assert.fail()
                }
                const [start, end] = workerUrlMatch.indices!.groups!.wu
                const middle = start + (end - start) / 2
                const pos = doc.positionAt(middle)
                const definitions =
                    await vscode.commands.executeCommand<Array<vscode.LocationLink> | null>(
                        'vscode.executeDefinitionProvider',
                        doc.uri,
                        pos,
                    )
                assert.equal(definitions?.length, 0)
            })

            test('when worker url has extension to non-js source file', async () => {
                const doc = await vscode.workspace.openTextDocument(
                    fixtureUri('badExtension'),
                )
                const workerUrlRegex =
                    /new (?:Shared)?Worker\((?:'|")(?<wu>.*?)(?:'|")\)/d
                const workerUrlMatch = workerUrlRegex.exec(doc.getText())
                if (!workerUrlMatch) {
                    assert.fail()
                }
                const [start, end] = workerUrlMatch.indices!.groups!.wu
                const middle = start + (end - start) / 2
                const pos = doc.positionAt(middle)
                const definitions =
                    await vscode.commands.executeCommand<Array<vscode.LocationLink> | null>(
                        'vscode.executeDefinitionProvider',
                        doc.uri,
                        pos,
                    )
                assert.equal(definitions?.length, 0)
            })
        })
    })
})
