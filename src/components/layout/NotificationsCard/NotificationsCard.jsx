import { ArrowRightOutlined } from "@ant-design/icons";
import { Button, Card } from "antd";
import { RiMoreFill } from "react-icons/ri";
import { NotificationItem } from "./NotificationItem/NotificationItem";
import { notificationData } from "./data";

export function NotificationsCard() {
  return (
    <Card
      title="Notifications"
      extra={
        <Button
          type="text"
          size="small"
          shape={"circle"}
          icon={<RiMoreFill fontSize={18} />}
        />
      }
      actions={[
        <Button type={"link"} size={"small"} key={'view-all'}>
          View all
          <ArrowRightOutlined />
        </Button>,
      ]}
      classNames={{
        body: "p-0 max-h-[300px] overflow-auto",
        header: "border-0",
      }}
      className="w-[360px]"
    >
      {notificationData?.map((notification, index) => (
        <NotificationItem key={index} notification={notification} />
      ))}
    </Card>
  );
}
