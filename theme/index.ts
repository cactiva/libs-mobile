interface ThemeProps {
  primary: string;
  secondary: string;
  tertiary: string;
  success: string;
  warning: string;
  danger: string;
  dark: string;
  medium: string;
  light: string;
  background: string;
}

const DefaultTheme: ThemeProps = {
  primary: "#4c8dff",
  secondary: "#24d6ea",
  tertiary: "#7e57ff",
  success: "#28e070",
  warning: "#ffd31a",
  danger: "#f25454",
  dark: "#383a3e",
  medium: "#a2a4ab",
  light: "#f1f1f1",
  background: "#f5f6f9"
};

export { DefaultTheme, ThemeProps };
