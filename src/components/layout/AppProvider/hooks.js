"use client";
import React from "react";
import { AppContext } from "./AppContext";

export function useApp() {
  return React.useContext(AppContext);
}

export function useTranslation() {
  const { translation } = useApp();
  return (key) => {
    const keys = key.split(".");
    try {
      return keys.reduce((t, k) => t[k], translation);
    } catch (e) {
      console.log("Error in translation", e);
      return key;
    }
  };
}
