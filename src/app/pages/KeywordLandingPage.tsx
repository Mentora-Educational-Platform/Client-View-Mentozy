import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface KeywordLandingPageProps {
    keyword: string;
    title: string;
    description: string;
    benefits?: string[];
}

export function KeywordLandingPage({ keyword, title, description, benefits }: KeywordLandingPageProps) {
    return (
        <div className="bg-white">
            {/* Hero Section for the Keyword */}
            <section className="relative py-20 overflow-hidden bg-gradient-to-b from-amber-50 to-white">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
                            {title}
                        </h1>
                        <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                            {description}
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                to="/signup"
                                className="w-full sm:w-auto px-8 py-4 bg-amber-600 text-white rounded-xl font-bold text-lg hover:bg-amber-700 transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                Find Your Mentor <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                to="/mentors"
                                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-lg hover:border-amber-200 transition-all flex items-center justify-center gap-2 shadow-sm"
                            >
                                Browse Mentors
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-20 border-t border-gray-100">
                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 tracking-tight">
                                Why choose Mentozy for {keyword}?
                            </h2>
                            <div className="space-y-6">
                                {(benefits || [
                                    'Access to TOP-tier professionals from top companies.',
                                    'Personalized 1-on-1 guidance tailored to your goals.',
                                    'Flexible scheduling and affordable pricing.',
                                    'Verified mentors with proven track records.'
                                ]).map((benefit, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="flex-shrink-0 w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                                            <CheckCircle2 className="w-4 h-4 text-amber-600" />
                                        </div>
                                        <p className="text-gray-600 leading-relaxed">
                                            {benefit}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-amber-50 rounded-3xl p-12 border border-amber-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Master your craft</h3>
                                <p className="text-gray-600 mb-8">
                                    Whether you are looking for {keyword} or general career growth, our mentors are here to help you navigate your journey.
                                </p>
                                <Link
                                    to="/signup"
                                    className="inline-flex items-center gap-2 text-amber-600 font-bold hover:text-amber-700 transition-colors"
                                >
                                    Start your journey today <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
