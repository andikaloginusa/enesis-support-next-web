import { Footer1 } from "@/components/layout/Footer1";
import { Header2 } from "@/components/layout/Header2";
import { WieldyContainer, WieldyLayout } from "@wieldy/components";
import { layoutConfig } from "./_config";

const HorizontalLayout = ({ children }) => {
  return (
    <WieldyLayout
      header={<Header2 />}
      footer={<Footer1 />}
      styles={layoutConfig.styles}
      layoutOptions={layoutConfig.layoutOptions}
      classes={layoutConfig.classes}
    >
      <WieldyContainer>{children}</WieldyContainer>
    </WieldyLayout>
  );
};

export default HorizontalLayout;
