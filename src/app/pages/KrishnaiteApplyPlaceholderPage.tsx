import { Sparkles, ArrowLeft, Clock, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export function KrishnaiteApplyPlaceholderPage() {
  return (
    <div className="bg-[#FAF9F6] text-gray-900 font-mono min-h-screen pt-32 pb-20 flex items-center justify-center px-4">
      <div className="max-w-xl w-full bg-white border-4 border-gray-900 p-8 sm:p-12 shadow-[8px_8px_0px_rgba(0,0,0,1)] text-center space-y-6">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 border-2 border-gray-900 bg-[#eff3ff] text-gray-900 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,1)]">
          <Sparkles className="w-4 h-4 text-indigo-700" />
          KRISHNAITE ACADEMY
        </div>

        <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-gray-900">
          18-DAY AI COURSE APPLICATION
        </h1>

        <div className="p-4 bg-amber-100 border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] space-y-1 text-left">
          <p className="font-black text-xs uppercase text-gray-900 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-700" />
            SCHOLARSHIP SELECTION • COMING SOON
          </p>
          <p className="text-xs font-bold text-gray-700">
            The application form for the 18-Day AI Course and scholarship selection will open shortly.
          </p>
        </div>

        <p className="text-xs sm:text-sm font-bold text-gray-600 leading-relaxed">
          ₹10,000 Course Value • 100% scholarship for the first 40 AIvantage Quiz winners, with up to 75% scholarships for eligible applicants.
        </p>

        <div className="pt-4">
          <Link
            to="/academy"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#FAF9F6] hover:bg-gray-100 border-2 border-gray-900 font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK TO COURSE OVERVIEW
          </Link>
        </div>

      </div>
    </div>
  );
}

export default KrishnaiteApplyPlaceholderPage;
