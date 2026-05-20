import { theme } from "antd";
import { mainTheme } from "./main";

/**
 * Premium Light Footer Theme System
 * Custom-aligned with the brand layout to use a premium soft sage background.
 */
export const footerTheme = {
  algorithm: [theme.defaultAlgorithm],
  ...mainTheme,
  token: {
    ...mainTheme.token,
  },
  components: {
    Layout: {
      footerBg: "#fafdfa", // Cohesive soft sage background
      colorText: "#526d57", // Smooth sage-gray text
    },
  },
};
