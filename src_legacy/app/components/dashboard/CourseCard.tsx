
import { PlayCircle, Clock } from 'lucide-react';

interface CourseCardProps {
    title: string;
    progress: number;
    totalLessons: number;
    completedLessons: number;
    image: string;
    category: string;
}

export function CourseCard({ title, progress, totalLessons, completedLessons, image, category }: CourseCardProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
            <div className="h-32 bg-gray-200 relative overflow-hidden">
                <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-bold text-gray-800">
                    {category}
                </div>
            </div>
            <div className="p-5">
                <h4 className="font-bold text-gray-900 mb-2 line-clamp-1">{title}</h4>
                <div className="flex items-center text-xs text-gray-500 mb-4 gap-3">
                    <span className="flex items-center gap-1"><PlayCircle className="w-3 h-3" /> {totalLessons} Lessons</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 2h 30m</span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                        <span className="text-gray-600">{progress}% Complete</span>
                        <span className="text-gray-400">{completedLessons}/{totalLessons}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-amber-500 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <button className="w-full mt-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors">
                    Continue Learning
                </button>
            </div>
        </div>
    );
}
