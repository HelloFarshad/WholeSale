import React from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-error-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning-500" />;
      default:
        return <Info className="h-5 w-5 text-primary-500" />;
    }
  };

  const getClasses = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-success-50 border-success-200';
      case 'error':
        return 'bg-error-50 border-error-200';
      case 'warning':
        return 'bg-warning-50 border-warning-200';
      default:
        return 'bg-primary-50 border-primary-200';
    }
  };

  return (
    <div className="fixed bottom-0 right-0 p-4 z-50 space-y-4 w-full max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`border rounded-lg shadow-lg ${getClasses(
            notification.type
          )} transform transition-all duration-500 ease-in-out animate-slide-in`}
        >
          <div className="p-4 flex">
            <div className="flex-shrink-0">{getIcon(notification.type)}</div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 ml-4 flex"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;