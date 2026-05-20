"use client";
import { BUY_NOW_PRICE } from "@/utils/constants";
import { currentYear } from "@/utils/data";
import { Button, Typography } from "antd";

const Footer1 = () => {
  return (
    <div className="flex justify-between items-center mx-auto px-8 max-w-[1400px]">
      <Typography.Text>{`Copyright Company Name © ${currentYear}`}</Typography.Text>
      <div className="flex items-center">
        <Typography.Text className="mr-4">{`${BUY_NOW_PRICE} Only`}</Typography.Text>
        <Button
          type="primary"
          target="_blank"
          href="https://codecanyon.net/checkout/from_item/22719616?license=regular&size=source&support=bundle_6month"
        >
          {"Buy Now"}
        </Button>
      </div>
    </div>
  );
};
export { Footer1 };
