/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";
import { promises as fs } from "fs";
import {
    generateFiles,
    askForObject,
    openFiles,
    workspaceClassesPath,
    sfdxObjectsStandardPath,
    sfdxObjectsCustomPath,
    getObjectFileds as getObjectFields,
    formatObjectName,
} from "../common";
import path = require("path");

async function updateSelectors(objectName: string) {
    // const files = await fs.readdir(workspaceClassesPath);
    // const selectors = files.filter((file) => file.endsWith("Selector.cls"));
    // for (const selectorFilePath of selectors) {
    const formatedObjectName = formatObjectName(objectName);
    const selectorFileName = `${formatedObjectName}Selector.cls`;
    const selectorFilePath = path.join(workspaceClassesPath, selectorFileName);
    let selectorContent = await fs.readFile(selectorFilePath, "utf-8");
    const fields = (await getObjectFields(objectName)) ?? [];
    const joinedFields =
        "\n" + fields.map((field) => `\t\t'${field}'`).join(",\n") + "\n\t";
    selectorContent = selectorContent.replace(
        /(?<=ALL_FIELD_NAMES = new List<String>{)(\n|.)*?(?=};)/,
        joinedFields
    );

    await fs.writeFile(selectorFilePath, selectorContent);
    return [selectorFilePath];
}

export default async function refreshSObjects(
    context: vscode.ExtensionContext
) {
    const objectName = (await askForObject()) ?? "";
    const selectors = await updateSelectors(objectName);
    await openFiles(selectors);
}
