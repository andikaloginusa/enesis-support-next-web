import { mainTheme } from "./main";

/**
 * Premium Light Header Theme System
 * Custom-tuned to paint the top header bar with the vibrant brand `#1aac32` color.
 * Reconfigures all buttons, menu selections, search fields, and popover triggers to be high-contrast white.
 */
export const headerTheme = {
  ...mainTheme,
  token: {
    ...mainTheme.token,
  },
  components: {
    ...mainTheme.components,
    Layout: {
      ...mainTheme.components?.Layout,
      headerBg: "#1aac32", // Header follows the primary brand color!
      headerColor: "#ffffff", // Pure white typography inside header
    },
    Menu: {
      itemColor: "rgba(255, 255, 255, 0.8)", // Semi-transparent white for inactive menu items
      itemHoverColor: "#ffffff",
      itemSelectedColor: "#ffffff",
      itemBg: "transparent",
      horizontalItemSelectedColor: "#ffffff",
      darkItemColor: "rgba(255, 255, 255, 0.8)",
      darkItemHoverColor: "#ffffff",
      darkItemSelectedColor: "#ffffff",
      darkItemBg: "#1aac32",
      darkItemSelectedBg: "#1aac32",
    },
    Button: {
      colorText: "#ffffff", // Pure white buttons and icons in the header
      colorTextDescription: "rgba(255, 255, 255, 0.7)",
    },
    Dropdown: {
      colorText: "#ffffff", // Pure white dropdown triggers
    },
    Select: {
      controlOutline: "transparent",
      colorText: "#ffffff", // Pure white select values
    },
  },
};
