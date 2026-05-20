"use client";
import React, { useState, useEffect } from "react";
import { ASSET_AVATARS } from "@/utils/paths";
import {
  EditOutlined,
  LogoutOutlined,
  UserOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import { Avatar, Card, Divider, Menu, Typography, theme } from "antd";
import { useAuth } from "@/hooks";
import { useRouter } from "next/navigation";

const { Text } = Typography;

export const UserCardAction = () => {
  const router = useRouter();
  const { logout } = useAuth();
  const { token } = theme.useToken(); // Retrieve dynamic Ant Design active theme tokens
  const [profile, setProfile] = useState({
    name: "Harmayni Croft",
    email: "harmaynicroft@example.com",
  });

  useEffect(() => {
    try {
      const credsStr = localStorage.getItem("user_credent");
      if (credsStr) {
        const creds = JSON.parse(credsStr);
        // Defensively resolve user display details from storage
        const name = creds.nama || creds.name || creds.username || "Harmayni Croft";
        const email = creds.email || "harmaynicroft@example.com";
        setProfile({ name, email });
      }
    } catch (err) {
      console.error("Failed to parse user details in UserCardAction", err);
    }
  }, []);

  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      logout();
    } else if (key === "profile") {
      router.push("/profile");
    }
  };

  // Dynamically declare items inside the component to explicitly apply active theme token colors.
  // This bulletproofly overrides any global parent dark-text CSS cascades.
  const menuItems = [
    {
      key: "profile",
      icon: <UserOutlined style={{ color: token.colorText }} />,
      label: <span style={{ color: token.colorText }}>Profile</span>,
    },
    {
      key: "logout",
      icon: <LogoutOutlined style={{ color: token.colorText }} />,
      label: <span style={{ color: token.colorText }}>Logout</span>,
    },
  ];

  return (
    <Card
      styles={{
        body: { padding: 0 },
      }}
      className="w-[250px] overflow-hidden shadow-lg border-none"
      style={{ backgroundColor: token.colorBgContainer }}
    >
      <div className="flex flex-col items-center text-center p-4">
        <Avatar src={`${ASSET_AVATARS}/avatar9.jpg`} size={60} />
        <div className="mt-2">
          <Typography.Title
            level={5}
            className="mb-0 font-semibold"
            style={{ color: token.colorText }}
          >
            {profile.name}
          </Typography.Title>
          <Typography.Text
            className="text-xs break-all block mt-0.5"
            style={{ color: token.colorTextSecondary }}
          >
            {profile.email}
          </Typography.Text>
        </div>
      </div>
      <Divider className="m-0" style={{ borderColor: token.colorBorderSecondary }} />
      <Menu
        defaultSelectedKeys={["1"]}
        defaultOpenKeys={["sub1"]}
        mode="vertical"
        items={menuItems}
        style={{
          boxShadow: "none",
          backgroundColor: "transparent",
          border: "none",
        }}
        onClick={handleMenuClick}
      />
    </Card>
  );
};
