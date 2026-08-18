"use client";
import { currentYear } from "@/utils/data";
import { Typography } from "antd";

const Footer = () => {
  return (
    <div className="flex justify-between items-center">
      <Typography.Text>{`Copyright Company Name © ${currentYear}`}</Typography.Text>
    </div>
  );
};
export { Footer };
