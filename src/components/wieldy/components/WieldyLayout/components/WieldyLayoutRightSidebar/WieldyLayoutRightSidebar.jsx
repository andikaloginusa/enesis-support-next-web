import { ConfigProvider } from "antd";
import Sider from "antd/es/layout/Sider";
import { useRightSidebarTheme } from "../../../WieldyTheme/hooks";
import { WieldyRightSidebarProps } from "../../types";

export function WieldyLayoutRightSidebar({ children, ...restProps }) {
  const { rightSidebarTheme } = useRightSidebarTheme();
  return (
    <ConfigProvider theme={rightSidebarTheme}>
      <Sider {...restProps}>{children}</Sider>
    </ConfigProvider>
  );
}

WieldyLayoutRightSidebar.propTypes = WieldyRightSidebarProps;
