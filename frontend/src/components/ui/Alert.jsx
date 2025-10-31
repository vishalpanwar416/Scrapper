import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

export const Alert = ({
  type = 'info',
  title,
  message,
  dismissible = false,
  onDismiss,
  className = '',
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const types = {
    info: {
      icon: Info,
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-800 dark:text-blue-200',
      icon_color: 'text-blue-500 dark:text-blue-400',
    },
    success: {
      icon: CheckCircle,
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-800 dark:text-green-200',
      icon_color: 'text-green-500 dark:text-green-400',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-800 dark:text-yellow-200',
      icon_color: 'text-yellow-500 dark:text-yellow-400',
    },
    error: {
      icon: AlertCircle,
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-800 dark:text-red-200',
      icon_color: 'text-red-500 dark:text-red-400',
    },
  };

  const config = types[type];
  const IconComponent = config.icon;

  return (
    <div
      className={`rounded-lg border p-4 flex gap-3 ${config.bg} ${config.border} ${className} animate-in fade-in slide-in-from-top duration-300`}
    >
      <IconComponent className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.icon_color}`} />
      <div className="flex-1">
        {title && (
          <h4 className={`font-semibold ${config.text}`}>
            {title}
          </h4>
        )}
        <p className={`text-sm ${config.text} ${title ? 'mt-1' : ''}`}>
          {message}
        </p>
      </div>
      {dismissible && (
        <button
          onClick={handleDismiss}
          className={`flex-shrink-0 ${config.text} hover:opacity-70 transition-opacity`}
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};
