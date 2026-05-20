import { Typography } from "antd";
import React from "react";

export function IconText({ icon, text }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-base">{React.createElement(icon)}</span>
      <Typography.Text type="secondary" className="text-xs">
        {text}
      </Typography.Text>
    </div>
  );
}
