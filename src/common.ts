/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";
import * as path from "path";
import { promises as fs } from "fs";
import shellExec from "shell-exec";

export const workspacePath =
    vscode.workspace.workspaceFolders?.[0].uri.fsPath || "";

const extensionPath = __dirname;

export const templatesDirPath = path.join(extensionPath, "templates");
export const metadataTemplatesDirPath = path.join(templatesDirPath, "metadata");
export const sourceTemmplatesDirPath = path.join(templatesDirPath, "source");
export const sfdxDirPath = path.join(workspacePath, ".sfdx");
export const sfdxObjectsDirPath = path.join(sfdxDirPath, "tools", "sobjects");
export const sfdxObjectsStandardDirPath = path.join(
    sfdxObjectsDirPath,
    "standardObjects"
);
export const sfdxObjectsCustomPath = path.join(
    sfdxObjectsDirPath,
    "customObjects"
);

export const workspaceClassesPath = path.join(
    workspacePath,
    "force-app",
    "main",
    "default",
    "classes"
);

export interface PicklistValue {
    value: string;
}
export interface Field {
    name: string;
    type: string;
    picklistValues: PicklistValue[];
}

interface FileConfig {
    sourceTemplatePath: string;
    classNameTemplate: string;
    metadataTemplatePath: string;
}

interface TemplateMetadata {
    files: FileConfig[];
    destinationPath: string;
}

type Presets = "Selector" | "Trigger" | "ORG";

const TEMPLATE_MAPPING: { [K in Presets]: TemplateMetadata } = {
    Selector: {
        files: [
            {
                sourceTemplatePath: path.join(
                    sourceTemmplatesDirPath,
                    "SelectorTemplate.cls"
                ),
                classNameTemplate: "{{NAME}}Selector",
                metadataTemplatePath: path.join(
                    metadataTemplatesDirPath,
                    "ApexClassMetadata.cls-meta.xml"
                ),
            },
            {
                sourceTemplatePath: path.join(
                    sourceTemmplatesDirPath,
                    "ISelectorTemplate.cls"
                ),
                classNameTemplate: "I{{NAME}}Selector",
                metadataTemplatePath: path.join(
                    metadataTemplatesDirPath,
                    "ApexClassMetadata.cls-meta.xml"
                ),
            },
        ],
        destinationPath: workspaceClassesPath,
    },
    Trigger: {
        files: [
            {
                sourceTemplatePath: path.join(
                    sourceTemmplatesDirPath,
                    "TriggerTemplate.trigger"
                ),
                classNameTemplate: "{{NAME}}Trigger",
                metadataTemplatePath: path.join(
                    metadataTemplatesDirPath,
                    "TriggerMetadata.trigger-meta.xml"
                ),
            },
            {
                sourceTemplatePath: path.join(
                    sourceTemmplatesDirPath,
                    "TriggerHandlerTemplate.cls"
                ),
                classNameTemplate: "{{NAME}}TriggerHandler",
                metadataTemplatePath: path.join(
                    metadataTemplatesDirPath,
                    "ApexClassMetadata.cls-meta.xml"
                ),
            },
            {
                sourceTemplatePath: path.join(
                    sourceTemmplatesDirPath,
                    "ServiceTemplate.cls"
                ),
                classNameTemplate: "{{NAME}}Service",
                metadataTemplatePath: path.join(
                    metadataTemplatesDirPath,
                    "ApexClassMetadata.cls-meta.xml"
                ),
            },
            {
                sourceTemplatePath: path.join(
                    sourceTemmplatesDirPath,
                    "IServiceTemplate.cls"
                ),
                classNameTemplate: "I{{NAME}}Service",
                metadataTemplatePath: path.join(
                    metadataTemplatesDirPath,
                    "ApexClassMetadata.cls-meta.xml"
                ),
            },
            {
                sourceTemplatePath: path.join(
                    sourceTemmplatesDirPath,
                    "ServiceTestTemplate.cls"
                ),
                classNameTemplate: "{{NAME}}ServiceTest",
                metadataTemplatePath: path.join(
                    metadataTemplatesDirPath,
                    "ApexClassMetadata.cls-meta.xml"
                ),
            },
        ],
        destinationPath: workspaceClassesPath,
    },
    ORG: {
        files: [
            {
                sourceTemplatePath: path.join(
                    sourceTemmplatesDirPath,
                    "ORGTemplate.cls"
                ),
                classNameTemplate: "ORG",
                metadataTemplatePath: path.join(
                    metadataTemplatesDirPath,
                    "ApexClassMetadata.cls-meta.xml"
                ),
            },
        ],
        destinationPath: workspaceClassesPath,
    },
};

