import { Check, X, Minus } from 'lucide-react';

export function WhatWeDoDifferently() {
  const principles = [
    'Mentorship over mass content',
    'Quality guidance over quantity of courses',
    'Real outcomes over completion certificates',
    'Human connection over algorithms'
  ];

  const comparisons = [
    {
      aspect: 'Focus',
      typical: 'Course completion',
      mentozy: 'Learning outcomes'
    },
    {
      aspect: 'Support',
      typical: 'Q&A forums',
      mentozy: 'Direct mentor access'
    },
    {
      aspect: 'Content',
      typical: 'Pre-recorded lectures',
      mentozy: 'Guided learning paths'
    },
    {
      aspect: 'Goals',
      typical: 'Sell more courses',
      mentozy: 'Long-term growth'
    }
  ];

  return (
    <section className="py-24 bg-white relative">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="text-amber-600 font-semibold tracking-wider text-sm uppercase mb-3 block">
              Our Approach
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Why Mentozy is different
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We believe in a learning model that prioritizes your growth, not just your subscription.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-start">
            {/* Left: Principles List */}
            <div className="lg:col-span-5 space-y-8 pt-4">
              <h3 className="text-2xl font-bold text-gray-900">
                Core principles we stand by
              </h3>
              <div className="space-y-6">
                {principles.map((principle, index) => (
                  <div key={index} className="flex items-start gap-4 group">
                    <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-amber-100 transition-colors">
                      <Check className="w-4 h-4 text-amber-600" />
                    </div>
                    <p className="text-lg text-gray-700 font-medium pt-1">
                      {principle}
                    </p>
                  </div>
                ))}
              </div>
              
<div className="pt-10">
  <div className="relative p-6 md:p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 shadow-sm">

    {/* Decorative quote mark */}
    <span className="absolute -top-4 -left-4 text-5xl text-gray-200 select-none">
      “
    </span>

    <p className="text-gray-700 italic leading-relaxed text-base md:text-lg">
      Education is not just about consuming content,
      <span className="text-gray-900 font-medium">
        {" "}it’s about connecting with those who have walked the path before you.
      </span>
    </p>

    {/* Philosophy Marker */}
    <p className="mt-3 text-sm text-gray-500">— Mentozy Philosophy</p>

  </div>
</div>

            </div>

            {/* Right: Comparison Card */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-2 border-b border-gray-100">
                  <div className="p-6 text-center bg-gray-50/50 border-r border-gray-100">
                    <p className="font-semibold text-gray-500 uppercase tracking-wide text-xs">Typical Platforms</p>
                  </div>
                  <div className="p-6 text-center bg-amber-50/30">
                    <p className="font-bold text-amber-700 uppercase tracking-wide text-xs">Mentozy Experience</p>
                  </div>
                </div>

                {/* Comparison Rows */}
                <div className="divide-y divide-gray-100">
                  {comparisons.map((item, index) => (
                    <div key={index} className="grid grid-cols-2 group hover:bg-gray-50/30 transition-colors">
                      {/* Typical Side */}
                      <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-3 border-r border-gray-100">
                        <X className="w-5 h-5 text-gray-400 shrink-0" />
                        <span className="text-gray-500 text-sm sm:text-base line-through decoration-gray-300">
                          {item.typical}
                        </span>
                      </div>
                      
                      {/* Mentozy Side */}
                      <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-3 bg-amber-50/10 relative">
                        {/* Hover Highlight */}
                        <div className="absolute inset-0 bg-amber-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        <Check className="w-5 h-5 text-amber-600 shrink-0 relative z-10" />
                        <span className="text-gray-900 font-semibold text-sm sm:text-base relative z-10">
                          {item.mentozy}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}