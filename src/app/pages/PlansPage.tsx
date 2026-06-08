import { useState, useEffect, useRef } from 'react';
import { Check, X, CreditCard, Sparkles, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    Razorpay: any;
  }
}

function RazorpayPaymentButton({ buttonId, planName, isPopular, color }: { buttonId: string; planName: string; isPopular?: boolean; color: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const injected = useRef(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const form = formRef.current;
    if (!form || injected.current) return;
    injected.current = true;

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
    script.setAttribute('data-payment_button_id', buttonId);
    script.async = true;
    
    script.onload = () => {
      setTimeout(() => setIsLoading(false), 500);
    };
    
    form.appendChild(script);

    return () => {
      injected.current = false;
      if (form.contains(script)) form.removeChild(script);
    };
  }, [buttonId]);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className={`relative w-full py-4 px-6 border-4 border-gray-900 font-black text-gray-900 text-sm uppercase shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer flex items-center justify-center gap-3 transition-all ${isPopular ? 'bg-[#f39c12]' : 'bg-[#eff3ff]'}`}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            {isPopular ? (
              <Sparkles className="w-5 h-5" />
            ) : (
              <CreditCard className="w-5 h-5" />
            )}
            <span>Subscribe to {planName}</span>
          </>
        )}
      </div>
      
      <form 
        ref={formRef} 
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer [&_.razorpay-payment-button]:!w-full [&_.razorpay-payment-button]:!h-full [&_.razorpay-payment-button]:!opacity-0"
      />
    </div>
  );
}

const studentPlans = [
  {
    name: 'Starter',
    price: '$0',
    amountINR: 0,
    period: '/month',
    description: 'Everything you need to join the global tech conversation.',
    features: [
      { name: 'Access to Mentozy Open Library', included: true },
      { name: 'Join Public Community Forums', included: true },
      { name: 'View Elite Mentor Profiles', included: true },
      { name: 'Book 1-on-1 Sessions (Standard Rate)', included: true },
      { name: 'General Hackathon Updates', included: true },
    ],
    cta: 'Get Started',
    razorpayButtonId: null,
    popular: false,
    color: 'gray'
  },
  {
    name: 'Premium',
    price: '$30',
    amountINR: 2499,
    period: '/month',
    description: 'Accelerate your growth with priority access and exclusive feedback.',
    features: [
      { name: 'Priority Booking (48-Hour Head Start on Mentor Calendars)', included: true },
      { name: '10% Off All 1-on-1 Mentor Sessions', included: true },
      { name: '1x Asynchronous Resume/Code Review', included: true },
      { name: 'Access to 1 Live Group Masterclass/Month', included: true },
    ],
    cta: 'Subscribe Now',
    razorpayButtonId: 'pl_Sc2vq7uLAFgdgR',
    popular: true,
    color: 'amber'
  },
  {
    name: 'Ultra',
    price: '$60',
    amountINR: 4999,
    period: '/month',
    description: 'The VIP pipeline. Maximum access to top-tier engineers and referrals.',
    features: [
      { name: 'Exclusive Access to the FAANG Opportunity & Referral Board', included: true },
      { name: 'First-In-Line Booking (72-Hour Head Start)', included: true },
      { name: '20% Off All 1-on-1 Mentor Sessions', included: true },
      { name: 'Unlimited Live Group Masterclass Access', included: true },
      { name: 'Fast-Track Priority for Mentozy Hackathons', included: true },
    ],
    cta: 'Go Ultra',
    razorpayButtonId: 'pl_Sc31AvlmcIzvnD',
    popular: false,
    color: 'indigo'
  }
];

