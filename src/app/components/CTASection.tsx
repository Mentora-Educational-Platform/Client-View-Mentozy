import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CTASection() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="relative bg-amber-50 rounded-3xl overflow-hidden px-6 py-20 md:px-20 md:py-24 text-center border border-amber-100 shadow-xl shadow-amber-100/50">

          {/* Background Gradients */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-200/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/60 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-amber-200 text-amber-600 text-xs font-bold uppercase tracking-wider mb-8 shadow-sm">
              Start your journey
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
              Ready to accelerate your <br className="hidden md:block" />
              <span className="text-amber-600">career growth?</span>
            </h2>

            <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              Join 50,000+ learners who are mastering new skills, getting hired, and advancing their careers with Mentozy.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                to="/signup"
                className="w-full sm:w-auto px-8 py-4 bg-amber-600 text-white rounded-xl font-bold text-lg hover:bg-amber-700 transition-all hover:scale-105 shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2"
              >
                Get Started for Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/tracks"
                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-lg hover:border-amber-200 hover:text-amber-700 hover:bg-amber-50/50 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                View Learning Tracks
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-gray-500 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600" /> No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600" /> 7-day free trial
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600" /> Cancel anytime
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}