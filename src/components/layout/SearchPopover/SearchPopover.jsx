"use client";
import { Button, Dropdown } from "antd";
import { RiSearchLine } from "react-icons/ri";
import { SearchInput } from "./SearchInput";
export const SearchPopover = () => {
  return (
    <Dropdown
      trigger={["click"]}
      placement="bottom"
      popupRender={() => <SearchInput />}
    >
      <Button
        type="text"
        shape="circle"
        icon={<RiSearchLine className="text-xl" />}
      />
    </Dropdown>
  );
};
