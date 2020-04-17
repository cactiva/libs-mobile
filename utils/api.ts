import axios from "axios";
import _ from "lodash";
const config = require("../../../settings.json");

export default (e: any) => {
  let url = e.url;
  const headers = {
    "content-type": "application/json",
    ..._.get(e, "headers", {}),
  };
  if (e.url.indexOf("http") !== 0) {
    url = `${config.backend.protocol}://${config.backend.host}:${config.backend.port}${e.url}`;

    if (!!config.mode && config.mode === "dev") {
      url = `${config["backend-dev"].protocol}://${config["backend-dev"].host}:${config["backend-dev"].port}${e.url}`;
    }
  }
  let onError;
  if (e.onError) {
    onError = e.onError;
  }

  return new Promise(async (resolve, reject) => {
    try {
      const res = await axios({ ...e, url, headers });
      console.log(url, res);
      if (res.status >= 200 && res.status < 300) {
        if (res.data) resolve(res.data);
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
