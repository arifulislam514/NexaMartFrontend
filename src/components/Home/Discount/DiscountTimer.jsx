import React, { useState, useEffect } from 'react';

/**
 * DiscountTimer Component
 * Countdown timer for promotional and flash sale banners.
 *
 * @param {Object} props
 * @param {Date|string|number} [props.targetDate] - End date/time for the countdown
 * @param {Function} [props.onExpire] - Callback when timer reaches zero
 * @param {string} [props.className='']
 */
const DiscountTimer = ({ targetDate, onExpire, className = '' }) => {
  // Default to 4 days from now if not provided
  const calculateTarget = () => {
    if (targetDate) return new Date(targetDate).getTime();
    return new Date().getTime() + 4 * 24 * 60 * 60 * 1000;
  };

  const [timeLeft, setTimeLeft] = useState(() => {
    const total = calculateTarget() - new Date().getTime();
    return Math.max(0, total);
  });

  useEffect(() => {
    const target = calculateTarget();

    const interval = setInterval(() => {
      const remaining = target - new Date().getTime();
      if (remaining <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
        if (onExpire) onExpire();
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onExpire]);

  // Break down milliseconds
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  const formatNumber = (num) => String(num).padStart(2, '0');

  const timerUnits = [
    { label: 'Days', value: formatNumber(days) },
    { label: 'Hours', value: formatNumber(hours) },
    { label: 'Mins', value: formatNumber(minutes) },
    { label: 'Secs', value: formatNumber(seconds) },
  ];

  return (
    <div className={`flex items-center gap-2 sm:gap-3 ${className}`}>
      {timerUnits.map((unit, idx) => (
        <React.Fragment key={unit.label}>
          <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl w-16 h-16 sm:w-20 sm:h-20 shadow-xs">
            <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {unit.value}
            </span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-indigo-200 uppercase tracking-wider mt-0.5">
              {unit.label}
            </span>
          </div>

          {/* Separator dots between units (except last) */}
          {idx < timerUnits.length - 1 && (
            <span className="text-xl sm:text-2xl font-bold text-amber-400/80 -mt-2">
              :
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default DiscountTimer;
