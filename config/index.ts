import config from "@src/config";

export interface IConfig {
  mode: "production" | string;
  [key: string]: any;
}

export default {
  ...(config || {}),
};
