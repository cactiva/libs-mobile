import * as Application from "expo-application";
import debounce from "lodash.debounce";
import {
  applySnapshot,
  IAnyModelType,
  IModelType,
  onSnapshot,
} from "mobx-state-tree";
import { AsyncStorage } from "react-native";
import { compress, decompress } from "lz-string";

export const initiateLocalStorage = (
  storage: any,
  name?: string
): IAnyModelType => {
  const storageName = name || Application.applicationId || "data";
  const saveToLocalStorage = debounce(
    async () => {
      try {
        await AsyncStorage.getItem(storageName)
          .then((res: string | null) => {
            if (!!res && typeof res === "string") {
              let source: string | null = decompress(res);
              if (typeof source === "string") {
                applySnapshot(storage, JSON.parse(source));
              }
            }
          })
          .catch((e) => console.log(e))
          .finally(() => {
            onSnapshot(storage, (snapshot) => {
              const source = compress(JSON.stringify(snapshot));
              AsyncStorage.setItem(storageName, source);
            });
          });
      } catch (e) {
        console.log(e);
      }
    },
    3000,
    { trailing: true, leading: false, maxWait: 5000 }
  );
  saveToLocalStorage();
  return storage;
};
