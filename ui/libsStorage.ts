import { Model } from "../model/model";

export class Storage<T extends Model = any> extends Model<T> {
  hasCameraPermission = false;
  hasImagePickPermission = false;
  camera = {
    ratio: "",
    flashMode: "",
    type: "",
  };
  cacheExist = false;
}

const libsStorage = Storage.create({
  localStorage: true,
  storageName: "libs",
});
export default libsStorage;
