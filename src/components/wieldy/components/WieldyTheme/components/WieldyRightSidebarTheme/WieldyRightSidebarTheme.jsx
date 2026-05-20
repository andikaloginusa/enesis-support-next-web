"use client";
import { ConfigProvider } from "antd";
import PropTypes from "prop-types";
import { useRightSidebarTheme } from "../../hooks";

export function WieldyRightSidebarTheme({ children }) {
  const { rightSidebarTheme } = useRightSidebarTheme();
  return <ConfigProvider theme={rightSidebarTheme}>{children}</ConfigProvider>;
}
WieldyRightSidebarTheme.propTypes = {
  children: PropTypes.node.isRequired,
};
