import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { getCourseDataForStudent, updateEnrollmentProgress } from '../../lib/api';
import { LayoutList, PlayCircle, FileText, HelpCircle, CheckCircle2, ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

export function CourseViewerPage() {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [course, setCourse] = useState<any>(null);
    const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
    const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
    const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
    const [readPdfs, setReadPdfs] = useState<Record<string, boolean>>({});
    const [completedLessons, setCompletedLessons] = useState<string[]>([]);

    const handleQuizSelect = (quizId: string, selectedValue: string) => {
        if (!quizAnswers[quizId]) {
            setQuizAnswers(prev => ({ ...prev, [quizId]: selectedValue }));
        }
    };

    useEffect(() => {
        async function fetchCourse() {
            if (!courseId) return;
            setLoading(true);
            const data = await getCourseDataForStudent(parseInt(courseId));

            if (data) {
                setCourse(data);
                // Set default active items if available
                if (data.track_modules && data.track_modules.length > 0) {
                    const firstModule = data.track_modules[0];
                    setActiveModuleId(firstModule.id || firstModule.content?.id);

                    const firstLessons = (firstModule.lessons?.length ? firstModule.lessons : firstModule.content?.lessons) || [];
                    if (firstLessons.length > 0) {
                        setActiveLessonId(firstLessons[0].id?.toString());
                    }
                }
            } else {
                toast.error("Course not found or unable to load.");
            }
            setLoading(false);
        }
        fetchCourse();
    }, [courseId]);

    // Find current active content data
    let activeModule = null;
    let activeLesson = null;

    if (course?.track_modules && activeModuleId) {
        activeModule = course.track_modules.find((m: any) => m.id?.toString() === activeModuleId || m.content?.id?.toString() === activeModuleId);

        if (activeModule) {
            let possibleLessons = [];
            if (activeModule.lessons && Array.isArray(activeModule.lessons) && activeModule.lessons.length > 0) {
                possibleLessons = activeModule.lessons;
            } else if (activeModule.content?.lessons && Array.isArray(activeModule.content.lessons)) {
                possibleLessons = activeModule.content.lessons;
            }

            if (activeLessonId) {
                activeLesson = possibleLessons.find((l: any) => l.id?.toString() === activeLessonId);
            }
        }
    }

    const activeLessonIdentifier = activeLesson?.id?.toString() || activeLesson?.title;

    // Check for pdf read and quiz completeness for the active lesson
    const isLessonCompletable = () => {
        if (!activeLesson) return false;
        let completable = true;

        // Check PDF
        const pdfUrl = activeLesson.worksheetUrl || activeLesson.pdf_url;
        const isPdf = typeof pdfUrl === 'string' && pdfUrl.toLowerCase().includes('.pdf');
        if (isPdf && !readPdfs[activeLessonIdentifier]) {
            completable = false;
        }

        // Check Quizzes
        const quizzes = activeLesson.quiz || activeLesson.quizzes || [];
        if (Array.isArray(quizzes) && quizzes.length > 0) {
            const allCorrect = quizzes.every((quiz: any, idx: number) => {
                const answer = quiz.answer || quiz.correctAnswer;
                const selected = quizAnswers[quiz.id || idx];
                return selected === answer;
            });
            if (!allCorrect) completable = false;
        }

        return completable;
    };

    // Check if entire course is completed
    const allLessonIds = useMemo(() => {
        if (!course?.track_modules || !Array.isArray(course.track_modules)) return [];

        return course.track_modules.flatMap((m: any) => {
            let lessons: any[] = [];
            if (m.lessons && Array.isArray(m.lessons)) {
                lessons = m.lessons;
            } else if (m.content?.lessons && Array.isArray(m.content.lessons)) {
                lessons = m.content.lessons;
            }
            return lessons.map((l: any) => l.id?.toString() || l.title);
        });
    }, [course]);

    // Auto-complete lesson when conditions are met
    useEffect(() => {
        if (activeLessonIdentifier && isLessonCompletable() && !completedLessons.includes(activeLessonIdentifier)) {
            setCompletedLessons(prev => {
                const newCompleted = [...prev, activeLessonIdentifier];
                // Record progress in database
                if (allLessonIds.length > 0 && user && courseId) {
                    const progress = (newCompleted.length / allLessonIds.length) * 100;
                    updateEnrollmentProgress(user.id, parseInt(courseId), progress);
                }
                return newCompleted;
            });
        }
    }, [activeLessonIdentifier, readPdfs, quizAnswers, completedLessons, allLessonIds, user, courseId]);

    const isCourseCompleted = allLessonIds.length > 0 && allLessonIds.every((id: string) => completedLessons.includes(id));

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Loading course content...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (!course) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-2">
                        <HelpCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Course Not Found</h2>
                    <p className="text-gray-500 max-w-md">We couldn't load this course. It might have been removed or you don't have access.</p>
                    <button
                        onClick={() => navigate('/tracks')}
                        className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
                    >
                        Back to Browsing
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    // Helper to get embeddable YouTube URL
    const getEmbedUrl = (url: string) => {
        if (!url) return '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        const videoId = (match && match[2].length === 11) ? match[2] : null;
        return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    };

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/student-dashboard')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
                    <p className="text-sm text-gray-500">{course.level}</p>
                </div>
                {isCourseCompleted && (
                    <div className="hidden sm:flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl border border-green-200 shadow-sm animate-in fade-in zoom-in duration-300">
                        <Trophy className="w-5 h-5 text-green-600" />
                        <span className="font-bold text-sm">Course Completed!</span>
                    </div>
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-180px)] min-h-[600px]">

                {/* Main Content Area (Video/PDF/Quiz) */}
                <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col relative w-full lg:w-2/3 xl:w-3/4">
                    {activeLesson ? (
                        <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col gap-8">
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 mb-2">{activeLesson.title}</h2>
                                <p className="text-gray-600 leading-relaxed text-lg">{activeLesson.explanation}</p>
                            </div>

                            {/* Video Player */}
                            {activeLesson.videoLink && (
                                <div className="w-full bg-gray-900 rounded-2xl overflow-hidden aspect-video shadow-lg">
                                    <iframe
                                        src={getEmbedUrl(activeLesson.videoLink)}
                                        title={activeLesson.title}
                                        className="w-full h-full border-0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            )}

                            {/* Worksheet / PDF */}
                            {(activeLesson.worksheetUrl || activeLesson.pdf_url) && (() => {
                                const pdfUrl = activeLesson.worksheetUrl || activeLesson.pdf_url;
                                return (
                                    <div className="space-y-4">
                                        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-indigo-900 mb-1">Lesson Worksheet</h3>
                                                    <p className="text-sm text-indigo-700">{activeLesson.worksheetName || 'Download attached materials for this lesson'}</p>
                                                </div>
                                            </div>
                                            <a
                                                href={pdfUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download={activeLesson.worksheetName || 'Document'}
                                                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 whitespace-nowrap"
                                            >
                                                Download Document
                                            </a>
                                        </div>

                                        <div className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl shadow-sm mt-4 transition-all hover:bg-gray-50">
                                            <div className="relative flex items-start">
                                                <div className="flex h-6 items-center">
                                                    <input
                                                        id={`read-doc-${activeLessonIdentifier}`}
                                                        name={`read-doc-${activeLessonIdentifier}`}
                                                        type="checkbox"
                                                        checked={!!readPdfs[activeLessonIdentifier]}
                                                        onChange={(e) => setReadPdfs(prev => ({ ...prev, [activeLessonIdentifier]: e.target.checked }))}
                                                        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer transition-all"
                                                    />
                                                </div>
                                                <div className="ml-3 text-sm leading-6">
                                                    <label htmlFor={`read-doc-${activeLessonIdentifier}`} className="font-medium text-gray-900 cursor-pointer select-none">
                                                        I have read and understood this document
                                                    </label>
                                                    <p className="text-gray-500 text-xs mt-0.5">Required to complete this lesson.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Quizzes */}
                            {(() => {
                                const quizzesToRender = activeLesson.quiz || activeLesson.quizzes || [];
                                if (!Array.isArray(quizzesToRender) || quizzesToRender.length === 0) return null;

                                return (
                                    <div className="mt-8 space-y-6">
                                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                            <HelpCircle className="w-6 h-6 text-amber-500" />
                                            Knowledge Check
                                        </h3>

                                        {quizzesToRender.map((quiz: any, idx: number) => {
                                            const quizAnswer = quiz.answer || quiz.correctAnswer;
                                            const quizType = quiz.type?.toLowerCase() || 'mcq'; // fallback to mcq
                                            const isAnswered = !!quizAnswers[quiz.id || idx];
                                            const selectedValue = quizAnswers[quiz.id || idx];
                                            const isCorrect = isAnswered && selectedValue === quizAnswer;

                                            return (
                                                <div key={quiz.id || idx} className="bg-white border text-left border-gray-200 rounded-2xl p-6 shadow-sm">
                                                    <div className="flex gap-3 mb-4">
                                                        <div className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                                            {idx + 1}
                                                        </div>
                                                        <p className="font-medium text-gray-900 text-lg mt-0.5">{quiz.question}</p>
                                                    </div>

                                                    {/* Interactive MCQ */}
                                                    {quizType === 'mcq' && Array.isArray(quiz.options) && (
                                                        <div className="space-y-3 pl-11">
                                                            {quiz.options.map((opt: any, i: number) => {
                                                                const optValue = typeof opt === 'string' ? opt : opt.id;
                                                                const optLabel = typeof opt === 'string' ? opt : opt.text;
                                                                const isThisSelected = selectedValue === optValue;
                                                                const isThisCorrectOption = optValue === quizAnswer;

                                                                let btnClass = "border-gray-100 hover:border-gray-200";
                                                                if (isAnswered) {
                                                                    if (isThisCorrectOption) {
                                                                        btnClass = "border-green-500 bg-green-50";
                                                                    } else if (isThisSelected) {
                                                                        btnClass = "border-red-500 bg-red-50";
                                                                    }
                                                                }

                                                                return (
                                                                    <div
                                                                        key={i}
                                                                        onClick={() => handleQuizSelect(quiz.id || idx, optValue)}
                                                                        className={`p-4 rounded-xl border-2 transition-all select-none 
                                                                    ${isAnswered ? 'cursor-default' : 'cursor-pointer'} ${btnClass}
                                                                `}
                                                                    >
                                                                        <div className="flex items-center justify-between">
                                                                            <span className={isThisCorrectOption && isAnswered ? 'text-green-800 font-medium' : 'text-gray-700'}>
                                                                                {optLabel}
                                                                            </span>
                                                                            {isThisCorrectOption && isAnswered && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    {/* Interactive True/False */}
                                                    {(quizType === 'true/false' || quizType === 'tf') && (
                                                        <div className="flex gap-4 pl-11">
                                                            {['True', 'False'].map(opt => {
                                                                const isThisSelected = selectedValue === opt;
                                                                const isThisCorrectOption = opt.toLowerCase() === quizAnswer?.toLowerCase();

                                                                let btnClass = "border-gray-100 text-gray-500 hover:border-gray-200";
                                                                if (isAnswered) {
                                                                    if (isThisCorrectOption) {
                                                                        btnClass = "border-green-500 bg-green-50 text-green-700 font-bold";
                                                                    } else if (isThisSelected) {
                                                                        btnClass = "border-red-500 bg-red-50 text-red-700 font-bold";
                                                                    }
                                                                }

                                                                return (
                                                                    <div
                                                                        key={opt}
                                                                        onClick={() => handleQuizSelect(quiz.id || idx, opt)}
                                                                        className={`flex-1 p-4 rounded-xl border-2 text-center transition-all
                                                                    ${isAnswered ? 'cursor-default' : 'cursor-pointer'} ${btnClass}
                                                                `}
                                                                    >
                                                                        {opt}
                                                                        {isThisCorrectOption && isAnswered && ' ✓'}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    {/* Feedback & Explanation */}
                                                    {isAnswered && (
                                                        <div className="mt-4 pl-11 animate-in fade-in slide-in-from-top-2">
                                                            {!isCorrect ? (
                                                                <div className="text-red-500 font-bold mb-3 text-sm">
                                                                    {quiz.customMessage || "och! that hurts, try again 😙"}
                                                                </div>
                                                            ) : (
                                                                <div className="text-green-600 font-bold mb-3 text-sm flex items-center gap-1">
                                                                    <CheckCircle2 className="w-4 h-4" /> That's correct!
                                                                </div>
                                                            )}

                                                            {quiz.explanation && (
                                                                <div className="text-sm bg-gray-50 border border-gray-100 p-4 rounded-xl text-gray-600">
                                                                    <span className="font-bold text-gray-900 block mb-1">Explanation:</span>
                                                                    {quiz.explanation}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                );
                            })()}

                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 text-center">
                            <LayoutList className="w-16 h-16 text-gray-200 mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Select a lesson to begin</h3>
                            <p>Choose a module and lesson from the sidebar curriculum to start learning.</p>
                        </div>
                    )}
                </div>

                {/* Sidebar Curriculum */}
                <div className="w-full lg:w-1/3 xl:w-1/4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="font-bold text-gray-900">Course Curriculum</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {course.track_modules && course.track_modules.length > 0 ? (
                            course.track_modules.map((module: any, mIdx: number) => {
                                const modId = module.id?.toString() || module.content?.id?.toString();
                                const isActiveModule = activeModuleId === modId;

                                let moduleLessons: any[] = [];
                                if (module.lessons && Array.isArray(module.lessons)) {
                                    moduleLessons = module.lessons;
                                } else if (module.content?.lessons && Array.isArray(module.content.lessons)) {
                                    moduleLessons = module.content.lessons;
                                }
                                const hasLessons = moduleLessons.length > 0;

                                return (
                                    <div key={modId || mIdx} className="bg-white border text-left border-gray-200 rounded-2xl overflow-hidden transition-all">
                                        {/* Module Header */}
                                        <button
                                            onClick={() => setActiveModuleId(isActiveModule ? null : modId)}
                                            className={`w-full p-4 flex items-center justify-between text-left transition-colors
                                                ${isActiveModule ? 'bg-indigo-50/50' : 'hover:bg-gray-50'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors
                                                    ${isActiveModule ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}
                                                >
                                                    {mIdx + 1}
                                                </div>
                                                <div>
                                                    <h3 className={`font-bold pr-2 ${isActiveModule ? 'text-indigo-900' : 'text-gray-900'}`}>
                                                        {module.title || module.content?.title || 'Untitled Module'}
                                                    </h3>
                                                </div>
                                            </div>
                                            <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${isActiveModule ? 'rotate-90 text-indigo-500' : 'text-gray-400'}`} />
                                        </button>

                                        {/* Lessons List */}
                                        {isActiveModule && (
                                            <div className="bg-gray-50 border-t border-gray-100 py-2">
                                                {hasLessons ? (
                                                    moduleLessons.map((lesson: any, lIdx: number) => {
                                                        const isLessonActive = activeLessonId === lesson.id?.toString();
                                                        return (
                                                            <button
                                                                key={lesson.id || lIdx}
                                                                onClick={() => setActiveLessonId(lesson.id)}
                                                                className={`w-full px-5 py-3 flex items-center gap-3 text-left transition-colors relative
                                                                    ${isLessonActive ? 'bg-indigo-100/50' : 'hover:bg-gray-100'}
                                                                `}
                                                            >
                                                                {isLessonActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600"></div>}

                                                                {lesson.videoLink ? (
                                                                    <PlayCircle className={`w-5 h-5 flex-shrink-0 ${isLessonActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                                                                ) : lesson.worksheetUrl ? (
                                                                    <FileText className={`w-5 h-5 flex-shrink-0 ${isLessonActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                                                                ) : (
                                                                    <LayoutList className={`w-5 h-5 flex-shrink-0 ${isLessonActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                                                                )}

                                                                <span className={`text-sm pr-2 ${isLessonActive ? 'font-bold text-indigo-900' : 'font-medium text-gray-600'}`}>
                                                                    {lesson.title || `Lesson ${lIdx + 1}`}
                                                                </span>
                                                            </button>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="p-4 text-sm text-gray-500 text-center italic">
                                                        No detailed lessons available for this module yet.
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-6 text-center text-gray-500 flex flex-col items-center">
                                <LayoutList className="w-10 h-10 text-gray-300 mb-2" />
                                <p>This course has no modules yet.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
