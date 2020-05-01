import { default as overideFonts } from "../../../assets/fonts";

export default {
  "NotoSans-Regular": require("./NotoSans-Regular.ttf"),
  ...(overideFonts || {}),
};
