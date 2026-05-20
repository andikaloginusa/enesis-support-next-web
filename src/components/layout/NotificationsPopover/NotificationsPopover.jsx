import { NotificationsCard } from "@/components/layout/NotificationsCard";
import { Button, Dropdown } from "antd";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { RiNotification2Line } from "react-icons/ri";

export function NotificationsPopover() {
  const screens = useBreakpoint();
  return (
    <Dropdown
      trigger={["click"]}
      placement={screens?.xs ? "bottom" : "bottomRight"}
      popupRender={() => <NotificationsCard />}
    >
      <Button
        type="text"
        shape="circle"
        className="[&_.ant-btn-icon]:inline-flex"
        icon={<RiNotification2Line className="text-xl" />}
      />
    </Dropdown>
  );
}
