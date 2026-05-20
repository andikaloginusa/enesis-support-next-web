import { Footer } from "@/components/layout/Footer";
import { Header4 } from "@/components/layout/Header4";
import { WieldyContainer, WieldyLayout } from "@wieldy/components";
import { layoutConfig } from "./_config";

const AboveHeaderLayout = ({ children }) => {
  return (
    <WieldyLayout
      header={<Header4 />}
      footer={<Footer />}
      styles={layoutConfig.styles}
      layoutOptions={layoutConfig.layoutOptions}
      classes={layoutConfig.classes}
    >
      <WieldyContainer>{children}</WieldyContainer>
    </WieldyLayout>
  );
};

export default AboveHeaderLayout;
