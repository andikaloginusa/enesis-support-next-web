"use client";
import { config } from "@/config";
import { WieldyTheme } from "@wieldy/components";
import React from "react";
import { AppContext } from "./AppContext";
import { appReducer } from "./appReducer";
import { ACTIONS } from "./constants";
import { useRouter } from "next/navigation";

const initialAppState = {
  direction: "ltr",
};

export function AppProvider({ children, translation, locale }) {
  const router = useRouter();
  const [appState, dispatch] = React.useReducer(appReducer, initialAppState);

  const setDirection = React.useCallback((value) => {
    dispatch({ type: ACTIONS.SET_DIRECTION, payload: { direction: value } });
  }, []);

  const changeLanguage = React.useCallback((value) => {
    document.cookie = `NEXT_LOCALE=${value}; path=/; max-age=31536000`;
    router.refresh();
  }, [router]);

  const contextValue = React.useMemo(
    () => ({
      ...appState,
      translation,
      locale,
      setDirection,
      changeLanguage,
    }),
    [appState, translation, locale, setDirection, changeLanguage]
  );

  return (
    <AppContext.Provider value={contextValue}>
      <WieldyTheme theme={config.defaultTheme}>{children}</WieldyTheme>
    </AppContext.Provider>
  );
}
