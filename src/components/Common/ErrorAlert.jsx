import React from 'react';
import { AlertCircle, AlertTriangle, Info, RefreshCw, X } from 'lucide-react';

/**
 * ErrorAlert Component
 * Reusable alert banner for errors, warnings, and notifications.
 *
 * @param {Object} props
 * @param {string|React.ReactNode} props.message - Error message
 * @param {string} [props.title] - Optional alert title
 * @param {Function} [props.onRetry] - Optional retry handler
 * @param {Function} [props.onClose] - Optional dismiss handler
 * @param {'error'|'warning'|'info'} [props.variant='error'] - Alert type
 * @param {string} [props.className=''] - Extra classes
 */
const ErrorAlert = ({
  message,
  title,
  onRetry,
  onClose,
  variant = 'error',
  className = '',
}) => {
  if (!message) return null;

  const variantStyles = {
    error: {
      container: 'bg-rose-50 border-rose-200 text-rose-800',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />,
      button: 'bg-rose-600 hover:bg-rose-700 text-white',
      closeBtn: 'text-rose-400 hover:text-rose-600 hover:bg-rose-100',
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />,
      button: 'bg-amber-600 hover:bg-amber-700 text-white',
      closeBtn: 'text-amber-400 hover:text-amber-600 hover:bg-amber-100',
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />,
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
      closeBtn: 'text-blue-400 hover:text-blue-600 hover:bg-blue-100',
    },
  };

  const style = variantStyles[variant] || variantStyles.error;

  return (
    <div
      role="alert"
      className={`rounded-2xl border p-4 sm:p-5 flex items-start gap-3.5 shadow-sm animate-fade-in ${style.container} ${className}`}
    >
      {style.icon}

      <div className="flex-1 min-w-0">
        {title && <h4 className="font-bold text-sm mb-1">{title}</h4>}
        <div className="text-sm font-medium leading-relaxed break-words">{message}</div>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className={`mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95 ${style.button}`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        )}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className={`p-1.5 rounded-lg transition-colors -mr-1 -mt-1 ${style.closeBtn}`}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ErrorAlert;
