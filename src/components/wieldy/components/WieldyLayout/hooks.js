"use client";

import React from "react";
import { WieldyLayoutContext } from "./WieldyLayoutContext";

export function useWieldyLayout() {
  return React.useContext(WieldyLayoutContext);
}

export function useWieldyLayoutHeader() {
  const { layoutOptions, setHeaderOptions } = useWieldyLayout();
  return {
    headerOptions: layoutOptions?.header ?? {},
    setHeaderOptions,
  };
}

export function useWieldyLayoutSidebar() {
  const { layoutOptions, setSidebarOptions } = useWieldyLayout();
  return {
    sidebarOptions: layoutOptions?.sidebar ?? {},
    setSidebarOptions,
  };
}

export function useWieldyLayoutFooter() {
  const { layoutOptions, setFooterOptions } = useWieldyLayout();
  return {
    footerOptions: layoutOptions?.footer ?? {},
    setFooterOptions,
  };
}

export function useWieldyLayoutRightSidebar() {
  const { layoutOptions, setRightSidebarOptions } = useWieldyLayout();
  return {
    rightSidebarOptions: layoutOptions?.rightSidebar ?? {},
    setRightSidebarOptions,
  };
}
