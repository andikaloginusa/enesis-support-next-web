"use client";
import React from "react";
import { WieldyMainTheme } from "./components";
import { ACTIONS, defaultWieldyTheme, getDarkTheme } from "./constants";
import { themeReducer } from "./themeReducer";
import { WieldyThemeProps } from "./types";
import { WieldyThemeContext } from "./WieldyThemeContext";

export function WieldyTheme({ children, theme, darkTheme }) {
  const [previousTheme, setPreviousTheme] = React.useState(
    theme ?? defaultWieldyTheme
  );
  const [wieldyTheme, dispatch] = React.useReducer(
    themeReducer,
    theme ?? defaultWieldyTheme
  );
  const [themeMode, setThemeMode] = React.useState("light");

  const setMainTheme = React.useCallback((value) => {
    dispatch({ type: ACTIONS.SET_MAIN_THEME, payload: value });
  }, []);

  const setHeaderTheme = React.useCallback((value) => {
    dispatch({ type: ACTIONS.SET_HEADER_THEME, payload: value });
  }, []);

  const setFooterTheme = React.useCallback((value) => {
    dispatch({ type: ACTIONS.SET_FOOTER_THEME, payload: value });
  }, []);

  const setSidebarTheme = React.useCallback((value) => {
    dispatch({ type: ACTIONS.SET_SIDEBAR_THEME, payload: value });
  }, []);

  const setRightSidebarTheme = React.useCallback((value) => {
    dispatch({ type: ACTIONS.SET_RIGHT_SIDEBAR_THEME, payload: value });
  }, []);

  const setTheme = React.useCallback((value) => {
    dispatch({ type: ACTIONS.SET_THEME, payload: value });
  }, []);

  const switchMode = React.useCallback((mode) => {
    if (mode === "dark") {
      setPreviousTheme(wieldyTheme);
      setTheme(darkTheme ?? getDarkTheme(wieldyTheme));
      setThemeMode(mode);
    } else {
      setTheme(previousTheme);
      setThemeMode(mode);
    }
  }, [wieldyTheme, darkTheme, previousTheme, setTheme]);

  const contextValue = React.useMemo(
    () => ({
      ...wieldyTheme,
      setMainTheme,
      themeMode,
      setThemeMode,
      setHeaderTheme,
      setSidebarTheme,
      setFooterTheme,
      setRightSidebarTheme,
      setTheme,
      switchMode,
    }),
    [
      wieldyTheme,
      themeMode,
      setThemeMode,
      setMainTheme,
      setSidebarTheme,
      setHeaderTheme,
      setFooterTheme,
      setRightSidebarTheme,
      setTheme,
      switchMode,
    ]
  );
  return (
    <WieldyThemeContext.Provider value={contextValue}>
      <WieldyMainTheme>{children}</WieldyMainTheme>
    </WieldyThemeContext.Provider>
  );
}

WieldyTheme.propTypes = WieldyThemeProps;
