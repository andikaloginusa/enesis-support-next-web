import { Footer1 } from "@/components/layout/Footer1";
import { Header3 } from "@/components/layout/Header3";
import { WieldyContainer, WieldyLayout } from "@wieldy/components";
import { layoutConfig } from "./_config";

const InsideHeaderHorizontalLayout = ({ children }) => {
  return (
    <WieldyLayout
      header={<Header3 />}
      footer={<Footer1 />}
      styles={layoutConfig.styles}
      layoutOptions={layoutConfig.layoutOptions}
      classes={layoutConfig.classes}
    >
      <WieldyContainer>{children}</WieldyContainer>
    </WieldyLayout>
  );
};

export default InsideHeaderHorizontalLayout;
