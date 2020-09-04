import { AsyncStorage } from "react-native";
import { observable, observe } from "mobx";

const storage = AsyncStorage;
const store = (name: string, data: any) => {
  const initData = data;
  const obs = observable(initData);
  const vname = `store.${name}`;
  storage
    .getItem(vname)
    .then((res) => {
      if (res) {
        let newData = JSON.parse(res);
        for (let i in newData) {
          obs[i] = newData[i];
        }
      } else {
        storage.setItem(vname, JSON.stringify(obs));
      }
    })
    .finally(() => {
      observe(obs, () => {
        storage.setItem(vname, JSON.stringify(obs));
      });
    });

  return obs as any;
};

export const resetStore = (store: Object, initData: Object) => {
  let keys = Object.keys(store);
  let initKeys = Object.keys(initData);
  keys.map((k) => {
    if (initKeys.findIndex((x) => x === k) > -1) {
      store[k] = initKeys[k];
    } else {
      delete store[k];
    }
  });
};

export default store;
