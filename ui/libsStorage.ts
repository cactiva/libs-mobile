import { Camera } from "expo-camera";
import { Model } from "../model/model";

export class Storage<T extends Model = any> extends Model<T> {
  hasCameraPermission = false;
  hasImagePickPermission = false;
  camera = {
    ratio: "16:9",
    flashMode: "auto",
    type: Camera.Constants.Type.back,
  };
  cacheExist = false;
}

const libsStorage = Storage.create({
  localStorage: true,
  storageName: "libs",
});
export default libsStorage;
