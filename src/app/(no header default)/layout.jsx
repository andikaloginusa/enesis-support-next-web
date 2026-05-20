import { Footer } from "@/components/layout/Footer";
import { Sidebar } from "@/components/layout/Sidebar";
import { WieldyContainer, WieldyLayout } from "@wieldy/components";
import { layoutConfig } from "./_config";

const NoHeaderDefaultLayout = ({ children }) => {
  return (
    <WieldyLayout
      sidebar={<Sidebar />}
      footer={<Footer />}
      styles={layoutConfig.styles}
      layoutOptions={layoutConfig.layoutOptions}
      classes={layoutConfig.classes}
    >
      <WieldyContainer>{children}</WieldyContainer>
    </WieldyLayout>
  );
};

export default NoHeaderDefaultLayout;
