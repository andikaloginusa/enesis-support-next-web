"use client";
import { ConfigProvider } from "antd";
import PropTypes from "prop-types";
import { useSidebarTheme } from "../../hooks";

export function WieldySidebarTheme({ children }) {
  const { sidebarTheme } = useSidebarTheme();
  return <ConfigProvider theme={sidebarTheme}>{children}</ConfigProvider>;
}
WieldySidebarTheme.propTypes = {
  children: PropTypes.node.isRequired,
};
