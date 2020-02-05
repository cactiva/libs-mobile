import { default as overideTheme } from "../theme";

const Theme = {
  UIShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6
  },
  UIColors: {
    primary: "#311B92",
    secondary: "#F4F7FF",
    danger: "#f25454",
    text: "#5d5d5d",
    background: "#fff"
  },
  UIFontSize: 16,
  UIFontFamily: "NotoSans-Regular",
  UIImageLoading: require("./asset/image/loading.png"),
  UIImageError: require("./asset/image/error.png"),
  UIInput: {},
  UILabel: {},
  UIButton: {},
  ...overideTheme
};

export default Theme;
