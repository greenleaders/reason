import React from 'react';
import { CheckCircle, Clock, AlertCircle, XCircle, Pause, Play } from 'lucide-react';

const StatusBadge = ({ 
  status, 
  type = 'default', // default, campaign, assignment, content, payment
  size = 'md', // sm, md, lg
  showIcon = true,
  className = ''
}) => {
  const getStatusConfig = () => {
    const configs = {
      // Campaign statuses
      draft: { 
        color: 'gray', 
        text: 'Draft', 
        icon: Clock 
      },
      pending_approval: { 
        color: 'yellow', 
        text: 'Pending Approval', 
        icon: Clock 
      },
      active: { 
        color: 'green', 
        text: 'Active', 
        icon: Play 
      },
      completed: { 
        color: 'blue', 
        text: 'Completed', 
        icon: CheckCircle 
      },
      cancelled: { 
        color: 'red', 
        text: 'Cancelled', 
        icon: XCircle 
      },
      
      // Assignment statuses
      assigned: { 
        color: 'yellow', 
        text: 'Assigned', 
        icon: Clock 
      },
      accepted: { 
        color: 'green', 
        text: 'Accepted', 
        icon: CheckCircle 
      },
      declined: { 
        color: 'red', 
        text: 'Declined', 
        icon: XCircle 
      },
      
      // Content statuses
      submitted: { 
        color: 'yellow', 
        text: 'Submitted', 
        icon: Clock 
      },
      under_review: { 
        color: 'blue', 
        text: 'Under Review', 
        icon: AlertCircle 
      },
      approved: { 
        color: 'green', 
        text: 'Approved', 
        icon: CheckCircle 
      },
      revision_requested: { 
        color: 'yellow', 
        text: 'Revision Requested', 
        icon: AlertCircle 
      },
      rejected: { 
        color: 'red', 
        text: 'Rejected', 
        icon: XCircle 
      },
      
      // Payment statuses
      pending: { 
        color: 'yellow', 
        text: 'Pending', 
        icon: Clock 
      },
      processing: { 
        color: 'blue', 
        text: 'Processing', 
        icon: Clock 
      },
      paid: { 
        color: 'green', 
        text: 'Paid', 
        icon: CheckCircle 
      },
      failed: { 
        color: 'red', 
        text: 'Failed', 
        icon: XCircle 
      },
      refunded: { 
        color: 'gray', 
        text: 'Refunded', 
        icon: XCircle 
      }
    };

    return configs[status] || { 
      color: 'gray', 
      text: status, 
      icon: AlertCircle 
    };
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-sm';
      case 'md':
      default:
        return 'px-3 py-1 text-sm';
    }
  };

  const getColorClasses = (color) => {
    const colorMap = {
      gray: 'bg-gray-100 text-gray-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      green: 'bg-green-100 text-green-800',
      blue: 'bg-blue-100 text-blue-800',
      red: 'bg-red-100 text-red-800'
    };
    
    return colorMap[color] || colorMap.gray;
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${getSizeClasses()}
        ${getColorClasses(config.color)}
        ${className}
      `}
    >
      {showIcon && (
        <Icon className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
      )}
      {config.text}
    </span>
  );
};

export default StatusBadge;
