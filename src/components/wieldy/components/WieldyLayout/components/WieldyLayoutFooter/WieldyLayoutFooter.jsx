import { ConfigProvider } from "antd";
import { Footer } from "antd/es/layout/layout";
import { useFooterTheme } from "../../../WieldyTheme/hooks";
import { useWieldyLayoutFooter } from "../../hooks";
import { WieldyFooterProps } from "../../types";

export function WieldyLayoutFooter({ children, style, ...restProps }) {
  const { footerTheme } = useFooterTheme();
  const { footerOptions } = useWieldyLayoutFooter();
  const footerStyle = footerOptions?.fixed
    ? {
        ...style,
        position: "sticky",
        bottom: 0,
        zIndex: 99,
      }
    : {
        ...style,
      };

  return (
    <ConfigProvider theme={footerTheme}>
      <Footer style={footerStyle} {...restProps}>
        {children}
      </Footer>
    </ConfigProvider>
  );
}

WieldyLayoutFooter.propTypes = WieldyFooterProps;
