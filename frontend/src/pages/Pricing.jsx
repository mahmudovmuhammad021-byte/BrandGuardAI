import { useState } from 'react';
import { CheckCircle2, Zap, Shield, Crown } from 'lucide-react';
import clsx from 'clsx';

const PRICING_PLANS = [
  {
    id: 'basic',
    name: 'Oddiy User',
    description: 'Xaridlarni tekshirish va shaxsiy foydalanish uchun',
    price: { monthly: 3, yearly: 29 },
    icon: Shield,
    features: [
      'Oyiga 50 tagacha AI skanerlash',
      'Asosiy brendlar bazasi bilan ishlash',
      'Oddiy solishtirish algoritmi',
      'Jamoat yordami (Community Support)'
    ],
    buttonText: 'Hozir boshlash',
    popular: false,
    color: 'from-blue-500 to-cyan-400'
  },
  {
    id: 'pro',
    name: 'Kichik Biznes',
    description: "Do'kon egalari va o'rtacha savdogarlar uchun",
    price: { monthly: 19, yearly: 190 },
    icon: Zap,
    features: [
      'Oyiga 10,000 tagacha AI skanerlash',
      "O'z brendingizni himoya qilish (Max 10 ta)",
      "Chuqur qalbaki mahsulotlar analizi (Lowe's Ratio)",
      'Hisobotlar va eksport qilish',
      '24/7 Mijozlarni qollab-quvvatlash'
    ],
    buttonText: 'Pro tarifga o\'tish',
    popular: true,
    color: 'from-indigo-500 to-purple-500'
  },
  {
    id: 'enterprise',
    name: 'Korporativ',
    description: 'Katta brendlar va fabrikalar uchun to\'liq yechim',
    price: { monthly: 79, yearly: 790 },
    icon: Crown,
    features: [
      'Cheksiz AI skanerlash va tekshirish',
      'Cheksiz brendlar va maxsus modellar',
      'API integratsiyasi (Saytingizga ulash)',
      'Avtomatik ijtimoiy tarmoqlar monitoringi',
      'Shaxsiy AI Model (Custom YOLO weights)'
    ],
    buttonText: 'Biz bilan bog\'lanish',
    popular: false,
    color: 'from-amber-500 to-orange-500'
  }
];

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 page-enter">
      
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold text-white sm:text-5xl tracking-tight mb-4">
          O'zingizga mos <span className="gradient-text">Tarifni tanlang</span>
        </h1>
        <p className="text-lg text-txt-secondary">
          Loyihamizdan oddiy foydalanuvchi sifatida bepul yoki tadbirkor sifatida kengaytirilgan imkoniyatlar bilan foydalaning.
        </p>

        {/* Toggle Switch */}
        <div className="mt-8 flex justify-center items-center gap-3">
          <span className={clsx("text-sm font-medium transition-colors", !isYearly ? "text-white" : "text-txt-muted")}>Oylik</span>
          <button 
            type="button"
            className="relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-bg-card border-bg-border shadow-inner"
            role="switch"
            aria-checked={isYearly}
            onClick={() => setIsYearly(!isYearly)}
          >
            <span
              aria-hidden="true"
              className={clsx(
                "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-primary shadow ring-0 transition duration-200 ease-in-out",
                isYearly ? "translate-x-7" : "translate-x-0"
              )}
            />
          </button>
          <span className={clsx("text-sm font-medium transition-colors", isYearly ? "text-white" : "text-txt-muted")}>
            Yillik <span className="ml-1.5 inline-flex items-center rounded-full bg-success/20 px-2 py-0.5 text-[10px] font-bold text-success">20% CHEGIRMA</span>
          </span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-8 items-stretch">
        {PRICING_PLANS.map((plan) => {
          const price = isYearly ? plan.price.yearly : plan.price.monthly;
          const Icon = plan.icon;

          return (
            <div 
              key={plan.id}
              className={clsx(
                "relative flex flex-col rounded-2xl border bg-bg-card p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl",
                plan.popular ? "border-primary/50 shadow-[0_0_30px_rgba(99,102,241,0.15)] ring-1 ring-primary/20 scale-105 z-10" : "border-bg-border/60"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-1 text-xs font-bold uppercase tracking-widest text-white shadow-lg">
                    Eng Mashhur
                  </span>
                </div>
              )}

              <div className="mb-6 flex items-center gap-4">
                <div className={clsx("flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-inner", plan.color)}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-txt-muted mt-1">{plan.description}</p>
                </div>
              </div>

              <div className="mb-6 flex items-baseline text-white">
                <span className="text-5xl font-extrabold tracking-tight">${price}</span>
                <span className="ml-1 text-xl font-medium text-txt-muted">
                  /{isYearly ? 'yil' : 'oy'}
                </span>
              </div>

              <ul className="mb-8 flex-1 space-y-4">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-success mr-3" />
                    <span className="text-sm text-txt-secondary">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={clsx(
                  "w-full rounded-xl py-3.5 px-4 text-sm font-bold shadow-md transition-all duration-200",
                  plan.popular 
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]" 
                    : "bg-bg-input text-white hover:bg-white/10"
                )}
              >
                {plan.buttonText}
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
