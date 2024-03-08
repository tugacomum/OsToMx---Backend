"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeScript = void 0;
const mendixmodelsdk_1 = require("mendixmodelsdk");
const mendixplatformsdk_1 = require("mendixplatformsdk");
const APP_ID = "f5809059-4962-4d45-ba11-bc8de7f1bbc7";
async function executeScript(jsonData) {
    await getApp(APP_ID);
    async function getApp(ai) {
        (0, mendixplatformsdk_1.setPlatformConfig)({
            mendixToken: "7c9iMCE3J28EBXXJmAmaAQeKEmyo4mAw9aU2PnPztTp7vDNvWxxsqdaKTZt1JJQPZmLCCqVV1S89YdrSsVgrndYoUGV8SbjguTSG",
        });
        const client = new mendixplatformsdk_1.MendixPlatformClient();
        const app = client.getApp(ai);
        const workingCopy = await app.createTemporaryWorkingCopy("main");
        const model = await workingCopy.openModel();
        const domainModelInterface = model
            .allDomainModels()
            .filter((dm) => dm.containerAsModule.name === "MyFirstModule")[0];
        const domainModel = await domainModelInterface.load();
        for (const entityData of jsonData) {
            const entityName = entityData.Name;
            const entity = mendixmodelsdk_1.domainmodels.Entity.createIn(domainModel);
            entity.name = entityName;
            for (const attributeData of entityData.Attributes) {
                const attributeName = attributeData.Attribute;
                if (attributeName != "Id") {
                    const attributeType = getDataType(attributeData.Type);
                    const attribute = mendixmodelsdk_1.domainmodels.Attribute.createIn(entity);
                    attribute.name = attributeName;
                    attribute.type = attributeType;
                    if (attributeType instanceof mendixmodelsdk_1.domainmodels.StringAttributeType) {
                        attributeType.length = attributeData.Length ? parseInt(attributeData.Length, 10) : 50;
                    }
                    else if (attributeType instanceof mendixmodelsdk_1.domainmodels.DecimalAttributeType) {
                        mendixmodelsdk_1.domainmodels.StoredValue.createIn(attribute).defaultValue = attributeData.Decimals ? parseInt(attributeData.Decimals, 10).toString() : "10";
                    }
                    /*for (const indexData of entityData.Indexes) {
                      const indexName = indexData.Name;
                      const index = domainmodels.Index.createIn(entity);
                      const indexx = domainmodels.IndexedAttribute.createIn(index);
                      indexx.attribute = indexName;
                    }*/
                }
            }
        }
        function getDataType(dataType) {
            switch (dataType.toLowerCase()) {
                case "text":
                    return mendixmodelsdk_1.domainmodels.StringAttributeType.create(model);
                case "integer":
                    return mendixmodelsdk_1.domainmodels.IntegerAttributeType.create(model);
                case "long integer":
                    return mendixmodelsdk_1.domainmodels.LongAttributeType.create(model);
                case "boolean":
                    return mendixmodelsdk_1.domainmodels.BooleanAttributeType.create(model);
                case "datetime":
                    return mendixmodelsdk_1.domainmodels.DateTimeAttributeType.create(model);
                case "binary data":
                    return mendixmodelsdk_1.domainmodels.BinaryAttributeType.create(model);
                case "enumeration":
                    return mendixmodelsdk_1.domainmodels.EnumerationAttributeType.create(model);
                case "decimal":
                    return mendixmodelsdk_1.domainmodels.DecimalAttributeType.create(model);
                default:
                    return mendixmodelsdk_1.domainmodels.StringAttributeType.create(model);
            }
        }
        await model.flushChanges();
        await workingCopy.commitToRepository("main");
        return workingCopy;
    }
}
exports.executeScript = executeScript;
