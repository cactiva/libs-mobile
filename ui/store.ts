import store from "../store";

const libsStorage = store("libs", {
  hasCameraPermission: null,
  hasImagePickPermission: null,
  camera: {},
  images: {},
  cacheExist: false,
});

export default libsStorage;
