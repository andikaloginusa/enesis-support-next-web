import { theme } from "antd";

/**
 * Premium Wieldy Main Light Theme System
 * Custom-curated HSL green-neutral system designed specifically around brand `#1aac32`.
 * Replaces boring grey defaults with rich, organic, high-contrast forest and sage tones.
 */
export const mainTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: "#1aac32",
    colorBgLayout: "#f2f8f2", // Highly premium soft sage layout background (matches brand primary!)
    colorText: "#1b2c1e", // Deep organic forest-charcoal body text for extreme readability
    colorTextSecondary: "#526d57", // Smooth sage secondary text
    colorTextHeading: "#0b170d", // Dark forest-black for headings and primary titles
    colorLink: "#1aac32",
    colorLinkHover: "#127c24",
    colorLinkActive: "#127c24",
    colorError: "#F5222D",
    colorWarning: "#FA8C16",
    colorInfo: "#1aac32",
    controlHeight: 36,
    boxShadowTertiary: "0 0 5px 5px rgba(0,0,0,0.02)",
    fontFamily: "NoirPro, Arial, Helvetica, sans-serif",
  },
  components: {
    Card: {
      borderRadiusLG: 10,
      colorTextHeading: "#0b170d",
      fontSizeLG: 14,
      headerFontSize: 16,
      fontWeightStrong: 400,
      headerHeight: 65,
    },
    Typography: {
      fontWeightStrong: 400,
    },
    Alert: {
      borderRadiusLG: 6,
    },
    Button: {
      controlHeightLG: 42,
      borderRadiusLG: 6,
      colorLink: "#1aac32",
      colorLinkHover: "#127c24",
      colorLinkActive: "#127c24",
    },
    Modal: {
      colorTextHeading: "#0b170d",
      fontWeightStrong: 500,
    },
    Steps: {
      controlHeight: 32,
      controlHeightLG: 40,
    },
    Menu: {
      iconSize: 20,
      collapsedIconSize: 20,
      groupTitleFontSize: 16,
    },
  },
};
