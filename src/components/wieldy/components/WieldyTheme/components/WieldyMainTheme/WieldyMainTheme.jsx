"use client";
import { ConfigProvider } from "antd";
import PropTypes from "prop-types";
import { useMainTheme } from "../../hooks";

export function WieldyMainTheme({ children }) {
  const { mainTheme } = useMainTheme();
  return <ConfigProvider theme={{ ...mainTheme }}>{children}</ConfigProvider>;
}

WieldyMainTheme.propTypes = {
  children: PropTypes.node.isRequired,
};
