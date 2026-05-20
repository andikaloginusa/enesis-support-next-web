export const layoutConfig = {
  classes: {
    root: "wieldy-layout min-h-screen",
    header: "wieldy-layout-header h-auto px-0 leading-[unset] shadow-md z-50",
    content: "wieldy-layout-content py-8",
    sidebar: "wieldy-layout-sidebar",
    rightSidebar: "wieldy-layout-right-sidebar",
    footer: "wieldy-layout-footer shadow-md py-4 px-8 min-h-12",
  },

  layoutOptions: {
    header: {
      spreadOut: true,
      fixed: true,
    },
    footer: {
      spreadOut: true,
      hidden: false,
      fixed: true,
    },
  },
};
