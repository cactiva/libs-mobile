function importAllFonts(r) {
  const fonts = {};
  r.keys().map(name => {
    const finalName = name.substr(2, name.length - 6);
    fonts[finalName] = r(name);
  });
  return fonts;
}
export const fonts = importAllFonts(
  require.context("../assets/fonts", true, /\.(ttf)$/)
);
