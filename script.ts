import { domainmodels } from "mendixmodelsdk";
import { MendixPlatformClient, setPlatformConfig } from "mendixplatformsdk";

const APP_ID = "f5809059-4962-4d45-ba11-bc8de7f1bbc7";

export async function executeScript(jsonData: any) {
  await getApp(APP_ID);

  async function getApp(ai: string) {
    setPlatformConfig({
      mendixToken:
        "7c9iMCE3J28EBXXJmAmaAQeKEmyo4mAw9aU2PnPztTp7vDNvWxxsqdaKTZt1JJQPZmLCCqVV1S89YdrSsVgrndYoUGV8SbjguTSG",
    });

    const client = new MendixPlatformClient();
    const app = client.getApp(ai);

    const workingCopy = await app.createTemporaryWorkingCopy("main");
    const model = await workingCopy.openModel();

    const domainModelInterface = model
      .allDomainModels()
      .filter((dm) => dm.containerAsModule.name === "MyFirstModule")[0];

    const domainModel = await domainModelInterface.load();

    for (const entityData of jsonData) {
      const entityName = entityData.Name;
      const entity = domainmodels.Entity.createIn(domainModel);
      entity.name = entityName;

      for (const attributeData of entityData.Attributes) {
        const attributeName = attributeData.Attribute;
        if (attributeName != "Id") {
          const attributeType = getDataType(attributeData.Type);
          const attribute = domainmodels.Attribute.createIn(entity);
          attribute.name = attributeName;
          attribute.type = attributeType;

          // define default value de boolean para false e caso seja string/decimals atribui o valor vindo do json

          if (attributeType instanceof domainmodels.StringAttributeType) {
            attributeType.length = length ? parseInt(attributeData.Length, 10) : 50;
          } else if (attributeType instanceof domainmodels.BooleanAttributeType) {
            domainmodels.StoredValue.createIn(attribute).defaultValue = "false";
          } else if (attributeType instanceof domainmodels.DecimalAttributeType) {
            domainmodels.StoredValue.createIn(attribute).defaultValue = attributeData.Length ? parseInt(attributeData.Length, 10).toString() : "10";
          } 

          // criar relação default de 1 para n caso o Id da entidade seja "exemplo Identifier"
        }
      }
    }

    function getDataType(dataType: string) {
      switch (dataType.toLowerCase()) {
        case "text":
          return domainmodels.StringAttributeType.create(model);
        case "integer":
          return domainmodels.IntegerAttributeType.create(model);
        case "long integer":
          return domainmodels.LongAttributeType.create(model);
        case "boolean":
          return domainmodels.BooleanAttributeType.create(model);
        case "datetime":
          return domainmodels.DateTimeAttributeType.create(model);
        case "binary data":
          return domainmodels.BinaryAttributeType.create(model);
        case "enumeration":
          return domainmodels.EnumerationAttributeType.create(model);
        case "decimal":
          return domainmodels.DecimalAttributeType.create(model);
        default:
          return domainmodels.StringAttributeType.create(model);
      }
    }

    await model.flushChanges();

    await workingCopy.commitToRepository("main");

    return workingCopy;
  }
}