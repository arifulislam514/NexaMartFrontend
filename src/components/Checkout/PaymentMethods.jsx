import React from 'react';
import { Banknote, CreditCard, Smartphone, ShieldCheck, Check } from 'lucide-react';

/**
 * PaymentMethods Component
 * Radio group for choosing order payment option strictly matching nexamart_app.tsx design.
 * Primary method is Cash on Delivery (COD); others show coming soon status.
 *
 * @param {Object} props
 * @param {string} [props.selectedMethod='cod']
 * @param {Function} props.onSelectMethod - (methodKey: string) => void
 * @param {boolean} [props.disabled=false]
 * @param {string} [props.className='']
 */
const PaymentMethods = ({
  selectedMethod = 'cod',
  onSelectMethod,
  disabled = false,
  className = '',
}) => {
  const methods = [
    {
      id: 'cod',
      title: 'Cash on Delivery (COD)',
      description: 'Pay with cash upon physical delivery to your doorstep',
      icon: Banknote,
      available: true,
      badge: 'Recommended',
    },
    {
      id: 'mfs',
      title: 'Mobile Banking (bKash / Nagad / Rocket)',
      description: 'Instant mobile wallet payment gateway',
      icon: Smartphone,
      available: false,
      badge: 'Coming Soon',
    },
    {
      id: 'card',
      title: 'Credit / Debit Card',
      description: 'Visa, MasterCard, or American Express',
      icon: CreditCard,
      available: false,
      badge: 'Coming Soon',
    },
  ];

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 ${className}`}
    >
      <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-slate-100">
        <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Banknote className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">Payment Method</h3>
          <p className="text-xs text-slate-500">
            Select your preferred method to complete this order
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {methods.map((method) => {
          const isSelected = selectedMethod === method.id;
          const Icon = method.icon;

          if (!method.available) {
            return (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 border border-slate-200/80 rounded-xl bg-slate-50/50 opacity-60 cursor-not-allowed select-none"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-transparent" />
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 text-sm">
                      {method.title}
                    </p>
                    <p className="text-xs text-slate-400">{method.description}</p>
                  </div>
                </div>

                <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                  {method.badge}
                </span>
              </div>
            );
          }

          return (
            <label
              key={method.id}
              className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all select-none ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/40'
              } ${disabled ? 'pointer-events-none opacity-60' : ''}`}
            >
              <div className="flex items-center gap-3.5">
                <input
                  type="radio"
                  name="payment_method"
                  value={method.id}
                  checked={isSelected}
                  onChange={() => onSelectMethod && onSelectMethod(method.id)}
                  disabled={disabled}
                  className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                />
                <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">
                    {method.title}
                  </p>
                  <p className="text-xs text-indigo-900/70">{method.description}</p>
                </div>
              </div>

              {method.badge && (
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-full">
                  {method.badge}
                </span>
              )}
            </label>
          );
        })}
      </div>

      <div className="mt-6 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-2.5 text-xs text-slate-600">
        <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        <span>
          No advance payment needed for Cash on Delivery. Pay only after inspecting your package.
        </span>
      </div>
    </div>
  );
};

export default PaymentMethods;
