/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";
import * as path from "path";
import { promises as fs } from "fs";

export const workspacePath =
    vscode.workspace.workspaceFolders?.[0].uri.fsPath || "";

const extensionPathRoot =
    vscode.extensions.getExtension("AndriiSolokh.mysf")?.extensionPath ?? "";

const extensionPath = path.join(extensionPathRoot, "out");

export const templatesPath = path.join(extensionPath, "templates");
export const metadataPath = path.join(templatesPath, "metadata");
export const sourcePath = path.join(templatesPath, "source");
export const sfdxPath = path.join(workspacePath, ".sfdx");
export const sfdxObjectsPath = path.join(sfdxPath, "tools", "sobjects");
export const sfdxObjectsStandardPath = path.join(
    sfdxObjectsPath,
    "standardObjects"
);
export const sfdxObjectsCustomPath = path.join(
    sfdxObjectsPath,
    "customObjects"
);

export const workspaceClassesPath = path.join(
    workspacePath,
    "force-app",
    "main",
    "default",
    "classes"
);

interface FileConfig {
    sourcePath: string;
    classNameTemplate: string;
    metadataPath: string;
}

interface TemplateMetadata {
    files: FileConfig[];
    destinationPath: string;
}

type TemplateType = "Selector" | "Trigger";

const TEMPLATE_MAPPING = {
    Selector: {
        files: [
            {
                sourcePath: path.join(sourcePath, "SelectorTemplate.cls"),
                classNameTemplate: "{{NAME}}Selector",
                metadataPath: path.join(
                    metadataPath,
                    "ApexClassMetadata.cls-meta.xml"
                ),
            },
            {
                sourcePath: path.join(sourcePath, "ISelectorTemplate.cls"),
                classNameTemplate: "I{{NAME}}Selector",
                metadataPath: path.join(
                    metadataPath,
                    "ApexClassMetadata.cls-meta.xml"
                ),
            },
        ],
        destinationPath: workspaceClassesPath,
    },
    Trigger: {
        files: [
            {
                sourcePath: path.join(sourcePath, "TriggerTemplate.trigger"),
                classNameTemplate: "{{NAME}}Trigger",
                metadataPath: path.join(
                    metadataPath,
                    "TriggerMetadata.trigger-meta.xml"
                ),
            },
            {
                sourcePath: path.join(sourcePath, "TriggerHandlerTemplate.cls"),
                classNameTemplate: "{{NAME}}TriggerHandler",
                metadataPath: path.join(
                    metadataPath,
                    "ApexClassMetadata.cls-meta.xml"
                ),
            },
            {
                sourcePath: path.join(sourcePath, "ServiceTemplate.cls"),
                classNameTemplate: "{{NAME}}Service",
                metadataPath: path.join(
                    metadataPath,
                    "ApexClassMetadata.cls-meta.xml"
                ),
            },
            {
                sourcePath: path.join(sourcePath, "IServiceTemplate.cls"),
                classNameTemplate: "I{{NAME}}Service",
                metadataPath: path.join(
                    metadataPath,
                    "ApexClassMetadata.cls-meta.xml"
                ),
            },
            {
                sourcePath: path.join(sourcePath, "ServiceTestTemplate.cls"),
                classNameTemplate: "{{NAME}}ServiceTest",
                metadataPath: path.join(
                    metadataPath,
                    "ApexClassMetadata.cls-meta.xml"
                ),
            },
        ],
        destinationPath: workspaceClassesPath,
    },
};

export async function askForObject() {
    const allFiles = await Promise.all([
        fs.readdir(sfdxObjectsStandardPath),
        fs.readdir(sfdxObjectsCustomPath),
    ]);
    const objectFiles = allFiles.flat().filter((file) => file.endsWith(".cls"));

    const objectNames = objectFiles.map((objectFile) =>
        objectFile.replace(".cls", "")
    );

    return vscode.window.showQuickPick(objectNames);
}

function getExtension(fileName: string) {
    return "." + fileName.split(".").slice(1).join(".");
}

export async function generateFiles(
    name: string,
    type: TemplateType,
    params: { [key: string]: string }
): Promise<string[]> {
    const { files, destinationPath } = TEMPLATE_MAPPING[type];

    const generatedFiles = [];
    for (const file of files) {
        // load content
        const { sourcePath, classNameTemplate, metadataPath } = file;

        const sourceContent = await fs.readFile(sourcePath, "utf-8");
        const metadataContent = await fs.readFile(metadataPath, "utf-8");

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
        const fileName = className + getExtension(sourcePath);
        const metadataFileName = className + getExtension(metadataPath);

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
        : path.join(sfdxObjectsStandardPath, objectFileName);

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
