"use client";
import { useWieldyLayoutSidebar } from "@wieldy/components/WieldyLayout/hooks";
import { Button, theme } from "antd";
import { RiMenuFoldLine, RiMenuUnfoldLine } from "react-icons/ri";

const { useToken } = theme;

export const SidebarToggleButton = ({ colorTheme = "light" }) => {
  const { sidebarOptions, setSidebarOptions } = useWieldyLayoutSidebar();
  const { token } = useToken();

  const handleToggleBtn = () => {
    setSidebarOptions({ collapsed: !sidebarOptions.collapsed });
  };

  return (
    <Button
      shape="circle"
      type="text"
      size="large"
      icon={
        sidebarOptions.collapsed ? <RiMenuUnfoldLine /> : <RiMenuFoldLine />
      }
      onClick={handleToggleBtn}
      style={{
        ...(colorTheme === "dark" ? { color: token.colorWhite } : {}),
      }}
      className="text-xl"
    />
  );
};

export default SidebarToggleButton;
