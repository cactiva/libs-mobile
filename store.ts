import { observable, observe, toJS } from "mobx";
import { AsyncStorage } from "react-native";

const storage = AsyncStorage;

export default (name: string, data: any) => {
  const initData = data;
  const obs = observable(initData);
  const vname = `store.${name}`;
  storage
    .getItem(vname)
    .then(res => {
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
