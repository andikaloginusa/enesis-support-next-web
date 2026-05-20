"use client";
import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import { WieldyLayoutProps } from "./types";

import React from "react";
import {
  WieldyLayoutFooter,
  WieldyLayoutHeader,
  WieldyLayoutRightSidebar,
  WieldyLayoutSidebar,
} from "./components";
import { LAYOUT_ACTIONS, defaultLayoutContext } from "./constants";
import { layoutReducer } from "./layoutReducer";
import { WieldyLayoutContext } from "./WieldyLayoutContext";

export function WieldyLayout({
  header,
  footer,
  sidebar,
  rightSidebar,
  children,
  classes,
  styles,
  layoutOptions,
}) {
  const [config, dispatch] = React.useReducer(layoutReducer, {
    layoutOptions: layoutOptions ?? defaultLayoutContext.layoutOptions,
    styles: styles ?? defaultLayoutContext.styles,
    classes: classes ?? defaultLayoutContext.classes,
  });

  const { layoutOptions: options } = config;

  const showHeader = !options?.header?.hidden && !!header;
  const showFooter = !options?.footer?.hidden && !!footer;
  const showSidebar = !options?.sidebar?.hidden && !!sidebar;
  const showRightSidebar = !options?.rightSidebar?.hidden && rightSidebar;

  const setHeaderOptions = React.useCallback((options) => {
    dispatch({
      type: LAYOUT_ACTIONS.SET_HEADER_OPTIONS,
      payload: {
        layoutOptions: {
          header: options,
        },
      },
    });
  }, []);

  const setSidebarOptions = React.useCallback((options) => {
    dispatch({
      type: LAYOUT_ACTIONS.SET_SIDEBAR_OPTIONS,
      payload: {
        layoutOptions: {
          sidebar: options,
        },
      },
    });
  }, []);

  const setRightSidebarOptions = React.useCallback((options) => {
    dispatch({
      type: LAYOUT_ACTIONS.SET_RIGHT_SIDEBAR_OPTIONS,
      payload: {
        layoutOptions: {
          rightSidebar: options,
        },
      },
    });
  }, []);

  const setFooterOptions = React.useCallback((options) => {
    dispatch({
      type: LAYOUT_ACTIONS.SET_FOOTER_OPTIONS,
      payload: {
        layoutOptions: {
          footer: options,
        },
      },
    });
  }, []);

  const headerMargin = (() => {
    if (
      !config.layoutOptions?.sidebar?.fixed ||
      config?.layoutOptions?.sidebar?.isDrawer
    )
      return 0;

    if (config.layoutOptions?.sidebar?.collapsed)
      return config.layoutOptions?.sidebar?.collapsedWidth;

    return config.layoutOptions?.sidebar?.width;
  })();

  const contextValue = React.useMemo(
    () => ({
      ...config,
      setHeaderOptions,
      setSidebarOptions,
      setRightSidebarOptions,
      setFooterOptions,
    }),
    [
      config,
      setHeaderOptions,
      setSidebarOptions,
      setRightSidebarOptions,
      setFooterOptions,
    ]
  );
  return (
    <WieldyLayoutContext.Provider value={contextValue}>
      <Layout
        className={classes?.root}
        style={styles?.root}
        hasSider={showSidebar}
      >
        {/** Header Spread Outside */}
        {showHeader && options?.header?.spreadOut && (
          <WieldyLayoutHeader
            style={styles?.header}
            className={classes?.header}
          >
            {header}
          </WieldyLayoutHeader>
        )}
        <Layout>
          {/** Sidebar */}
          {showSidebar && (
            <WieldyLayoutSidebar
              style={styles?.sidebar}
              className={classes?.sidebar}
              {...options?.sidebar}
            >
              {sidebar}
            </WieldyLayoutSidebar>
          )}

          {/** Content Area */}
          <Layout
            style={{
              transition: "all 0.3s,background 0s",
              marginInlineStart: headerMargin,
            }}
          >
            {/** Header Not Spread Outside */}
            {showHeader && !options?.header?.spreadOut && (
              <WieldyLayoutHeader
                style={styles?.header}
                className={classes?.header}
              >
                {header}
              </WieldyLayoutHeader>
            )}
            <Content style={styles?.content} className={classes?.content}>
              {children}
            </Content>

            {/** Footer Not Spread Outside */}
            {showFooter && !options?.footer?.spreadOut && (
              <WieldyLayoutFooter
                style={styles?.footer}
                className={classes?.footer}
              >
                {footer}
              </WieldyLayoutFooter>
            )}
          </Layout>

          {/** Right Sidebar */}
          {showRightSidebar && (
            <WieldyLayoutRightSidebar
              style={styles?.sidebar}
              className={classes?.sidebar}
              {...options?.rightSidebar}
            >
              {sidebar}
            </WieldyLayoutRightSidebar>
          )}
        </Layout>

        {/** Footer Spread Outside */}
        {showFooter && options?.footer?.spreadOut && (
          <WieldyLayoutFooter
            style={styles?.footer}
            className={classes?.footer}
          >
            {footer}
          </WieldyLayoutFooter>
        )}
      </Layout>
    </WieldyLayoutContext.Provider>
  );
}
WieldyLayout.propTypes = WieldyLayoutProps;
