import * as vscode from "vscode";

import createApexSelector from "./commands/createApexSelector";
import createApexTrigger from "./commands/createApexTrigger";
import refreshApexSelector from "./commands/refreshSelector";

export function activate(context: vscode.ExtensionContext) {
    vscode.window.showInformationMessage("MySF extension is active!");
    vscode.window.showInformationMessage(
        vscode.extensions.getExtension("AndriiSolokh.mysf")?.extensionPath ?? ""
    );
    context.subscriptions.push(
        vscode.commands.registerCommand("mysf.createApexSelector", () => {
            createApexSelector(context);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("mysf.createApexTrigger", () => {
            createApexTrigger(context);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("mysf.refreshApexSelector", () => {
            refreshApexSelector(context);
        })
    );
}

// This method is called when your extension is deactivated
export function deactivate() {}
