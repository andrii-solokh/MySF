/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";
import { promises as fs } from "fs";
import {
    askForObject,
    askForField,
    openFiles,
    workspaceClassesPath,
    getObjectFileds as getObjectFields,
    formatObjectName,
    toSnakeCase,
    Field,
    generateFiles,
    insertAfter,
    insertBetween,
    replaceBeetween,
} from "../common";
import path = require("path");

export default async function createTypeForField(
    context: vscode.ExtensionContext
) {
    const objectName = (await askForObject()) ?? "";
    const fieldTypes = ["picklist", "multipicklist"];
    const fieldFilter = (field: { type: string }) =>
        fieldTypes.includes(field.type);
    const field = await askForField(objectName, fieldFilter);

    if (!field) {
        return;
    }

    const orgFilePath = path.join(workspaceClassesPath, "ORG.cls");
    let orgFileContent;

    try {
        orgFileContent = (await fs.readFile(orgFilePath, "utf-8")) as string;
    } catch (error) {
        const [generatedOrgFilePath] = await generateFiles("ORG", "ORG", {});
        orgFileContent = (await fs.readFile(generatedOrgFilePath, "utf-8")) as string;
    }

    orgFileContent = updateFieldType(orgFileContent, objectName, field);
    orgFileContent = updateObjectType(orgFileContent, objectName, field);
    orgFileContent = updateObjectInstance(orgFileContent, objectName);

    orgFileContent = addLastBRIfNeeded(orgFileContent);

    await fs.writeFile(orgFilePath, orgFileContent);
    await openFiles([orgFilePath]);
}

function addLastBRIfNeeded(content: string) {
    if (!content.endsWith("\n}")) {
        const index = content.lastIndexOf("}");
        return content.slice(0, index) + "\n}";
    }
    return content;
}


function updateObjectType(
    orgFileContent: string,
    objectName: string,
    field: Field
) {
    const formatedObjectName = toSnakeCase(
        formatObjectName(objectName)
    ).toUpperCase();

    const formatedFieldName = toSnakeCase(
        formatObjectName(field.name)
    ).toUpperCase();

    const fieldTypeName = `${formatedObjectName}_${formatedFieldName}`;

    return insertBetween(
        orgFileContent,
        `public class ${formatedObjectName} {`,
        "}",
        `public final ${fieldTypeName} ${formatedFieldName} = new ${fieldTypeName}();`
    );
}

function updateObjectInstance(orgFileContent: string, objectName: string) {
    const formatedObjectName = toSnakeCase(
        formatObjectName(objectName)
    ).toUpperCase();

    return insertAfter(
        orgFileContent,
        `public class ORG {`,
        `public static final ${formatedObjectName} ${formatedObjectName} = new ${formatedObjectName}();`
    );
}

function updateFieldType(
    orgFileContent: string,
    objectName: string,
    field: Field
) {
    const picklistValues = field.picklistValues.map((value) => value.value);

    const formatedObjectName = toSnakeCase(
        formatObjectName(objectName)
    ).toUpperCase();

    const formatedFieldName = toSnakeCase(
        formatObjectName(field.name)
    ).toUpperCase();

    const fieldTypeName = `${formatedObjectName}_${formatedFieldName}`;

    const joindPicklistValues = picklistValues
        .map((picklistValue) => {
            const formatedValue = toSnakeCase(
                formatObjectName(picklistValue)
            ).toUpperCase();
            return `\n\t\tpublic final String ${formatedValue} = '${picklistValue}';`;
        })
        .join("");

    return replaceBeetween(
        orgFileContent,
        `public class ${fieldTypeName} {`,
        `}`,
        joindPicklistValues
    );
}
