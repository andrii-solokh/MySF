/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";
import { promises as fs } from "fs";
import {
    askForObject,
    openFiles,
    workspaceClassesPath,
    getObjectFileds as getObjectFields,
    formatObjectName,
    replaceBeetween,
    Field,
} from "../common";
import path = require("path");
import { getSelectorFields } from "./createApexSelector";

async function updateSelectors(objectName: string) {
    const formatedObjectName = formatObjectName(objectName);
    const selectorFileName = `${formatedObjectName}Selector.cls`;
    const selectorFilePath = path.join(workspaceClassesPath, selectorFileName);
    const fields = await getSelectorFields(objectName);

    let selectorContent = await fs.readFile(selectorFilePath, "utf-8");
    let fieldsContent = "\n\t\treturn new List<SObjectField>{\n";
    fieldsContent += fields
        .map((field: Field) => `\t\t\t${objectName}.${field.name}`)
        .join(",\n");
    // fieldsContent += "\n\t\t};";

    selectorContent = replaceBeetween(
        selectorContent,
        "public override List<SObjectField> getFields() {",
        "};",
        fieldsContent
    );
    // selectorContent = selectorContent.replace(
    //     /(?<=ALL_FIELD_NAMES = new List<String>{)(\n|.)*?(?=};)/,
    //     joinedFields
    // );

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
