import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * LoadingSpinner Component
 * Reusable loading indicator matching NexaMart branding.
 *
 * @param {Object} props
 * @param {'sm'|'md'|'lg'|'xl'} [props.size='md'] - Spinner size
 * @param {string} [props.text] - Optional loading message
 * @param {boolean} [props.fullScreen=false] - Center in full viewport
 * @param {boolean} [props.inline=false] - Display inline horizontally
 * @param {string} [props.className=''] - Extra classes
 */
const LoadingSpinner = ({
  size = 'md',
  text = '',
  fullScreen = false,
  inline = false,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const spinnerSize = sizeMap[size] || sizeMap.md;

  if (inline) {
    return (
      <div className={`inline-flex items-center gap-2 text-slate-600 text-sm ${className}`}>
        <Loader2 className={`${spinnerSize} animate-spin text-indigo-600 flex-shrink-0`} />
        {text && <span className="font-medium">{text}</span>}
      </div>
    );
  }

  const content = (
    <div className={`flex flex-col items-center justify-center text-center p-6 ${className}`}>
      <div className="relative flex items-center justify-center">
        <Loader2 className={`${spinnerSize} animate-spin text-indigo-600`} />
      </div>
      {text && (
        <p className="mt-3 text-sm font-medium text-slate-500 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return <div className="w-full flex justify-center items-center py-12">{content}</div>;
};

export default LoadingSpinner;
