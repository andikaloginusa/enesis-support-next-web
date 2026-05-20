import { WieldyContainer } from "@wieldy/components";
import { Button, Divider, Typography } from "antd";
import { TfiAnnouncement } from "react-icons/tfi";

export const Topbar = () => {
  return (
    <div className="py-1">
      <WieldyContainer>
        <div className="flex items-center justify-between">
          <div className="flex items-center overflow-hidden text-ellipsis gap-4">
            <Typography.Text type="warning" className="flex-shrink-0">
              <TfiAnnouncement />
            </Typography.Text>
            <Typography.Text type="warning" ellipsis>
              {"Building an application is a fun now with Wieldy."}
              tuned!
            </Typography.Text>
          </div>

          <div className="hidden sm:flex sm:items-center">
            <Button type="link" size="small">
              Login
            </Button>
            <Divider type="vertical" />
            <Button type="link" size="small">
              Signup
            </Button>
          </div>
        </div>
      </WieldyContainer>
    </div>
  );
};
