import { useMenuItems } from "@hooks/navigation/useMenuItems";
import { useWieldyTheme } from "@wieldy/components/WieldyTheme/hooks";
import { ConfigProvider, Menu } from "antd";
import { useState } from "react";

export const Menubar = () => {
  const [current, setCurrent] = useState([]);
  const menuItems = useMenuItems();
  const handleClick = (e) => {
    setCurrent(e.keyPath);
  };
  const { themeMode } = useWieldyTheme();
  return (
    <>
      {themeMode === "dark" ? (
        <ConfigProvider
          theme={{
            components: {
              Menu: {
                itemColor: "#FFF",
                itemHoverColor: "#fa8c15",
                itemSelectedColor: "#fa8c15",
                itemBg: "transparent",
                groupTitleColor: "#FFF",
                horizontalItemSelectedColor: "#fa8c15",
              },
            },
          }}
        >
          <Menu
            mode="horizontal"
            onClick={handleClick}
            selectedKeys={current}
            items={menuItems}
          />
        </ConfigProvider>
      ) : (
        <ConfigProvider
          theme={{
            components: {
              Menu: {
                itemColor: "#545454",
                itemHoverColor: "#fa8c15",
                itemSelectedColor: "#fa8c15",
                itemBg: "transparent",
                groupTitleColor: "#545454",
                horizontalItemSelectedColor: "#fa8c15",
                darkItemColor: "#FFF",
                darkItemBg: "transparent",
                darkItemHoverColor: "#fa8c15",
                darkItemSelectedColor: "#fa8c15",
                darkItemSelectedBg: "#003366",
              },
            },
          }}
        >
          <Menu
            mode="horizontal"
            onClick={handleClick}
            selectedKeys={current}
            items={menuItems}
          />
        </ConfigProvider>
      )}
    </>
  );
};
