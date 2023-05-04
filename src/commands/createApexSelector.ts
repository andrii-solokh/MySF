/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";
import {
    generateFiles,
    askForObject,
    openFiles,
    getObjectFileds,
    fetchObjectDescribe,
    Field,
} from "../common";

async function generateSelector(objectName: string) {
    const objectDescribe = await fetchObjectDescribe(objectName);
    const fields = objectDescribe?.fields ?? [];
    // const allTypes: string[] = ["id", "boolean", "reference", "string", "picklist", "textarea", "double", "address", "phone", "url", "currency", "int", "datetime", "date", "multipicklist", "percent"]
    const filteredTypes: string[] = ["id", "boolean", "reference", "string", "picklist", "double", "address", "phone", "url", "currency", "int", "datetime", "date", "multipicklist", "percent"]
    const filteredFields = fields.filter((field: Field) =>
        filteredTypes.includes(field.type)
    );
    const fieldNames = filteredFields.map((field: Field) => field.name);
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
