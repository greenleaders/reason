import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({
  title,
  value,
  change,
  changeType = 'neutral', // positive, negative, neutral
  icon: Icon,
  color = 'blue',
  formatValue,
  className = ''
}) => {
  const getColorClasses = () => {
    const colorMap = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      yellow: 'text-yellow-600 bg-yellow-100',
      red: 'text-red-600 bg-red-100',
      purple: 'text-purple-600 bg-purple-100',
      gray: 'text-gray-600 bg-gray-100'
    };
    
    return colorMap[color] || colorMap.blue;
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') {
      return <TrendingUp className="h-4 w-4" />;
    } else if (changeType === 'negative') {
      return <TrendingDown className="h-4 w-4" />;
    }
    return null;
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      case 'neutral':
      default:
        return 'text-gray-600';
    }
  };

  const formatDisplayValue = (val) => {
    if (formatValue) {
      return formatValue(val);
    }
    
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return (val / 1000000).toFixed(1) + 'M';
      } else if (val >= 1000) {
        return (val / 1000).toFixed(1) + 'K';
      }
      return val.toLocaleString();
    }
    
    return val;
  };

  return (
    <div className={`card ${className}`}>
      <div className="card-body">
        <div className="flex items-center">
          {Icon && (
            <div className={`p-2 rounded-lg ${getColorClasses()}`}>
              <Icon className="h-6 w-6" />
            </div>
          )}
          
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600">
              {title}
            </p>
            
            <div className="flex items-baseline">
              <p className="text-2xl font-bold text-gray-900">
                {formatDisplayValue(value)}
              </p>
              
              {change !== undefined && change !== null && (
                <div className={`ml-2 flex items-center ${getChangeColor()}`}>
                  {getChangeIcon()}
                  <span className="text-sm font-medium ml-1">
                    {Math.abs(change)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
