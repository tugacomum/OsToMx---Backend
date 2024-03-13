"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeScript = void 0;
const mendixmodelsdk_1 = require("mendixmodelsdk");
const mendixplatformsdk_1 = require("mendixplatformsdk");
const APP_ID = "15e89864-5ea4-4f36-ab1c-cebf70d4944b";
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
        const entitiesMap = {};
        jsonData.forEach(entityData => {
            let entity = domainModel.entities.find(e => e.name === entityData.Name);
            if (!entity) {
                console.log(`Criando entidade "${entityData.Name}"`);
                entity = mendixmodelsdk_1.domainmodels.Entity.createIn(domainModel);
                entity.name = entityData.Name;
                entitiesMap[entityData.Name] = entity;
                entityData.Attributes.forEach((attributeData) => {
                    if (attributeData.Attribute !== "Id") {
                        const attribute = mendixmodelsdk_1.domainmodels.Attribute.createIn(entity);
                        attribute.name = attributeData.Attribute;
                        attribute.type = getDataType(attributeData.Type);
                        if (attribute.type instanceof mendixmodelsdk_1.domainmodels.StringAttributeType) {
                            attribute.type.length = attributeData.Length ? parseInt(attributeData.Length, 10) : 50;
                        }
                        else if (attribute.type instanceof mendixmodelsdk_1.domainmodels.DecimalAttributeType) {
                            mendixmodelsdk_1.domainmodels.StoredValue.createIn(attribute).defaultValue = attributeData.Decimals ? attributeData.Decimals.toString() : "0";
                        }
                    }
                });
            }
        });
        jsonData.forEach(entityData => {
            const entity = entitiesMap[entityData.Name];
            entityData.Attributes.forEach((attributeData) => {
                if (attributeData.IsIdentifier) {
                    const referencedEntityName = attributeData.Type.replace(" Identifier", "");
                    const referencedEntity = entitiesMap[referencedEntityName];
                    if (referencedEntity) {
                        console.log(`Criando relação 1-1 entre ${entity.name} e ${referencedEntity.name}`);
                        const association1to1 = mendixmodelsdk_1.domainmodels.Association.createIn(domainModel);
                        association1to1.name = `${referencedEntity.name}_${entity.name}`;
                        association1to1.parent = entity;
                        association1to1.child = referencedEntity;
                        association1to1.type = mendixmodelsdk_1.domainmodels.AssociationType.Reference;
                        association1to1.owner = mendixmodelsdk_1.domainmodels.AssociationOwner.Both;
                    }
                    else {
                        console.log(`Entidade referenciada "${referencedEntityName}" não encontrada para o atributo "Id" em "${entity.name}"`);
                    }
                }
            });
        });
        jsonData.forEach((entityData) => {
            const entity = domainModel.entities.find((e) => e.name === entityData.Name);
            if (entity && entityData.Indexes) {
                entityData.Indexes.forEach((indexData) => {
                    if (indexData.Name.toLowerCase() === "autoindex_id") {
                        return;
                    }
                    const index = mendixmodelsdk_1.domainmodels.Index.createIn(entity);
                    const attributeName = translateIndexName(indexData.Name);
                    const attributeToIndex = entity.attributes.find((attr) => translateIndexName(attr.name) === attributeName);
                    if (attributeToIndex) {
                        const indexedAttribute = mendixmodelsdk_1.domainmodels.IndexedAttribute.createIn(index);
                        indexedAttribute.attribute = attributeToIndex;
                    }
                    else {
                        console.log(`Atributo para índice ${indexData.Name} não encontrado em ${entityData.Name}.`);
                    }
                });
            }
        });
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
        function translateIndexName(indexOrAttributeName) {
            const lowerCasedName = indexOrAttributeName.toLowerCase();
            const translations = {
                title: "Titulo",
                name: "Nome",
            };
            return translations[lowerCasedName] || indexOrAttributeName;
        }
        await model.flushChanges();
        await workingCopy.commitToRepository("main");
        return workingCopy;
    }
}
exports.executeScript = executeScript;
