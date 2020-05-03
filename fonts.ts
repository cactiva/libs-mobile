import basefonts from "./assets/fonts";
import overideFonts from "../assets/fonts";
import fonts from "./assets/fonts";

export const sourceFonts = { ...basefonts, ...overideFonts };
function generateFont<T, S>(a: T, b: S): T & S {
  const fonts: any = {};
  Object.keys(sourceFonts).map((x) => {
    let key = x.replace(/[^a-zA-Z]/g, "");
    fonts[key] = x;
  });
  return fonts;
}

const Fonts = generateFont(basefonts, overideFonts);

export default Fonts;
