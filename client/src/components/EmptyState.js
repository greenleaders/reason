import React from 'react';
import { 
  FileText, 
  Users, 
  Campaign, 
  TrendingUp, 
  Search,
  Plus,
  AlertCircle
} from 'lucide-react';

const EmptyState = ({
  icon = 'default',
  title = 'No data available',
  description = 'There are no items to display at the moment.',
  action,
  actionText = 'Get Started',
  className = ''
}) => {
  const getIcon = () => {
    const iconProps = { className: 'h-12 w-12 text-gray-400' };
    
    switch (icon) {
      case 'campaigns':
        return <Campaign {...iconProps} />;
      case 'influencers':
        return <Users {...iconProps} />;
      case 'content':
        return <FileText {...iconProps} />;
      case 'analytics':
        return <TrendingUp {...iconProps} />;
      case 'search':
        return <Search {...iconProps} />;
      case 'error':
        return <AlertCircle {...iconProps} />;
      case 'default':
      default:
        return <FileText {...iconProps} />;
    }
  };

  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="flex justify-center mb-4">
        {getIcon()}
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
        {description}
      </p>
      
      {action && (
        <button
          onClick={action}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
