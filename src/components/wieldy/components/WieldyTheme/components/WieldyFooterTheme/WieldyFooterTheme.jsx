import { ConfigProvider } from "antd";
import PropTypes from "prop-types";
import { useFooterTheme } from "../../hooks";

export function WieldyFooterTheme({ children }) {
  const { footerTheme } = useFooterTheme();
  return <ConfigProvider theme={footerTheme}>{children}</ConfigProvider>;
}

WieldyFooterTheme.propTypes = {
  children: PropTypes.node.isRequired,
};
