/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";
import { generateFiles, askForObject, openFiles } from "../common";

async function generateTrigger(objectName: string) {
    const formatedObjectName = objectName?.replace("__c", "").replace("__", "");

    const generatedFiles = await generateFiles(formatedObjectName, "Trigger", {
        SOBJECT_NAME: objectName,
    });

    return generatedFiles;
}

export default async function createApexTrigger(
    context: vscode.ExtensionContext
) {
    const selectedObjectName = (await askForObject()) || "";
    const generatedFiles = await generateTrigger(selectedObjectName);
    await openFiles(generatedFiles);
}
