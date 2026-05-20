import { Footer } from "@/components/layout/Footer";
import { Header1 } from "@/components/layout/Header1";
import { Sidebar } from "@/components/layout/Sidebar";
import { WieldyContainer, WieldyLayout } from "@wieldy/components";
import { layoutConfig } from "./_config";

const DefaultLayout = ({ children }) => {
  return (
    <WieldyLayout
      header={<Header1 />}
      sidebar={<Sidebar />}
      footer={<Footer />}
      styles={layoutConfig.styles}
      classes={layoutConfig.classes}
      layoutOptions={layoutConfig.layoutOptions}
    >
      <WieldyContainer>{children}</WieldyContainer>
    </WieldyLayout>
  );
};

export default DefaultLayout;
