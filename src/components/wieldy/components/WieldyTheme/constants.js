import { theme } from "antd";
import { WieldyThemeContextType } from "./types";

export const defaultWieldyTheme = {
  mainTheme: {},
  sidebarTheme: {},
  headerTheme: {},
  footerTheme: {},
  rightSidebarTheme: {},
};

export const defaultWieldyContext = {
  themeMode: "light",
  mainTheme: {},
  setMainTheme(value) {
    throw Error("setMainTheme can only be used with WieldyTheme");
  },
  setHeaderTheme(value) {
    throw Error("setHeaderTheme can only be used with WieldyTheme");
  },
  setSidebarTheme(value) {
    throw Error("setSidebarTheme can only be used with WieldyTheme");
  },
  setFooterTheme(value) {
    throw Error("setFooterTheme can only be used with WieldyTheme");
  },
  setRightSidebarTheme(value) {
    throw Error("setRightSidebarTheme can only be used with WieldyTheme");
  },
  setTheme(value) {
    throw Error("setTheme can only be used with WieldyTheme");
  },
  switchMode(value) {
    throw Error("switchMode can only be used with WieldyTheme");
  },
};

export const ACTIONS = {
  SET_MAIN_THEME: "set-main-theme",
  SET_HEADER_THEME: "set-header-theme",
  SET_FOOTER_THEME: "set-footer-theme",
  SET_SIDEBAR_THEME: "set-sidebar-theme",
  SET_RIGHT_SIDEBAR_THEME: "set-right-sidebar-theme",
  SET_THEME: "set-theme",
};

/**
 * Premium Bespoke Wieldy Dark Theme Generator
 * Reconfigures the default dark-slate theme into a stunningly luxurious Dark Forest & Obsidian color system.
 * Optimized specifically for brand color matching and high contrast readability.
 */
export const getDarkTheme = (wieldyTheme) => {
  const mainDarkTheme = {
    ...wieldyTheme.mainTheme,
    algorithm: [theme.darkAlgorithm],
    token: {
      ...wieldyTheme.mainTheme.token,
      colorPrimary: "#22c55e", // Vibrant emerald green for stunning contrast on dark surfaces
      colorBgBase: "#0e1410", // Ultra-premium obsidian-forest card/modal base background
      colorBgLayout: "#060907", // Gorgeous deep charcoal-forest layout background
      colorText: "#e2f0e6", // Crisp organic light mint body text
      colorTextSecondary: "#7c9a84", // Muted sage-emerald secondary text
      colorTextHeading: "#f3fbf6", // Super bright mint-white for titles and primary headers
      colorLink: "#22c55e",
      colorLinkHover: "#4ade80",
      colorLinkActive: "#4ade80",
      colorError: "#FF4D4F",
      colorWarning: "#FAAD14",
      colorInfo: "#22c55e",
      controlHeight: 36,
      boxShadowTertiary: "0 4px 20px rgba(0,0,0,0.4)",
      fontFamily: "NoirPro, Arial, Helvetica, sans-serif",
    },
    components: {
      ...wieldyTheme.mainTheme.components,
      Card: {
        ...wieldyTheme.mainTheme.components?.Card,
        borderRadiusLG: 10,
        colorTextHeading: "#f3fbf6",
        fontSizeLG: 14,
      },
      Typography: {
        ...wieldyTheme.mainTheme.components?.Typography,
        fontWeightStrong: 400,
        colorText: "#e2f0e6",
        colorTextDescription: "#7c9a84",
      },
      Alert: {
        ...wieldyTheme.mainTheme.components?.Alert,
        borderRadiusLG: 6,
      },
      Button: {
        ...wieldyTheme.mainTheme.components?.Button,
        controlHeightLG: 42,
        borderRadiusLG: 6,
        colorLink: "#22c55e",
        colorLinkHover: "#4ade80",
        colorLinkActive: "#4ade80",
        primaryShadow: "none",
        defaultShadow: "none",
        dangerShadow: "none",
      },
      Modal: {
        ...wieldyTheme.mainTheme.components?.Modal,
        colorTextHeading: "#f3fbf6",
        fontWeightStrong: 500,
      },
      Steps: {
        ...wieldyTheme.mainTheme.components?.Steps,
        controlHeight: 32,
        controlHeightLG: 40,
      },
    },
  };

  return {
    mainTheme: mainDarkTheme,
    headerTheme: {
      ...mainDarkTheme,
      token: {
        ...mainDarkTheme.token,
        headerColor: "#f3fbf6",
      },
      components: {
        ...mainDarkTheme.components,
        Menu: {
          itemColor: "#cbd5e1",
          itemHoverColor: "#22c55e",
          itemSelectedColor: "#22c55e",
          itemBg: "#131b15", // Premium deep forest header menu fill
          groupTitleColor: "#7c9a84",
          horizontalItemSelectedColor: "#22c55e",
          darkItemColor: "#cbd5e1",
          darkItemBg: "#131b15",
          darkItemHoverColor: "#22c55e",
          darkItemSelectedColor: "#22c55e",
          darkItemSelectedBg: "#131b15",
        },
        Button: {
          colorText: "#f3fbf6",
        },
        Dropdown: {
          colorText: "#f3fbf6",
        },
        Select: {
          colorText: "#f3fbf6",
          controlOutline: "transparent",
          controlItemBgActive: "#1a261e",
        },
        Layout: {
          headerBg: "#131b15", // Deep forest top header fill
        },
      },
    },
    footerTheme: {
      ...mainDarkTheme,
      token: {
        ...mainDarkTheme.token,
        colorText: "#7c9a84",
      },
      components: {
        Layout: {
          footerBg: "#060907", // Solid charcoal-forest footer background
        },
      },
    },
    sidebarTheme: {
      ...mainDarkTheme,
      token: {
        ...mainDarkTheme.token,
        colorText: "#e2f0e6",
      },
      components: {
        ...mainDarkTheme.components,
        Menu: {
          itemColor: "#cbd5e1",
          itemHoverColor: "#22c55e",
          itemSelectedColor: "#22c55e",
          groupTitleColor: "#7c9a84",
          itemBorderRadius: 6,
          subMenuItemBorderRadius: 6,
          menuSubMenuBg: "#131b15", // Beautiful matching forest submenus
          itemBg: "#131b15",
          itemHoverBg: "#1e2c22", // Forest-emerald hover bg
          itemActiveBg: "rgba(34, 197, 94, 0.1)",
          subMenuItemBg: "transparent",
          itemSelectedBg: "rgba(34, 197, 94, 0.15)", // Translucent active emerald highlight
          itemMarginInline: 12,
          controlHeightSM: 28,
          controlItemBgActive: "transparent",
          colorBgContainer: "#131b15",
          colorBgElevated: "#131b15",
          controlHeightLG: 42,
          marginXXS: 4,
          motionDurationMid: "0.1s",
          iconSize: 20,
          collapsedIconSize: 20,
          groupTitleFontSize: 16,
          activeBarBorderWidth: 0,
        },
        Layout: {
          siderBg: "#131b15", // Rich deep-forest sidebar background
        },
      },
    },
  };
};

defaultWieldyContext.propTypes = WieldyThemeContextType;
