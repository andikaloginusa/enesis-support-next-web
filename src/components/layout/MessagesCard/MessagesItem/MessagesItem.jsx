import { IconText } from "@/components/layout/IconText";
import { Avatar, Typography, theme } from "antd";
import { RiMessage2Line } from "react-icons/ri";

export function MessagesItem({ item }) {
  const { token } = theme.useToken();
  return (
    <div className="flex px-4 py-2 cursor-pointer">
      <Avatar src={item?.profilePic} className="size-10 shrink-0" />
      <div className="flex-1 [&:not(:first-child)]:pl-4">
        <Typography.Paragraph className="mb-1">
          <span style={{ color: token.colorLink, cursor: "pointer" }}>
            {`${item?.firstName} ${item?.lastName}`}
          </span>
          {` ${item?.message}`}
        </Typography.Paragraph>
        <IconText icon={RiMessage2Line} text={item?.createdAt} />
      </div>
    </div>
  );
}
