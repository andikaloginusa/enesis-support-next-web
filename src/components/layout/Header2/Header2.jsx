"use client";
import wieldyWhiteLogo from "@public/logo-white.png";
import wieldyLogo from "@public/logo.png";
import { WieldyContainer } from "@wieldy/components";
import { useWieldyTheme } from "@wieldy/components/WieldyTheme/hooks";
import { Input, Select, Space, theme } from "antd";
import Image from "next/image";
import Link from "next/link";
import { RiSearchLine } from "react-icons/ri";
import { MessagesPopover } from "../MessagesPopover";
import { NotificationsPopover } from "../NotificationsPopover";
import { TranslationsPopover } from "../TranslationsPopover";
import { UserPopover } from "../UserPopover";
import { HeaderMenuOptions } from "./HeaderMenuOptions";
import { Topbar } from "./Topbar";

const { useToken } = theme;

export const Header2 = () => {
  const { token } = useToken();
  const { themeMode } = useWieldyTheme();
  return (
    <div className="relative flex-1 xl:before:block xl:before:absolute xl:before:right-[8vw] xl:before:top-[-212px] xl:before:h-[350px] xl:before:w-[280px] xl:before:bg-black/10 xl:before:dark:bg-white/20 xl:before:rotate-45 xl:before:rounded-b-[140px]">
      <Topbar />
      <div className="pt-6 pb-8">
        <WieldyContainer>
          <div className="flex justify-between">
            <div className="flex  items-center">
              <Link href="/" className="inline-flex mr-6">
                <Image
                  src={themeMode === "light" ? wieldyLogo : wieldyWhiteLogo}
                  alt="wieldy-logo"
                  className="w-[90px]"
                />
              </Link>
              <div className="max-w-md ">
                <Input.Group compact className="flex">
                  <Input
                    prefix={<RiSearchLine />}
                    placeholder="input search text"
                    allowClear
                  />
                  <Select defaultValue="Apps">
                    <Select.Option value="Produts">Products</Select.Option>
                    <Select.Option value="Apps">Apps</Select.Option>
                    <Select.Option value="Blogs">Blogs</Select.Option>
                  </Select>
                </Input.Group>
              </div>
            </div>
            <div>
              <Space>
                <TranslationsPopover />
                <NotificationsPopover />
                <MessagesPopover />
                <UserPopover />
              </Space>
            </div>
          </div>
        </WieldyContainer>
      </div>
      <div
        style={{ backgroundColor: token.Menu.itemBg }}
        className="min-h-12 leading-[48px]"
      >
        <WieldyContainer>
          <HeaderMenuOptions />
        </WieldyContainer>
      </div>
    </div>
  );
};
