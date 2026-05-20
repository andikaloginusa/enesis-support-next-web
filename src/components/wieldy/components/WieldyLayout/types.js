import PropTypes from "prop-types";

export const WieldyLayoutClasses = PropTypes.shape({
  root: PropTypes.string,
  header: PropTypes.string,
  footer: PropTypes.string,
  sidebar: PropTypes.string,
  content: PropTypes.string,
  rightSidebar: PropTypes.string,
});

export const WieldyLayoutStyles = PropTypes.shape({
  root: PropTypes.object,
  header: PropTypes.object,
  footer: PropTypes.object,
  sidebar: PropTypes.object,
  content: PropTypes.object,
  rightSidebar: PropTypes.object,
});

export const WieldyHeaderProps = {
  children: PropTypes.node.isRequired,
  style: PropTypes.object,
  className: PropTypes.string,
};

export const WieldyFooterProps = {
  children: PropTypes.node.isRequired,
  style: PropTypes.object,
  className: PropTypes.string,
};

export const WieldySidebarProps = {
  children: PropTypes.node.isRequired,
  style: PropTypes.object,
  className: PropTypes.string,
  hidden: PropTypes.bool,
  fixedPosition: PropTypes.shape({
    top: PropTypes.number,
    bottom: PropTypes.number,
  }),
  isDrawer: PropTypes.bool,
  fixed: PropTypes.bool,
};

export const WieldyRightSidebarProps = {
  ...WieldySidebarProps,
};

export const WieldyLayoutSidebarOptions = PropTypes.shape({
  hidden: PropTypes.bool,
  fixedPosition: PropTypes.shape({
    top: PropTypes.number,
    bottom: PropTypes.number,
  }),
  isDrawer: PropTypes.bool,
  fixed: PropTypes.bool,
});

export const WieldyLayoutHeaderOptions = PropTypes.shape({
  fixed: PropTypes.bool,
  hidden: PropTypes.bool,
  spreadOut: PropTypes.bool,
});

export const WieldyLayoutFooterOptions = PropTypes.shape({
  fixed: PropTypes.bool,
  hidden: PropTypes.bool,
  spreadOut: PropTypes.bool,
});

export const WieldyLayoutOptions = PropTypes.shape({
  header: WieldyLayoutHeaderOptions,
  sidebar: WieldyLayoutSidebarOptions,
  rightSidebar: WieldyLayoutSidebarOptions,
  footer: WieldyLayoutFooterOptions,
});

export const WieldyLayoutConfig = PropTypes.shape({
  styles: WieldyLayoutStyles,
  classes: WieldyLayoutClasses,
  layoutOptions: WieldyLayoutOptions,
});

export const WieldyLayoutContextType = PropTypes.shape({
  ...WieldyLayoutConfig,
  setHeaderOptions: PropTypes.func.isRequired,
  setSidebarOptions: PropTypes.func.isRequired,
  setRightSidebarOptions: PropTypes.func.isRequired,
  setFooterOptions: PropTypes.func.isRequired,
});

export const WieldyLayoutProps = {
  ...WieldyLayoutConfig,
  header: PropTypes.node,
  footer: PropTypes.node,
  sidebar: PropTypes.node,
  rightSidebar: PropTypes.node,
  children: PropTypes.node.isRequired,
};
