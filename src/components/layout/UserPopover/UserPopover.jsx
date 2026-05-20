"use client";
import { ASSET_AVATARS } from "@/utils/paths";
import { Avatar, Dropdown } from "antd";
import { UserCardAction } from "./UserCardAction";
export const UserPopover = () => {
  return (
    <Dropdown
      trigger={["click"]}
      placement="bottomRight"
      popupRender={() => <UserCardAction />}
    >
      <div className="cursor-pointer ml-3">
        <Avatar src={`${ASSET_AVATARS}/avatar9.jpg`} size={40} />
      </div>
    </Dropdown>
  );
};
