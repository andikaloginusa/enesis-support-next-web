import { Avatar, Typography, theme } from "antd";

export function NotificationItem({ notification }) {
  const { token } = theme.useToken();

  return (
    <div className="flex px-4 py-2 cursor-pointer">
      <Avatar src={notification?.profilePic} className="size-10 shrink-0" />
      <div className="flex-1 [&:not(:first-child)]:pl-4">
        <Typography.Paragraph className="mb-1">
          <span style={{ color: token.colorLink }} className="cursor-pointer">
            {`${notification?.firstName} ${notification?.lastName}`}
          </span>
          {` ${notification?.content}`}
        </Typography.Paragraph>
        <div className="flex items-center gap-2">
          {notification?.icon}
          <Typography.Text type="secondary" className="text-xs">
            {notification?.createdAt}
          </Typography.Text>
        </div>
      </div>
    </div>
  );
}
