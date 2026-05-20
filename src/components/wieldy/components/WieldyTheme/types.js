import PropTypes from "prop-types";

// Define the shape of ThemeConfig (from Ant Design)
export const ThemeConfigPropType = PropTypes.shape({
  algorithm: PropTypes.oneOfType([PropTypes.array, PropTypes.func]), // Modify as per the exact shape of ThemeConfig in Ant Design
  token: PropTypes.object,
  components: PropTypes.object,
  // Add other properties from ThemeConfig if needed
});

// Define the WieldyThemeType shape
export const WieldyThemeType = PropTypes.shape({
  mainTheme: ThemeConfigPropType.isRequired,
  headerTheme: ThemeConfigPropType,
  sidebarTheme: ThemeConfigPropType,
  footerTheme: ThemeConfigPropType,
  rightSidebarTheme: ThemeConfigPropType,
});

// Define the WieldyThemeContextType shape
export const WieldyThemeContextType = PropTypes.shape({
  ...WieldyThemeType,
  setMainTheme: PropTypes.func.isRequired,
  setHeaderTheme: PropTypes.func.isRequired,
  setFooterTheme: PropTypes.func.isRequired,
  setSidebarTheme: PropTypes.func.isRequired,
  setRightSidebarTheme: PropTypes.func.isRequired,
  setTheme: PropTypes.func.isRequired,
  switchMode: PropTypes.func.isRequired,
  themeMode: PropTypes.oneOf(["light", "dark"]).isRequired,
});

// Define the WieldyThemeProps shape
export const WieldyThemeProps = {
  children: PropTypes.node.isRequired,
  theme: WieldyThemeType,
  darkTheme: WieldyThemeType,
};
