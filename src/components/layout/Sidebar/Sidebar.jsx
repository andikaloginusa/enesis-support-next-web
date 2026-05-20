"use client";
import { useMenuItems } from "@hooks/navigation/useMenuItems";
import logoWhitePic from "@public/logo-white.png";
import logoSymbolPic from "@public/logo-symbol.png";
import { useWieldyLayoutSidebar } from "@wieldy/components/WieldyLayout/hooks";
import { useHeaderTheme } from "@wieldy/components/WieldyTheme/hooks";
import { Menu } from "antd";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Sidebar = () => {
  const { sidebarOptions } = useWieldyLayoutSidebar();
  const { headerTheme } = useHeaderTheme();
  const menuItems = useMenuItems();
  const pathname = usePathname();
  const selectedOption = (pathname) => {
    const parts = pathname?.split("/");
    const selectedOption = pathname !== "/" ? parts?.pop() : "crypto";
    return selectedOption;
  };

  const logoBg = headerTheme?.components?.Layout?.headerBg || "#1aac32";

  return (
    <div className="relative h-full">
      <div
        className="flex items-center px-5 py-3 sticky top-0 z-10 min-h-[72px]"
        style={{ backgroundColor: logoBg }}
      >
        <div className="flex-1 flex justify-center items-center">
          <Link href="/">
            {sidebarOptions.collapsed ? (
              <Image src={logoSymbolPic} alt="Logo" priority />
            ) : (
              <Image src={logoWhitePic} alt="Logo" priority />
            )}
          </Link>
        </div>
      </div>
      <div className="h-[calc(100%-72px)] overflow-y-auto pb-6">
        <Menu
          items={menuItems}
          defaultSelectedKeys={[selectedOption(pathname)]}
          mode="inline"
          inlineIndent={36}
          defaultOpenKeys={["dashboards"]}
          className="[&_.ant-menu-item-group-title]:pl-9 [&_.ant-menu-item-group-title]:pt-9 [&.ant-menu-inline-collapsed_.ant-menu-item-group-title]:hidden [&_.ant-menu-submenu-title_.ant-menu-submenu-arrow]:start-5 [&_.ant-menu-sub_.ant-menu-submenu-title_.ant-menu-submenu-arrow]:start-14"
        />
      </div>
    </div>
  );
};
