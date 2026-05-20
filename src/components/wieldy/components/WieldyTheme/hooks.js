"use client";
import React from "react";
import { WieldyThemeContext } from "./WieldyThemeContext";

export function useWieldyTheme() {
  return React.useContext(WieldyThemeContext);
}

export function useMainTheme() {
  const { mainTheme, setMainTheme } = React.useContext(WieldyThemeContext);
  return {
    mainTheme,
    setMainTheme,
  };
}

export function useSidebarTheme() {
  const { sidebarTheme, setSidebarTheme } =
    React.useContext(WieldyThemeContext);
  return {
    sidebarTheme,
    setSidebarTheme,
  };
}

export function useFooterTheme() {
  const { footerTheme, setFooterTheme } = React.useContext(WieldyThemeContext);
  return {
    footerTheme,
    setFooterTheme,
  };
}

export function useRightSidebarTheme() {
  const { rightSidebarTheme, setRightSidebarTheme } =
    React.useContext(WieldyThemeContext);
  return {
    rightSidebarTheme,
    setRightSidebarTheme,
  };
}

export function useHeaderTheme() {
  const { headerTheme, setHeaderTheme } = React.useContext(WieldyThemeContext);
  return {
    headerTheme,
    setHeaderTheme,
  };
}
