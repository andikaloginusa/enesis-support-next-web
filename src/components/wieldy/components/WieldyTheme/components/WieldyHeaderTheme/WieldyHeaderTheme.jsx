"use client";
import { ConfigProvider } from "antd";
import PropTypes from "prop-types";
import { useHeaderTheme } from "../../hooks";

export function WieldyHeaderTheme({ children }) {
  const { headerTheme } = useHeaderTheme();
  return <ConfigProvider theme={headerTheme}>{children}</ConfigProvider>;
}

WieldyHeaderTheme.propTypes = {
  children: PropTypes.node.isRequired,
};
