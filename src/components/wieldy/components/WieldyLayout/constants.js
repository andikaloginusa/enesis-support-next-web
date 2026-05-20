import { WieldyLayoutContextType } from "./types";
export const defaultLayoutContext = {
  layoutOptions: {
    header: {
      fixed: true,
      hidden: false,
      spreadOut: false,
    },
    footer: {
      fixed: true,
      hidden: false,
      spreadOut: false,
    },
    sidebar: {
      hidden: false,
      breakpoint: "lg",
      collapsedWidth: "0",
    },
    rightSidebar: {
      hidden: false,
    },
  },
  classes: {},
  styles: {},
  setFooterOptions(value) {
    throw Error("setFooterOptions can only be used with WieldyLayout");
  },
  setHeaderOptions(value) {
    throw Error("setHeaderOptions can only be used with WieldyLayout");
  },
  setSidebarOptions(value) {
    throw Error("setSidebarOptions can only be used with WieldyLayout");
  },
  setRightSidebarOptions(value) {
    throw Error("setRightSidebarOptions can only be used with WieldyLayout");
  },
};

export const LAYOUT_ACTIONS = {
  SET_HEADER_OPTIONS: "SET_HEADER_OPTIONS",
  SET_FOOTER_OPTIONS: "SET_FOOTER_OPTIONS",
  SET_SIDEBAR_OPTIONS: "SET_SIDEBAR_OPTIONS",
  SET_RIGHT_SIDEBAR_OPTIONS: "SET_RIGHT_SIDEBAR_OPTIONS",
  SET_LAYOUT_OPTIONS: "SET_LAYOUT_OPTIONS",
};

defaultLayoutContext.propTypes = WieldyLayoutContextType;
