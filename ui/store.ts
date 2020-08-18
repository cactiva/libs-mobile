import store from "../store";

const libsStorage = store("libs", {
  hasCameraPermission: null,
  hasImagePickPermission: null,
  camera: {},
  cacheImages: {},
  cacheExist: false,
  toast: null,
});

export default libsStorage;
