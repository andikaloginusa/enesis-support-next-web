import { LAYOUT_ACTIONS } from "./constants";
import { WieldyLayoutConfig } from "./types";

export function layoutReducer(state, action) {
  switch (action.type) {
    case LAYOUT_ACTIONS.SET_HEADER_OPTIONS:
      return {
        ...state,
        layoutOptions: {
          ...state.layoutOptions,
          header: {
            ...state.layoutOptions?.header,
            ...action.payload.layoutOptions?.header,
          },
        },
      };
    case LAYOUT_ACTIONS.SET_FOOTER_OPTIONS:
      return {
        ...state,
        layoutOptions: {
          ...state.layoutOptions,
          footer: {
            ...state.layoutOptions?.footer,
            ...action.payload.layoutOptions?.footer,
          },
        },
      };
    case LAYOUT_ACTIONS.SET_SIDEBAR_OPTIONS:
      return {
        ...state,
        layoutOptions: {
          ...state.layoutOptions,
          sidebar: {
            ...state.layoutOptions?.sidebar,
            ...action.payload.layoutOptions?.sidebar,
          },
        },
      };
    case LAYOUT_ACTIONS.SET_RIGHT_SIDEBAR_OPTIONS:
      return {
        ...state,
        layoutOptions: {
          ...state.layoutOptions,
          rightSidebar: {
            ...state.layoutOptions?.rightSidebar,
            ...action.payload.layoutOptions?.rightSidebar,
          },
        },
      };

    default:
      return state;
  }
}

layoutReducer.propTypes = WieldyLayoutConfig;
