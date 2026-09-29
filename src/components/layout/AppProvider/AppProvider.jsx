"use client";
import { config } from "@/config";
import { WieldyTheme } from "@wieldy/components";
import React, { useEffect } from "react";
import { AppContext } from "./AppContext";
import { appReducer } from "./appReducer";
import { ACTIONS } from "./constants";
import { useRouter } from "next/navigation";
import { isItSupport, clearUserCredentials } from "@/utils/storage";
import { ROUTES } from "@/utils/constants";

const initialAppState = {
  direction: "ltr",
};

export function AppProvider({ children, translation, locale }) {
  const router = useRouter();
  const [appState, dispatch] = React.useReducer(appReducer, initialAppState);

  // ── IT SUPPORT Role Guard ─────────────────────────────────────────────────
  // If user somehow bypassed login guard (e.g. direct URL access, stale session)
  // and their credentials lack IT SUPPORT role → clear session & redirect.
  useEffect(() => {
    if (!isItSupport()) {
      clearUserCredentials();
      document.cookie = `user_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      router.replace(ROUTES.LOGIN);
    }
  }, [router]); // eslint-disable-line react-hooks/exhaustive-deps

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
