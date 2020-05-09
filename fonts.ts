import basefonts from "./assets/fonts";
import overideFonts from "../assets/fonts";
export const sourceFonts = { ...basefonts, ...overideFonts };

function generateFont<T>(source: T) {
  let fonts = {};
  Object.keys(source).map((x: string) => {
    fonts[x] = x;
  });
  return {
    ...fonts,
  } as T;
}

const Fonts = generateFont(sourceFonts);

export default Fonts;
