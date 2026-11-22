import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, ArrowRight, Tag, ShieldCheck } from 'lucide-react';
import DiscountTimer from './DiscountTimer';

/**
 * DiscountSection Component
 * Flash Sale / Deal of the week banner matching NexaMart theme.
 *
 * @param {Object} props
 * @param {string} [props.tag='Special Offer']
 * @param {string} [props.title='Flash Sale Deals']
 * @param {string} [props.subtitle='Up to 30% off selected bestsellers. Limited stock available!']
 * @param {string|number} [props.discountBadge='30% OFF']
 * @param {Date|string} [props.targetDate]
 * @param {string} [props.buttonText='Claim Offer']
 * @param {string} [props.buttonLink='/products']
 * @param {string} [props.className='']
 */
const DiscountSection = ({
  tag = 'Special Offer',
  title = 'Limited Time Flash Sale',
  subtitle = 'Get up to 30% off on premium audio, fashion, and smart devices. Order before the timer runs out!',
  discountBadge = '30% OFF',
  targetDate,
  buttonText = 'Claim Offer',
  buttonLink = '/products',
  className = '',
}) => {
  return (
    <section className={`py-12 sm:py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-950 text-white p-8 sm:p-12 lg:p-16 overflow-hidden shadow-xl border border-indigo-800/40">
          {/* Decorative Glowing Elements */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-indigo-500 opacity-20 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-amber-500 opacity-15 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Details & Countdown */}
            <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider mb-5 backdrop-blur-md shadow-xs">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>{tag}</span>
              </div>

              {/* Title */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
                {title}
              </h2>

              {/* Subtitle */}
              <p className="text-indigo-200 text-sm sm:text-base max-w-xl mb-8 leading-relaxed">
                {subtitle}
              </p>

              {/* Countdown Timer */}
              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-300/90 mb-3 text-center lg:text-left">
                  Offer Ends In:
                </p>
                <DiscountTimer targetDate={targetDate} />
              </div>

              {/* CTA Button */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link
                  to={buttonLink}
                  className="px-8 py-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 inline-flex items-center gap-2 text-base active:scale-95"
                >
                  <span>{buttonText}</span>
                  <ArrowRight className="w-5 h-5 text-slate-950" />
                </Link>

                <div className="flex items-center gap-2 text-xs font-medium text-indigo-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Free Shipping & 30-Day Returns</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Discount Feature Pill */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl text-center max-w-sm w-full">
                {/* Floating Discount Tag */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-xl flex flex-col items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
                  <Tag className="w-6 h-6 mb-0.5" />
                  <span className="text-xs leading-none">SAVE</span>
                </div>

                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-2">
                  {discountBadge}
                </div>

                <p className="text-xs text-indigo-200 mb-6 uppercase tracking-wider font-semibold">
                  Use Code at Checkout
                </p>

                <div className="p-3 bg-white/10 border border-white/20 rounded-xl font-mono text-base font-bold text-amber-300 tracking-widest select-all">
                  NEXA30
                </div>

                <p className="text-[11px] text-slate-400 mt-3">
                  Valid for all registered customers on select categories.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiscountSection;
