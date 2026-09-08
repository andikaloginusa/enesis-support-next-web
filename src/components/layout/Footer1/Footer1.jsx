import { currentYear } from "@/utils/data";
import { Typography } from "antd";

const Footer1 = () => {
  return (
    <div className="flex justify-between items-center mx-auto px-8 max-w-[1400px]">
      <Typography.Text>{`Copyright Enesis © ${currentYear}`}</Typography.Text>
    </div>
  );
};
export { Footer1 };
