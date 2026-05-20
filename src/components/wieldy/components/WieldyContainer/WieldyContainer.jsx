import PropTypes from "prop-types";

export const WieldyContainer = ({ children }) => {
  return <div className="mx-auto px-8 max-w-[1400px]">{children}</div>;
};

// Define prop types for the component
WieldyContainer.propTypes = {
  children: PropTypes.node.isRequired,
};