const teacherPlans = [
  {
    name: 'Elite Individual',
    price: '$0',
    amountINR: 0,
    period: '/month',
    description: 'Zero upfront cost. Perfect for elite solo mentors and industry executives.',
    features: [
      { name: '1 Individual Mentor Dashboard', included: true },
      { name: '8% Commission on Sessions & Courses', included: true },
      { name: 'Global Calendar Syncing', included: true },
      { name: 'Automated Payment Processing', included: true },
      { name: 'Standard Search Visibility', included: true },
    ],
    cta: 'Get Started',
    razorpayButtonId: null,
    popular: false,
    color: 'gray'
  },
  {
    name: 'Premium Squad',
    price: '$50',
    amountINR: 4199,
    period: '/month',
    description: 'Manage your entire coaching team under one unified platform.',
    features: [
      { name: '5 Staff Dashboards', included: true },
      { name: '8% Commission on Sessions & Courses', included: true },
      { name: 'Centralized Agency Payouts', included: true },
      { name: 'Team Scheduling & unified Calendar', included: true },
      { name: 'Basic Revenue Analytics', included: true },
    ],
    cta: 'Subscribe Now',
    razorpayButtonId: 'pl_Sc337IXZpGrRXs',
    popular: true,
    color: 'amber'
  },
  {
    name: 'Ultra Agency',
    price: '$95',
    amountINR: 7999,
    period: '/month',
    description: 'Scale your academy with priority student visibility and advanced tools.',
    features: [
      { name: '8 Staff Dashboards', included: true },
      { name: '8% Commission on Sessions & Courses', included: true },
      { name: 'Priority Algorithmic Placement', included: true },
      { name: 'Advanced Agency Revenue Analytics', included: true },
      { name: 'Everything in Premium Squad', included: true },
    ],
    cta: 'Go Ultra',
    razorpayButtonId: 'pl_Sc34BV76MHTPsg',
    popular: false,
    color: 'indigo'
  },
  {
    name: 'Enterprise',
    price: '$150',
    amountINR: null,
    period: '/month',
    description: 'Maximum infrastructure for large educational institutions and bootcamps.',
    features: [
      { name: '12 Staff Dashboards', included: true },
      { name: '8% Commission on Sessions & Courses', included: true },
      { name: 'Dedicated Mentozy Account Manager', included: true },
      { name: 'Custom Agency Onboarding Support', included: true },
      { name: 'Everything in Ultra Agency', included: true },
    ],
    cta: 'Contact Sales',
    razorpayButtonId: null,
    popular: false,
    color: 'rose'
  }
];

type Plan = (typeof studentPlans)[number] | (typeof teacherPlans)[number];

