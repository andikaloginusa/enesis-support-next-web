import { useMenuItems } from "@hooks/navigation/useMenuItems";
import { Button, Menu, Space } from "antd";
import React from "react";
import {
  RiListCheck2,
  RiOrganizationChart,
  RiSettings2Line,
} from "react-icons/ri";

export const HeaderMenuOptions = () => {
  const [current, setCurrent] = React.useState([]);
  const menuItems = useMenuItems();

  const handleClick = (e) => {
    setCurrent(e.keyPath);
  };
  return (
    <div className="flex justify-between">
      <Menu
        mode="horizontal"
        onClick={handleClick}
        selectedKeys={current}
        items={menuItems}
        theme={"dark"}
      />
      <Space className="leading-[initial] text-white">
        <Button
          type="text"
          shape="circle"
          className="text-white"
          icon={<RiListCheck2 fontSize={20} />}
        />
        <Button
          type="text"
          shape="circle"
          className="text-white"
          icon={<RiSettings2Line fontSize={20} />}
        />
        <Button
          type="text"
          shape="circle"
          className="text-white"
          icon={<RiOrganizationChart fontSize={20} />}
        />
      </Space>
    </div>
  );
};
