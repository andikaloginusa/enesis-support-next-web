import { MessagesCard } from "@/components/layout/MessagesCard";
import { Button, Dropdown } from "antd";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { RiMessage2Line } from "react-icons/ri";
export function MessagesPopover() {
  const screens = useBreakpoint();
  return (
    <Dropdown
      trigger={["click"]}
      placement={screens?.xs ? "bottom" : "bottomRight"}
      popupRender={() => <MessagesCard />}
    >
      <Button
        type="text"
        shape="circle"
        className="[&_.ant-btn-icon]:inline-flex"
        icon={<RiMessage2Line className="text-xl" />}
      />
    </Dropdown>
  );
}
