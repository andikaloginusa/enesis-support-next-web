"use client";

import { SidebarToggleButton } from "@/components/layout/SidebarToggleButton";
import { Space} from "antd";
import { ThemeModeOptions } from "../ThemeModeOptions";
import { TranslationsPopover } from "../TranslationsPopover";
import { UserPopover } from "../UserPopover";

export function Header1() {
  return (
    <div className="relative flex flex-1 items-center">
      <div className="-ml-3 mr-6">
        <SidebarToggleButton />
      </div>
      <div className="ml-auto pl-4 flex items-center">
        <Space>
          <ThemeModeOptions />
          <TranslationsPopover />
          <UserPopover />
        </Space>
      </div>
    </div>
  );
}
