/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";
import {
    generateFiles,
    askForObject,
    openFiles,
    getObjectFileds,
} from "../common";

async function generateSelector(objectName: string) {
    const fieldNames = await getObjectFileds(objectName);
    const joinedFieldNames = fieldNames?.join(", ") ?? "";
    const joinedFieldNamesQuoted = "'" + fieldNames?.join("', '") + "'" ?? "";
    const formatedObjectName = objectName?.replace("__c", "").replace("__", "");

    const generatedFiles = await generateFiles(formatedObjectName, "Selector", {
        FIELD_NAMES: joinedFieldNames,
        FIELD_NAMES_QUOTED: joinedFieldNamesQuoted,
        SOBJECT_NAME: objectName,
    });

    return generatedFiles;
}

export default async function createApexSelector(
    context: vscode.ExtensionContext
) {
    const selectedObjectName = (await askForObject()) || "";
    const generatedFiles = await generateSelector(selectedObjectName);
    await openFiles(generatedFiles);
}
