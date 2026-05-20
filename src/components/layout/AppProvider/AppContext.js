"use client";
import React from "react";

export const AppContext = React.createContext({
  direction: "ltr",
  translation: {},
  setDirection(value) {
    throw Error(`setDirection cannot be used without using AppProvider.`);
  },
});
