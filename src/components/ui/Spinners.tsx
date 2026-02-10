import React from 'react';

// Option 1: Classic Loading Spinner
export const ClassicSpinner = ({ size = 'md', color = 'blue' }: { size?: 'sm' | 'md' | 'lg'; color?: 'blue' | 'white' | 'gray' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };
  
  const colorClasses = {
    blue: 'border-blue-600',
    white: 'border-white',
    gray: 'border-gray-600'
  };

  return (
    <div className={`animate-spin rounded-full border-2 ${sizeClasses[size]} ${colorClasses[color]} border-t-transparent`}></div>
  );
};

// Option 2: Dots Loading
export const DotsSpinner = ({ color = 'blue' }: { color?: 'blue' | 'white' | 'gray' }) => {
  const colorClasses = {
    blue: 'bg-blue-600',
    white: 'bg-white',
    gray: 'bg-gray-600'
  };

  return (
    <div className="flex space-x-2">
      <div className={`w-2 h-2 ${colorClasses[color]} rounded-full animate-bounce`}></div>
      <div className={`w-2 h-2 ${colorClasses[color]} rounded-full animate-bounce`} style={{ animationDelay: '0.1s' }}></div>
      <div className={`w-2 h-2 ${colorClasses[color]} rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }}></div>
    </div>
  );
};

// Option 3: Pulse Spinner
export const PulseSpinner = ({ size = 'md', color = 'blue' }: { size?: 'sm' | 'md' | 'lg'; color?: 'blue' | 'white' | 'gray' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };
  
  const colorClasses = {
    blue: 'bg-blue-600',
    white: 'bg-white',
    gray: 'bg-gray-600'
  };

  return (
    <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-pulse`}></div>
  );
};

// Option 4: Modern Ring Spinner
export const RingSpinner = ({ size = 'md', color = 'blue' }: { size?: 'sm' | 'md' | 'lg'; color?: 'blue' | 'white' | 'gray' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };
  
  const colorClasses = {
    blue: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-600'
  };

  return (
    <svg className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
};

// Option 5: Heartbeat Spinner
export const HeartbeatSpinner = ({ size = 'md', color = 'blue' }: { size?: 'sm' | 'md' | 'lg'; color?: 'blue' | 'white' | 'gray' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };
  
  const colorClasses = {
    blue: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-600'
  };

  return (
    <svg className={`animate-pulse ${sizeClasses[size]} ${colorClasses[color]}`} xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  );
};

// Option 6: Gradient Spinner
export const GradientSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  };

  return (
    <div className={`${sizeClasses[size]} animate-spin rounded-full bg-gradient-to-r from-blue-500 to-purple-600`}>
      <div className="w-full h-full rounded-full border-2 border-white border-t-transparent"></div>
    </div>
  );
};

// Option 7: Minimal Spinner
export const MinimalSpinner = ({ color = 'blue' }: { color?: 'blue' | 'white' | 'gray' }) => {
  const colorClasses = {
    blue: 'bg-blue-600',
    white: 'bg-white',
    gray: 'bg-gray-600'
  };

  return (
    <div className="flex space-x-1">
      <div className={`w-1 h-4 ${colorClasses[color]} animate-pulse`} style={{ animationDelay: '0s' }}></div>
      <div className={`w-1 h-4 ${colorClasses[color]} animate-pulse`} style={{ animationDelay: '0.2s' }}></div>
      <div className={`w-1 h-4 ${colorClasses[color]} animate-pulse`} style={{ animationDelay: '0.4s' }}></div>
      <div className={`w-1 h-4 ${colorClasses[color]} animate-pulse`} style={{ animationDelay: '0.6s' }}></div>
      <div className={`w-1 h-4 ${colorClasses[color]} animate-pulse`} style={{ animationDelay: '0.8s' }}></div>
    </div>
  );
};

// Option 8: Full Page Loading Overlay
export const LoadingOverlay = ({ message = 'Loading...', spinner = 'classic' }: { message?: string; spinner?: 'classic' | 'dots' | 'ring' | 'gradient' }) => {
  const renderSpinner = () => {
    switch (spinner) {
      case 'dots':
        return <DotsSpinner color="blue" />;
      case 'ring':
        return <RingSpinner size="lg" color="blue" />;
      case 'gradient':
        return <GradientSpinner size="lg" />;
      default:
        return <ClassicSpinner size="lg" color="blue" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 flex flex-col items-center space-y-4">
        {renderSpinner()}
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  );
};
