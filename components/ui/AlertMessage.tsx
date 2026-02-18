import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface AlertMessageProps {
  type: 'error' | 'success';
  message: string;
  className?: string;
}

export const AlertMessage: React.FC<AlertMessageProps> = ({ type, message, className = "" }) => {
  const baseClasses = "flex items-center gap-2 p-3 rounded-lg text-sm";
  const typeClasses = type === 'error' 
    ? "bg-red-50 border border-red-200 text-red-600"
    : "bg-green-50 border border-green-200 text-green-600";
  
  const Icon = type === 'error' ? AlertCircle : CheckCircle2;

  return (
    <div className={`${baseClasses} ${typeClasses} ${className}`}>
      <Icon className="h-4 w-4" />
      {message}
    </div>
  );
};