export function PlansPage() {
  const [planType, setPlanType] = useState<'student' | 'teacher'>('student');
  const navigate = useNavigate();
  const activePlans = planType === 'student' ? studentPlans : teacherPlans;

  const handlePlanClick = (plan: Plan) => {
    if (plan.cta === 'Contact Sales') {
      navigate('/contact');
      return;
    }
    if (plan.amountINR === 0) {
      navigate('/signup');
      return;
    }
  };

  return (
    <div className="pt-32 pb-20 bg-[#FAF9F6] min-h-screen font-mono">
      <div className="container mx-auto px-6">

        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 uppercase tracking-tight leading-none">
            Simple Plans for <span className="bg-[#f39c12] border-4 border-gray-900 px-2 py-1 rotate-1 inline-block">Big Dreams</span>
          </h1>
          <p className="text-base md:text-lg text-gray-700 font-bold uppercase leading-relaxed max-w-xl mx-auto">
            Choose the plan that fits your learning journey. Upgrade or cancel anytime.
          </p>
        </div>

        {/* Toggle Student / Teacher */}
        <div className="flex justify-center mb-16">
          <div className="bg-white p-2 border-4 border-gray-900 inline-flex shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <button
              onClick={() => setPlanType('student')}
              className={`px-8 py-3 text-xs font-black uppercase tracking-wider transition-all border-2 ${planType === 'student'
                ? 'bg-[#f39c12] border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] text-gray-900'
                : 'text-gray-900 border-transparent hover:bg-gray-100'
                }`}
            >
              For Students
            </button>
            <button
              onClick={() => setPlanType('teacher')}
              className={`px-8 py-3 text-xs font-black uppercase tracking-wider transition-all border-2 ${planType === 'teacher'
                ? 'bg-[#f39c12] border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] text-gray-900'
                : 'text-gray-900 border-transparent hover:bg-gray-100'
                }`}
            >
              For Teachers
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className={`grid md:grid-cols-2 ${activePlans.length === 3 ? 'lg:grid-cols-3 max-w-6xl' : 'lg:grid-cols-4 max-w-7xl'} gap-8 mx-auto`}>
          {activePlans.map((plan) => {
            const getColorClasses = () => {
              if (plan.color === 'amber') return { bg: 'bg-[#FAF9F6]', text: 'text-gray-900', border: 'border-gray-900', check: 'bg-[#f39c12]' };
              if (plan.color === 'indigo') return { bg: 'bg-[#eff3ff]', text: 'text-gray-900', border: 'border-gray-900', check: 'bg-[#f39c12]' };
              if (plan.color === 'rose') return { bg: 'bg-white', text: 'text-gray-900', border: 'border-gray-900', check: 'bg-[#f39c12]' };
              return { bg: 'bg-white', text: 'text-gray-900', border: 'border-gray-900', check: 'bg-[#eff3ff]' };
            };
            const colors = getColorClasses();

            return (
              <div
                key={plan.name}
                className={`group relative p-8 border-4 border-gray-900 flex flex-col transition-all duration-300 ${colors.bg} ${plan.popular ? 'shadow-[8px_8px_0px_rgba(0,0,0,1)] translate-y-[-4px]' : 'shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#f39c12] border-4 border-gray-900 text-gray-900 text-[10px] font-black px-4 py-1.5 uppercase tracking-wider shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Most Popular
                  </div>
                )}

                <div className="relative mb-8">
                  <div className="w-12 h-12 border-4 border-gray-900 bg-white flex items-center justify-center mb-4 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    {plan.color === 'gray' && <span className="text-sm font-black">S</span>}
                    {plan.color === 'amber' && <Sparkles className="w-5 h-5 text-gray-900" />}
                    {plan.color === 'indigo' && <CreditCard className="w-5 h-5 text-gray-900" />}
                    {plan.color === 'rose' && <span className="text-sm font-black">E</span>}
                  </div>

                  <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase">
                    {plan.name}
                  </h3>
                  <p className="text-gray-700 text-xs font-bold uppercase leading-relaxed mb-6">{plan.description}</p>
                  
                  <div className="mt-6 pb-6 border-b-4 border-gray-900">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-gray-900 tracking-tight uppercase">{plan.price}</span>
                      <span className="text-gray-500 font-bold uppercase text-xs">{plan.period}</span>
                    </div>
                    {plan.amountINR ? (
                      <p className="text-xs text-gray-700 mt-2 font-black uppercase">
                        <span className="inline-flex items-center gap-1 bg-white border-2 border-gray-900 px-2 py-0.5">
                          ₹{plan.amountINR.toLocaleString('en-IN')} INR
                        </span>
                      </p>
                    ) : null}
                  </div>
                </div>

                <ul className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      {feature.included ? (
                        <div className={`mt-0.5 w-5 h-5 border-2 border-gray-900 ${colors.check} flex items-center justify-center flex-shrink-0`}>
                          <Check className="w-3 h-3 text-gray-900 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="mt-0.5 w-5 h-5 border-2 border-gray-300 flex items-center justify-center flex-shrink-0">
                          <X className="w-3 h-3 text-gray-300" />
                        </div>
                      )}
                      <span className={`text-xs font-bold uppercase leading-relaxed ${feature.included ? 'text-gray-900' : 'text-gray-400'}`}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                {plan.razorpayButtonId ? (
                  <RazorpayPaymentButton 
                    buttonId={plan.razorpayButtonId} 
                    planName={plan.name}
                    isPopular={plan.popular}
                    color={plan.color}
                  />
                ) : (
                  <button
                    onClick={() => handlePlanClick(plan)}
                    className={`relative w-full py-4 px-6 border-4 border-gray-900 font-black text-sm uppercase shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all ${plan.popular ? 'bg-[#f39c12] text-gray-900 hover:bg-[#e08e0b]' : 'bg-[#eff3ff] text-gray-900 hover:bg-[#dbe4ff]'}`}
                  >
                    <span>{plan.cta}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Trust note */}
        <div className="mt-20 text-center space-y-2">
          <p className="text-gray-900 text-xs font-black uppercase">🔒 Secure payments powered by Razorpay</p>
          <p className="text-gray-700 text-xs font-bold uppercase max-w-xl mx-auto leading-relaxed">
            *Unlimited plans are subject to reasonable use policy. Need a custom team plan?{' '}
            <Link to="/contact" className="text-[#f39c12] font-black underline decoration-2 decoration-gray-900">Contact us</Link>
          </p>
        </div>

      </div>
    </div>
  );
}
