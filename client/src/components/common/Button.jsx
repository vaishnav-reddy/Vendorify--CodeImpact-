import React from 'react';
import PropTypes from 'prop-types';

const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  type = 'button',
  className = '',
  icon: Icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-teal text-white hover:bg-deep-green',
    secondary: 'bg-orange text-white hover:bg-orange/90',
    outline: 'bg-white text-teal border border-teal hover:bg-teal/5',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-teal hover:bg-teal/5',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'danger', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
  icon: PropTypes.elementType,
};

export default React.memo(Button);
