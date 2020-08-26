import { observable } from "mobx";
import Storage from "../Storage";

const libsStorage = Storage("libsStorage", {
  hasCameraPermission: null,
  hasImagePickPermission: null,
  camera: {},
  cacheImages: {},
  cacheExist: false,
  toast: null,
});

export default libsStorage;
