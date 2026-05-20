"use client";
import { useTranslation } from "@/hooks";
import { theme } from "antd";

const { useToken } = theme;

const SectionHeader = ({ title, actions, ...restProps }) => {
  const { token } = useToken();
  const t = useTranslation();
  return (
    <div
      style={{
        borderBottomColor: token.colorBorder,
      }}
      className="flex items-center relative pb-4 mb-6 border-b before:block before:absolute before:left-0 before:h-[3px] before:w-11 before:z-10 before:-bottom-0.5 before:bg-sky-500"
      {...restProps}
    >
      <div className="text-base" style={{ color: token.colorTextHeading }}>
        {typeof title === "string" ? t(title) : title}
      </div>
      {actions ? <div className="ml-auto">{actions}</div> : null}
    </div>
  );
};

export { SectionHeader };
