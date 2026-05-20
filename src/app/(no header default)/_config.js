export const layoutConfig = {
  classes: {
    root: "wieldy-layout min-h-screen",
    header: "wieldy-layout-header shadow-md py-4 px-8 leading-[unset] h-[72px]",
    content: "wieldy-layout-content py-8",
    sidebar: "wieldy-layout-sidebar",
    rightSidebar: "wieldy-layout-right-sidebar",
    footer: "wieldy-layout-footer shadow-md py-4 px-8 min-h-12",
  },

  layoutOptions: {
    header: {
      fixed: true,
    },
    footer: {
      hidden: false,
      fixed: true,
    },
    sidebar: {
      width: 280,
      collapsible: false,
      collapsedWidth: 80,
      fixed: true,
      fixedPosition: {
        top: 72,
        bottom: 50,
      },
    },
  },
};
