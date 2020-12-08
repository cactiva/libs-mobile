import { default as overideTheme } from "@src/config/theme";
import Fonts from "./fonts";

const Theme = {
  StatusBarStyle: "dark-content",
  StatusBarBackgroundColor: "#ffffff",
  UIShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  UIColors: {
    primary: "#311B92",
    secondary: "#F4F7FF",
    danger: "#eb4559",
    text: "#333",
    background: "#fff",
    success: "#4caf50",
    warning: "#ffb367",
  },
  UIFontSize: 16,
  UIFontFamily: Fonts.NotoSansRegular,
  UIImageLoading: require("./assets/images/loading.png"),
  UIImageError: require("./assets/images/error.png"),
  UIField: {
    margin: 4,
    minHeight: 30,
    minWidth: 10,
    marginBottom: 10,
  },
  UIInput: {
    padding: 0,
    borderRadius: 4,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#aaa",
    minWidth: 10,
    marginBottom: 5,
    backgroundColor: "white",
  },
  UILabel: {},
  UIButton: {},
  LocalLang: "enUS",
  ...(overideTheme || {}),
};

export default Theme;
