import React from 'react';

const ProgressBar = ({
  value = 0,
  max = 100,
  size = 'md', // sm, md, lg
  color = 'blue', // blue, green, yellow, red, gray
  showLabel = true,
  label,
  animated = false,
  striped = false,
  className = ''
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-2';
      case 'lg':
        return 'h-4';
      case 'md':
      default:
        return 'h-3';
    }
  };

  const getColorClasses = () => {
    const colorMap = {
      blue: 'bg-blue-600',
      green: 'bg-green-600',
      yellow: 'bg-yellow-500',
      red: 'bg-red-600',
      gray: 'bg-gray-600'
    };
    
    return colorMap[color] || colorMap.blue;
  };

  const getStripedClasses = () => {
    return striped ? 'bg-stripes' : '';
  };

  const getAnimatedClasses = () => {
    return animated ? 'animate-pulse' : '';
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">
            {label || `${Math.round(percentage)}%`}
          </span>
          <span className="text-sm text-gray-500">
            {value}/{max}
          </span>
        </div>
      )}
      
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${getSizeClasses()}`}>
        <div
          className={`
            h-full transition-all duration-300 ease-in-out
            ${getColorClasses()}
            ${getStripedClasses()}
            ${getAnimatedClasses()}
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
