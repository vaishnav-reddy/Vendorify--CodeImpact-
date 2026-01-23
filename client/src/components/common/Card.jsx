import React from 'react';
import PropTypes from 'prop-types';

const Card = ({
  children,
  className = '',
  hoverEffect = false,
  padding = 'md',
  ...props
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const hoverClass = hoverEffect ? 'hover:shadow-md transition-shadow duration-200' : '';

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-teal/10 overflow-hidden ${paddingClasses[padding]} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  hoverEffect: PropTypes.bool,
  padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg']),
};

export { Card };

export default React.memo(Card);

// Card Header Component
export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`border-b border-teal/10 pb-3 mb-3 ${className}`} {...props}>
    {children}
  </div>
);

CardHeader.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

// Card Title Component
export const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`text-lg font-semibold text-deep-green ${className}`} {...props}>
    {children}
  </h3>
);

CardTitle.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

// Card Content Component
export const CardContent = ({ children, className = '', ...props }) => (
  <div className={`${className}`} {...props}>
    {children}
  </div>
);

CardContent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

// Card Footer Component
export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`border-t border-teal/10 pt-3 mt-3 ${className}`} {...props}>
    {children}
  </div>
);

CardFooter.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};