export async function askForObject() {
    const allFiles = await Promise.all([
        fs.readdir(sfdxObjectsStandardDirPath),
        fs.readdir(sfdxObjectsCustomPath),
    ]);
    const objectFiles = allFiles.flat().filter((file) => file.endsWith(".cls"));

    const objectNames = objectFiles.map((objectFile) =>
        objectFile.replace(".cls", "")
    );

    return vscode.window.showQuickPick(objectNames);
}

export async function askForField(
    objectName: string,
    filter: (field: Field) => boolean
): Promise<Field | undefined> {
    const { stdout } = await shellExec(
        `sfdx force:schema:sobject:describe -s ${objectName} --json`
    );
    const unEscapedJSON = stdout
        .replace(/\n/g, "")
        .replace(/\r/g, "")
        .replace(/\t/g, "");
    const result = JSON.parse(unEscapedJSON).result;
    const fields = result.fields as Field[];
    const fieldNames = fields.filter(filter).map((field: any) => field.name);
    const recordTypeField = {} as Field;
    recordTypeField.name = "RecordType";
    recordTypeField.picklistValues = result.recordTypeInfos.map(
        (recordType: any) => {
            return { value: recordType.developerName };
        }
    );
    fieldNames.push("RecordType");
    const fieldName = await vscode.window.showQuickPick(fieldNames);
    if (fieldName === "RecordType") {
        return recordTypeField;
    }
    return fields.find((field) => field.name === fieldName);
}

function getExtension(fileName: string) {
    return "." + path.basename(fileName).split(".").slice(1).join(".");
}

export async function generateFiles(
    name: string,
    type: Presets,
    params: { [key: string]: string }
): Promise<string[]> {
    const { files: fileMetadatas, destinationPath } = TEMPLATE_MAPPING[type];

    const generatedFiles = [];

    for (const fileMetadata of fileMetadatas) {
        // load content
        const { sourceTemplatePath, classNameTemplate, metadataTemplatePath } =
            fileMetadata;

        const sourceContent = await fs.readFile(sourceTemplatePath, "utf-8");

        const metadataContent = await fs.readFile(
            metadataTemplatePath,
            "utf-8"
        );

        // format content
        const className = classNameTemplate.replaceAll("{{NAME}}", name);

        const allParams: { [key: string]: string } = {
            ...params,
            CLASS_NAME: className,
        };

        let formatedContent = sourceContent;
        for (const param in allParams) {
            formatedContent = formatedContent.replaceAll(
                `{{${param}}}`,
                allParams[param]
            );
        }

        // save files
        const fileName = className + getExtension(sourceTemplatePath);
        const metadataFileName = className + getExtension(metadataTemplatePath);

        const sourceDestinationPath = path.join(destinationPath, fileName);

        const metadataDestinationPath = path.join(
            destinationPath,
            metadataFileName
        );

        await fs.writeFile(metadataDestinationPath, metadataContent);
        await fs.writeFile(sourceDestinationPath, formatedContent);

        generatedFiles.push(sourceDestinationPath);
    }

    return generatedFiles;
}

export async function openFiles(filePaths: string[]) {
    for (const filePath of filePaths) {
        const doc = await vscode.workspace.openTextDocument(filePath);
        await vscode.window.showTextDocument(doc, {
            preview: false,
        });
    }
}

export async function getObjectFileds(objectName: string) {
    const objectFileName = objectName + ".cls";
    const isCustom = objectFileName.includes("__c");
    const selectedFilePath = isCustom
        ? path.join(sfdxObjectsCustomPath, objectFileName)
        : path.join(sfdxObjectsStandardDirPath, objectFileName);

    const selectedFile = await fs.readFile(selectedFilePath, "utf-8");

    //   const typesToInclude = ['Id','String','Double','Decimal','Boolean','Integer'];
    const regex = /\b(Id|String|Double|Decimal|Boolean|Integer)\b\s+\w+\s*/g;
    const typeWithFieldName = selectedFile.match(regex);
    const fieldNames = typeWithFieldName?.map(
        (typeWithFieldName) => typeWithFieldName.split(" ")[1]
    );
    return fieldNames;
}

export function formatObjectName(objectName: string): string {
    return objectName.replace("__c", "").replaceAll("_", "");
}

export function toSnakeCase(str: string) {
    return (
        str &&
        (
            str.match(
                /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g
            ) ?? []
        )
            .map((x) => x.toLowerCase())
            .join("_")
    );
}
