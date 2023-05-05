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
    if (!objectName) { return; }
    const filteredFields = await getSelectorFields(objectName);
    const fieldNames = filteredFields.map(
        (field: Field) => `${objectName}.${field.name}`
    );
    const joinedFieldNames = fieldNames?.join(", ") ?? "";
    const joinedFieldNamesQuoted = "'" + fieldNames?.join("', '") + "'" ?? "";
    const formatedObjectName = objectName?.replace("__c", "").replaceAll("_", "");

    const generatedFiles = await generateFiles(formatedObjectName, "Selector", {
        FIELD_NAMES: joinedFieldNames,
        FIELD_NAMES_QUOTED: joinedFieldNamesQuoted,
        SOBJECT_NAME: objectName,
    });

    return generatedFiles;
}

export async function getSelectorFields(objectName: string): Promise<Field[]> {
    const objectDescribe = await fetchObjectDescribe(objectName);
    const fields = objectDescribe?.fields ?? [];
    const filteredTypes: string[] = [
        "id",
        "boolean",
        "reference",
        "string",
        "picklist",
        "double",
        "address",
        "phone",
        "url",
        "currency",
        "int",
        "datetime",
        "date",
        "multipicklist",
        "percent",
    ];
    const filteredFields = fields.filter((field: Field) =>
        filteredTypes.includes(field.type)
    );
    return filteredFields;
}

export default async function createApexSelector(
    context: vscode.ExtensionContext
) {
    const selectedObjectName = (await askForObject()) || "";
    const generatedFiles = await generateSelector(selectedObjectName);
    await openFiles(generatedFiles);
}
