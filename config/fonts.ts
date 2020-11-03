import customFonts from "@src/config/fonts";

export const sourceFonts = {
  NotoSansRegular: require("../assets/fonts/NotoSans-Regular.ttf"),
  ...(customFonts || {}),
};

function generateFont<T>(source: T): T {
  let fonts: any = {};
  Object.keys(source).map((x: string) => {
    fonts[x] = x;
  });

  return fonts as T;
}

const Fonts = generateFont(sourceFonts);

export default Fonts;
