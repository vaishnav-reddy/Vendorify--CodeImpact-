import React from 'react';
import PropTypes from 'prop-types';

const LoadingSpinner = ({
  size = 'md',
  color = 'primary',
  className = '',
  fullScreen = false,
  label = 'Loading...',
  showLabel = false,
}) => {
  const sizeClasses = {
    xs: 'h-3 w-3 border-2',
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-2',
    xl: 'h-12 w-12 border-3',
  };

  const colorClasses = {
    primary: 'border-indigo-600',
    white: 'border-white',
    gray: 'border-gray-300',
    black: 'border-gray-900',
  };

  const spinner = (
    <div className={`relative inline-block ${sizeClasses[size]}`}>
      <div
        className={`absolute inset-0 rounded-full border-t-2 border-b-2 border-current ${
          colorClasses[color] || colorClasses.primary
        } opacity-25`}
      ></div>
      <div
        className={`absolute inset-0 rounded-full border-2 border-t-transparent ${
          colorClasses[color] || colorClasses.primary
        } animate-spin`}
      ></div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-20 flex flex-col items-center justify-center z-50">
        {spinner}
        {showLabel && <span className="mt-3 text-sm text-gray-700">{label}</span>}
      </div>
    );
  }

  if (showLabel) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {spinner}
        <span className="text-sm text-gray-600">{label}</span>
      </div>
    );
  }

  return <div className={`inline-block ${className}`}>{spinner}</div>;
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf(['primary', 'white', 'gray', 'black']),
  className: PropTypes.string,
  fullScreen: PropTypes.bool,
  label: PropTypes.string,
  showLabel: PropTypes.bool,
};

export default React.memo(LoadingSpinner);
