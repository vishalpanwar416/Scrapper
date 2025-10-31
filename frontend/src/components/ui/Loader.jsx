import React from 'react';

export const Loader = ({ size = 'md', variant = 'spinner' }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  if (variant === 'spinner') {
    return (
      <div className={`${sizes[size]} animate-spin`}>
        <svg className="w-full h-full text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`${sizes[size]} bg-blue-500 rounded-full animate-pulse`} />
    );
  }

  return (
    <div className={`${sizes[size]} flex gap-1 items-center justify-center`}>
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
    </div>
  );
};

export const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50">
    <div className="text-center">
      <Loader size="lg" />
      <p className="text-gray-600 dark:text-gray-400 mt-4 font-medium">Loading...</p>
    </div>
  </div>
);

export const SkeletonCard = () => (
  <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl p-6 animate-pulse">
    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-4" />
    <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-full mb-4" />
    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
  </div>
);
