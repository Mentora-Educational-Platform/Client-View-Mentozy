"use client";
import { Check, X, Zap } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for getting started',
    features: [
      { name: '0 Live Minutes', included: true },
      { name: 'Access to Community', included: true },
      { name: 'Basic Practice Material', included: true },
      { name: 'Mentor Group Calls', included: false },
      { name: 'Course Access', included: false },
    ],
    cta: 'Get Started',
    popular: false,
    color: 'gray'
  },
  {
    name: 'Premium',
    price: '$30',
    period: '/month',
    description: 'For serious learners',
    features: [
      { name: '100 Live Minutes', included: true },
      { name: 'Access to Community', included: true },
      { name: 'All Practice Material', included: true },
      { name: 'Mentor Group Calls', included: true },
      { name: 'Basic Course Access', included: true },
    ],
    cta: 'Subscribe Now',
    popular: true,
    color: 'amber'
  },
  {
    name: 'Ultra',
    price: '$60',
    period: '/month',
    description: 'Accelerate your growth',
    features: [
      { name: '200 Live Minutes', included: true },
      { name: 'Priority Community Access', included: true },
      { name: 'Advanced Practice Material', included: true },
      { name: 'Weekly Group Calls', included: true },
      { name: 'Full Course Access', included: true },
    ],
    cta: 'Go Ultra',
    popular: false,
    color: 'indigo'
  },
  {
    name: 'Unlimited',
    price: '$100',
    period: '/month',
    description: 'Maximum potential',
    features: [
      { name: 'Unlimited Live Minutes*', included: true },
      { name: 'VIP Community Access', included: true },
      { name: '1-on-1 Coaching', included: true },
      { name: 'Daily Group Calls', included: true },
      { name: 'All Courses + Certs', included: true },
    ],
    cta: 'Contact Sales',
    popular: false,
    color: 'rose'
  }
];

export function PlansPage() {
  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen font-sans">
      <div className="container mx-auto px-6">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple Plans for <span className="text-amber-600">Big Dreams</span>
          </h1>
          <p className="text-xl text-gray-600">
            Choose the plan that fits your learning journey. Upgrade or cancel anytime.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={`relative bg-white rounded-3xl p-8 border hover:shadow-xl transition-all duration-300 flex flex-col
                ${plan.popular ? 'border-amber-500 shadow-lg scale-105 z-10' : 'border-gray-200 shadow-sm'}
              `}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className={`text-xl font-bold mb-2 text-${plan.color === 'gray' ? 'gray-900' : plan.color + '-600'}`}>
                  {plan.name}
                </h3>
                <p className="text-gray-500 text-sm mb-6">{plan.description}</p>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 ml-1">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    {feature.included ? (
                      <div className={`mt-0.5 w-5 h-5 rounded-full bg-${plan.color === 'gray' ? 'green' : plan.color}-100 flex items-center justify-center flex-shrink-0`}>
                        <Check className={`w-3 h-3 text-${plan.color === 'gray' ? 'green' : plan.color}-600`} />
                      </div>
                    ) : (
                      <div className="mt-0.5 w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                        <X className="w-3 h-3 text-gray-300" />
                      </div>
                    )}
                    <span className={`text-sm ${feature.included ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-3.5 rounded-xl font-bold transition-all
                ${plan.popular 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-lg hover:shadow-amber-500/25' 
                  : 'bg-gray-900 text-white hover:bg-gray-800'}
              `}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Trust/FAQ Section Snippet */}
        <div className="mt-20 text-center">
            <p className="text-gray-500 text-sm">
                *Unlimited plans are subject to reasonable use policy. Need a custom team plan? 
                <Link href="/contact" className="text-amber-600 font-bold ml-1 hover:underline">Contact us</Link>
            </p>
        </div>

      </div>
    </div>
  );
}
