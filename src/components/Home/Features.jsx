import React from 'react';
import { Truck, Headphones, RotateCcw, ShieldCheck } from 'lucide-react';
import { CURRENCY_SYMBOL } from '../../utils/formatters';

/**
 * Features Component (Value Propositions)
 * Displays store trust badges and value props matching nexamart_app.tsx design.
 */
const Features = () => {
  const featureList = [
    {
      icon: <Truck className="w-6 h-6" />,
      title: 'Free Delivery',
      description: `On orders over ${CURRENCY_SYMBOL}1,500`,
    },
    {
      icon: <Headphones className="w-6 h-6" />,
      title: '24/7 Support',
      description: 'Dedicated customer care anytime',
    },
    {
      icon: <RotateCcw className="w-6 h-6" />,
      title: 'Easy Returns',
      description: 'Hassle-free 30-day return policy',
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: 'Secure Payments',
      description: '100% safe checkout & Cash on Delivery',
    },
  ];

  return (
    <section className="bg-white border-y border-slate-200 py-10 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 divide-y sm:divide-y-0 lg:divide-x divide-slate-100">
          {featureList.map((feature, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center text-center group transition-transform ${
                idx > 0 ? 'pt-6 sm:pt-0' : ''
              }`}
            >
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-3.5 shadow-xs group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                {feature.icon}
              </div>
              <h4 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                {feature.title}
              </h4>
              <p className="text-sm text-slate-500 mt-1 max-w-[200px]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
