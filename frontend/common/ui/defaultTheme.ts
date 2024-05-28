import { UIPalette, UIShape, UITheme } from "./types";

const defaultUIPalette: UIPalette = {
  primary: {
    main: "#312b78",
    light: "#5147c4",
    dark: "#27225e",
    contrast: "#fff",
  },
  secondary: {
    main: "#e04f36",
    light: "#ed5439",
    dark: "#c74630",
    contrast: "#000",
  },
  success: {
    main: "#4caf50",
    light: "#81c784",
    dark: "#388e3c",
    contrast: "rgba(0, 0, 0, 0.87)",
  },
  info: {
    main: "#2196f3",
    light: "#64b5f6",
    dark: "#1976d2",
    contrast: "#fff",
  },
  warning: {
    main: "#ff9800",
    light: "#ffb74d",
    dark: "#f57c00",
    contrast: "rgba(0, 0, 0, 0.87)",
  },
  error: {
    main: "#f44336",
    light: "#e57373",
    dark: "#d32f2f",
    contrast: "fff",
  },
  background: {
    main: "#fafafa",
    light: "#fafafa",
    dark: "#fafafa",
    contrast: "rgba(0, 0, 0, 0.87)",
    // main: "#fafafa",
    // light: "#fafafa",
    // dark: "#fafafa",
    // contrast: "rgba(0, 0, 0, 0.87)",
  },
  divider: {
    main: "rgba(0, 0, 0, 0.12)",
    light: "rgba(0, 0, 0, 0.12)",
    dark: "rgba(0, 0, 0, 0.12)",
    contrast: "rgba(0, 0, 0, 0.12)",
  },
};

const defaultUIShape: UIShape = {
  borderRadius: 20,
  elevation: 5,
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  spacing: {
    small: 10,
    medium: 20,
    large: 40,
  },
  lineHeight: 40,
};

export const defaultTheme: UITheme = {
  palette: defaultUIPalette,
  shape: defaultUIShape,
  zIndex: {
    // mobileStepper: 1000,
    // fab: 1050,
    // speedDial: 1050,
    map: -10,
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
    button: 1600,
  },
  components: {
    paper: {
      backgroundColor: defaultUIPalette.background.main,
      borderRadius: defaultUIShape.borderRadius,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: defaultUIShape.elevation,
    },

    button: {
      default: {
        display: "flex",
        backgroundColor: defaultUIPalette.primary.main,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: defaultUIShape.borderRadius,
        alignItems: "center",
        justifyContent: "center",
      },
      pressed: {
        backgroundColor: defaultUIPalette.primary.dark,
      },
      text: {
        color: defaultUIPalette.primary.contrast,
        fontWeight: "bold",
      },
    },
    iconButton: {},
    text: {
      color: defaultUIPalette.background.contrast,
    },
    textField: {
      textInput: {
        height: defaultUIShape.lineHeight,
        padding: 10,
        borderRadius: defaultUIShape.borderRadius,
        borderWidth: 1,
        borderColor: defaultUIPalette.divider.main,
      },
    },
  },
};