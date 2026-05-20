import { ACTIONS } from "./constants";
import { WieldyThemeType } from "./types";

export function themeReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_MAIN_THEME:
      return {
        ...state,
        mainTheme: {
          ...state.mainTheme,
          ...action.payload,
        },
      };

    case ACTIONS.SET_HEADER_THEME:
      return {
        ...state,
        headerTheme: {
          ...state.headerTheme,
          ...action.payload,
        },
      };
    case ACTIONS.SET_FOOTER_THEME:
      return {
        ...state,
        footerTheme: {
          ...state.footerTheme,
          ...action.payload,
        },
      };
    case ACTIONS.SET_SIDEBAR_THEME:
      return {
        ...state,
        sidebarTheme: {
          ...state.sidebarTheme,
          ...action.payload,
        },
      };
    case ACTIONS.SET_RIGHT_SIDEBAR_THEME:
      return {
        ...state,
        rightSidebarTheme: {
          ...state.rightSidebarTheme,
          ...action.payload,
        },
      };

    case ACTIONS.SET_THEME:
      return {
        ...state,
        ...action.payload,
      };

    default:
      throw Error(
        `Unhandled action type: ${action.type} | WieldyTheme > themeReducer`
      );
  }
}
themeReducer.propTypes = WieldyThemeType;
