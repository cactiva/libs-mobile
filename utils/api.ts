import axios, { AxiosRequestConfig } from "axios";
import get from "lodash.get";

export interface IAPI extends AxiosRequestConfig {
  onError?: (res: any) => void;
}

export default (e: IAPI) => {
  let url = e.url;
  const headers = {
    "content-type": "application/json",
    ...get(e, "headers", {}),
  };
  let onError: any;
  if (e.onError) {
    onError = e.onError;
  }

  return new Promise(async (resolve, reject) => {
    try {
      const res = await axios({ ...e, url, headers });
      if (res.status >= 200 && res.status < 300) {
        if (!!res.data) resolve(res.data);
        else resolve(res);
      } else {
        if (res.data) onError(res.data);
        else onError(res);
        resolve();
      }
    } catch (e) {
      if (onError) {
        if (e.response && e.response.data) onError(e.response.data);
        else onError(e.response);
        resolve();
      } else {
        if (e.response && e.response.data) resolve(e.response.data);
        else resolve(e.response);
      }
    }
  });
};
