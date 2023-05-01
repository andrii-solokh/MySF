/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";
import * as path from "path";
import { promises as fs } from "fs";

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

interface FileConfig {
    sourceTemplatePath: string;
    classNameTemplate: string;
    metadataTemplatePath: string;
}

interface TemplateMetadata {
    files: FileConfig[];
    destinationPath: string;
}

type Presets = "Selector" | "Trigger";

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
