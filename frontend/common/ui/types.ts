import { ViewStyle, TextStyle, StyleProp } from "react-native";

export type UIColor =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "background"
  | "divider";

interface ColorDefinition {
  main: string;
  light: string;
  dark: string;
  contrast: string;
}

export type UIPalette = {
  [key in UIColor]: ColorDefinition;
};

export type UIShape = {
  borderRadius: number;
  elevation: number;
  shadow: {
    shadowColor: string;
    shadowOffset: {
      width: number;
      height: number;
    };
    shadowOpacity: number;
    shadowRadius: number;
  };
  spacing: {
    small: number;
    medium: number;
    large: number;
  };
  lineHeight: number;
};

export interface UITheme {
  palette: UIPalette;
  shape: UIShape;
  zIndex: {
    // mobileStepper: number;
    // fab: number;
    // speedDial: number;
    map: number;
    appBar: number;
    drawer: number;
    modal: number;
    snackbar: number;
    tooltip: number;
    button: number;
  };
  components: {
    paper: ViewStyle;
    button: {
      default: ViewStyle;
      pressed: ViewStyle;
      text: TextStyle;
    };
    iconButton: {};
    text: StyleProp<TextStyle>;
    textField: {
      textInput: StyleProp<ViewStyle>;
    };
  };
}