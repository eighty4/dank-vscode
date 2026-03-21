import * as vscode from 'vscode'
import { registerCheckDependencyCommand } from './checkDankVersion/checkDankVersion.ts'
import { IS_TEST } from './env.ts'
import { registerHtmlDefinitionProvider } from './HtmlDefinitions.ts'
import { registerJavaScriptDefinitionProvider } from './JavaScriptDefinitions.ts'

export function activate(context: vscode.ExtensionContext) {
    console.log('DANK extension for @eighty4/dank activated')

    context.subscriptions.push(...registerHtmlDefinitionProvider())
    context.subscriptions.push(registerJavaScriptDefinitionProvider())
    context.subscriptions.push(registerCheckDependencyCommand())

    if (!IS_TEST) {
        vscode.commands.executeCommand('DANK.checkDependency').then()
    }
}

export function deactivate() {
    console.log('DANK extension for @eighty4/dank deactivated')
}
