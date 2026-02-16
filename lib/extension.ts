import type { ExtensionContext } from 'vscode'
import { registerHtmlDefinitionProvider } from './HtmlDefinitions.ts'
import { registerJavaScriptDefinitionProvider } from './JavaScriptDefinitions.ts'

export function activate(context: ExtensionContext) {
    console.log('DANK extension for @eighty4/dank activated')
    context.subscriptions.push(...registerHtmlDefinitionProvider())
    context.subscriptions.push(registerJavaScriptDefinitionProvider())
}

export function deactivate() {
    console.log('DANK extension for @eighty4/dank deactivated')
}
