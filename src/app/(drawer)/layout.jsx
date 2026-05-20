import { Footer } from "@/components/layout/Footer";
import { Header1 } from "@/components/layout/Header1";
import { Sidebar } from "@/components/layout/Sidebar";
import { WieldyContainer, WieldyLayout } from "@wieldy/components";
import { layoutConfig } from "./_config";

const Drawer = ({ children }) => {
  return (
    <WieldyLayout
      header={<Header1 />}
      footer={<Footer />}
      sidebar={<Sidebar />}
      styles={layoutConfig.styles}
      layoutOptions={layoutConfig.layoutOptions}
      classes={layoutConfig.classes}
    >
      <WieldyContainer>{children}</WieldyContainer>
    </WieldyLayout>
  );
};

export default Drawer;
