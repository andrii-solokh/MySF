import * as vscode from "vscode";

import createApexSelector from "./commands/createApexSelector";
import createApexTrigger from "./commands/createApexTrigger";
import refreshApexSelector from "./commands/refreshSelector";
import createFieldType from "./commands/createFieldType";

export function activate(context: vscode.ExtensionContext) {
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

    context.subscriptions.push(
        vscode.commands.registerCommand("mysf.createFieldType", () => {
            createFieldType(context);
        })
    );
}

export function deactivate() {}
