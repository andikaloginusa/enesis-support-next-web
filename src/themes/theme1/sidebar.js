import { mainTheme } from "./main";

/**
 * Premium Light Sidebar Theme System
 * Custom-crafted to blend seamlessly with brand `#1aac32`.
 * Replaces generic white/gray sidebar with a breathtaking organic green-white tone.
 */
export const sidebarTheme = {
  ...mainTheme,
  token: {
    ...mainTheme.token,
    colorText: "#2d4432", // Clear deep sage text
  },
  components: {
    ...mainTheme.components,
    Layout: {
      siderBg: "#fafdfa", // Beautiful organic green-white sidebar bg
    },
    Drawer: {
      colorBgElevated: "#fafdfa",
    },
    Menu: {
      itemColor: "#415f48", // Dark sage menu text
      itemHoverColor: "#1aac32", // Primary green brand color on hover
      itemSelectedColor: "#1aac32", // Primary green brand color on select
      groupTitleColor: "#6f9277", // Smooth sage-gray for category names
      itemBorderRadius: 6,
      subMenuItemBorderRadius: 6,
      itemBg: "#fafdfa",
      itemHoverBg: "#f0fbf2", // Gorgeous soft primary green hover tint
      itemActiveBg: "#e6f8ea", // Very soft green active tint
      subMenuItemBg: "transparent",
      itemSelectedBg: "#e6f8ea", // Beautiful selected light primary green background
      itemMarginInline: 12,
      controlHeightSM: 28,
      controlItemBgActive: "transparent",
      colorBgContainer: "#fafdfa",
      colorBgElevated: "#fafdfa",
      controlHeightLG: 42,
      marginXXS: 4,
      motionDurationMid: "0.1s",
      iconSize: 20,
      collapsedIconSize: 20,
      groupTitleFontSize: 16,
    },
  },
};
