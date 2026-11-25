import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * StatCard Component
 * Metric display card for Admin Dashboard KPI metrics.
 * Strictly adheres to nexamart_app.tsx design.
 *
 * @param {Object} props
 * @param {string} props.title - Metric title (e.g. 'Total Revenue')
 * @param {string|number} props.value - Display value (e.g. '৳12,500.00' or 45)
 * @param {React.ComponentType} props.icon - Lucide icon component
 * @param {string} [props.change] - Percentage or delta string (e.g. '+12.5%')
 * @param {string} [props.changeText='vs last week'] - Context label
 * @param {boolean} [props.isPositive=true] - Positive/negative trend direction
 * @param {string} [props.subtext] - Secondary subtext or action label
 * @param {'default'|'emerald'|'blue'|'amber'|'rose'} [props.variant='default']
 * @param {Function} [props.onClick] - Optional click handler
 * @param {string} [props.className='']
 */
const StatCard = ({
  title,
  value,
  icon: Icon,
  change,
  changeText = 'vs last week',
  isPositive = true,
  subtext,
  variant = 'default',
  onClick,
  className = '',
}) => {
  // Variant theme tokens
  const variantStyles = {
    default: {
      card: 'bg-white border-slate-200 shadow-sm',
      iconBox: 'bg-indigo-50 text-indigo-600',
      title: 'text-slate-500',
      value: 'text-slate-900',
    },
    emerald: {
      card: 'bg-white border-slate-200 shadow-sm',
      iconBox: 'bg-emerald-50 text-emerald-600',
      title: 'text-slate-500',
      value: 'text-slate-900',
    },
    blue: {
      card: 'bg-white border-slate-200 shadow-sm',
      iconBox: 'bg-blue-50 text-blue-600',
      title: 'text-slate-500',
      value: 'text-slate-900',
    },
    amber: {
      card: 'bg-white border-amber-200 shadow-sm ring-1 ring-amber-100',
      iconBox: 'bg-amber-100 text-amber-700',
      title: 'text-amber-700',
      value: 'text-amber-700',
    },
    rose: {
      card: 'bg-white border-rose-200 shadow-sm ring-1 ring-rose-100',
      iconBox: 'bg-rose-50 text-rose-600',
      title: 'text-rose-700',
      value: 'text-rose-900',
    },
  };

  const currentTheme = variantStyles[variant] || variantStyles.default;

  return (
    <div
      onClick={onClick}
      className={`p-6 rounded-2xl border transition-all relative overflow-hidden group ${
        currentTheme.card
      } ${
        onClick
          ? 'cursor-pointer hover:shadow-md hover:border-slate-300 active:scale-[0.99]'
          : ''
      } ${className}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className={`text-sm font-medium mb-1 ${currentTheme.title}`}>
            {title}
          </p>
          <h3
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${currentTheme.value}`}
          >
            {value}
          </h3>
        </div>

        {Icon && (
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 shadow-2xs ${currentTheme.iconBox}`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Delta trend or Subtext */}
      <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium">
        {change ? (
          <>
            <span
              className={`flex items-center gap-0.5 font-bold ${
                isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {isPositive ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {change}
            </span>
            {changeText && (
              <span className="text-slate-400 font-normal">{changeText}</span>
            )}
          </>
        ) : subtext ? (
          <span
            className={
              variant === 'amber'
                ? 'text-amber-700 font-semibold group-hover:underline'
                : 'text-slate-500 font-medium'
            }
          >
            {subtext}
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default StatCard;
