import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { getCourseDataForStudent, updateEnrollmentProgress } from '../../lib/api';
import { LayoutList, PlayCircle, FileText, HelpCircle, CheckCircle2, ChevronLeft, ChevronRight, Trophy, BookOpen, AlertCircle, Check } from 'lucide-react';
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
                    setActiveModuleId(firstModule.id?.toString() || firstModule.content?.id?.toString());

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
                    <div className="w-16 h-16 border-4 border-black border-t-yellow-400 rounded-none animate-spin shadow-[4px_4px_0px_rgba(0,0,0,1)] bg-white"></div>
                    <p className="text-gray-900 font-mono font-black uppercase tracking-wider animate-pulse">LOADING COURSE CONTENT...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (!course) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center p-8 bg-amber-100 border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] max-w-2xl mx-auto my-12">
                    <div className="w-20 h-20 bg-red-400 border-4 border-black rounded-none flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                        <AlertCircle className="w-10 h-10 text-black" />
                    </div>
                    <h2 className="text-3xl font-mono font-black text-black uppercase tracking-tight">COURSE NOT FOUND</h2>
                    <p className="text-gray-800 font-mono font-medium max-w-md">
                        We couldn't load this course. It might have been removed, or you don't have access.
                    </p>
                    <button
                        onClick={() => navigate('/student-dashboard')}
                        className="px-8 py-4 bg-yellow-300 hover:bg-yellow-400 text-black font-mono font-black uppercase border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all"
                    >
                        Back to dashboard
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
            <div className="bg-emerald-300 border-4 border-black p-6 mb-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/student-dashboard')}
                        className="p-3 bg-white hover:bg-gray-100 border-4 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all text-black"
                    >
                        <ChevronLeft className="w-6 h-6 stroke-[3]" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-black text-yellow-300 text-xs font-mono font-black px-2.5 py-0.5 uppercase border-2 border-black">
                                {course.level || 'STUDENT COURSE'}
                            </span>
                            {course.objective && (
                                <span className="bg-white text-black text-xs font-mono font-black px-2.5 py-0.5 uppercase border-2 border-black">
                                    PATH
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-mono font-black text-black uppercase tracking-tight leading-none">{course.title}</h1>
                    </div>
                </div>

                {isCourseCompleted && (
                    <div className="flex items-center gap-3 bg-yellow-300 text-black px-5 py-3 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] animate-bounce">
                        <Trophy className="w-6 h-6 stroke-[2.5]" />
                        <span className="font-mono font-black uppercase text-sm">COURSE COMPLETED!</span>
                    </div>
                )}
            </div>

            {/* Main Learning Hub Layout */}
            <div className="flex flex-col lg:flex-row gap-8 min-h-[600px] pb-12">
                
                {/* Main Content Area (Video/PDF/Quiz) */}
                <div className="flex-1 bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col relative w-full lg:w-2/3 xl:w-3/4">
                    {activeLesson ? (
                        <div className="flex-1 p-6 md:p-8 lg:p-10 flex flex-col gap-8">
                            
                            {/* Lesson Title & Concept Explanation */}
                            <div className="bg-yellow-50 border-4 border-black p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                <span className="text-xs font-mono font-black text-emerald-600 uppercase tracking-widest block mb-1">ACTIVE LESSON</span>
                                <h2 className="text-3xl font-mono font-black text-black uppercase tracking-tight mb-3">{activeLesson.title}</h2>
                                <p className="text-gray-800 font-mono text-base md:text-lg leading-relaxed whitespace-pre-line">{activeLesson.explanation}</p>
                            </div>

                            {/* Video Player Section */}
                            {activeLesson.videoLink && (
                                <div className="space-y-3">
                                    <h3 className="text-xl font-mono font-black text-black uppercase tracking-tight flex items-center gap-2">
                                        <PlayCircle className="w-6 h-6 text-indigo-600 stroke-[2.5]" />
                                        Lecture & Demonstration
                                    </h3>
                                    <div className="w-full bg-black border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] overflow-hidden aspect-video">
                                        <iframe
                                            src={getEmbedUrl(activeLesson.videoLink)}
                                            title={activeLesson.title}
                                            className="w-full h-full border-0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                </div>
                            )}

                            {/* Worksheet / PDF Section */}
                            {(activeLesson.worksheetUrl || activeLesson.pdf_url) && (() => {
                                const pdfUrl = activeLesson.worksheetUrl || activeLesson.pdf_url;
                                return (
                                    <div className="space-y-4 bg-sky-100 border-4 border-black p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className="w-14 h-14 bg-white border-4 border-black flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                                    <FileText className="w-7 h-7 text-black stroke-[2.5]" />
                                                </div>
                                                <div>
                                                    <h3 className="font-mono font-black text-black uppercase text-lg mb-0.5">Lesson Workbook</h3>
                                                    <p className="font-mono text-xs text-gray-700 leading-snug">
                                                        {activeLesson.worksheetName || 'Download attached materials for this lesson'}
                                                    </p>
                                                </div>
                                            </div>
                                            <a
                                                href={pdfUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download={activeLesson.worksheetName || 'Document'}
                                                className="px-6 py-3 bg-white hover:bg-yellow-200 text-black font-mono font-black uppercase border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all whitespace-nowrap text-center"
                                            >
                                                Open Document
                                            </a>
                                        </div>

                                        <div className="flex items-center gap-3 p-4 bg-white border-4 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-yellow-50 transition-colors mt-4">
                                            <div className="relative flex items-start cursor-pointer w-full">
                                                <div className="flex h-6 items-center">
                                                    <input
                                                        id={`read-doc-${activeLessonIdentifier}`}
                                                        name={`read-doc-${activeLessonIdentifier}`}
                                                        type="checkbox"
                                                        checked={!!readPdfs[activeLessonIdentifier]}
                                                        onChange={(e) => setReadPdfs(prev => ({ ...prev, [activeLessonIdentifier]: e.target.checked }))}
                                                        className="h-6 w-6 border-4 border-black text-black focus:ring-0 cursor-pointer accent-black bg-white rounded-none"
                                                    />
                                                </div>
                                                <div className="ml-4 text-sm">
                                                    <label htmlFor={`read-doc-${activeLessonIdentifier}`} className="font-mono font-black text-black uppercase cursor-pointer select-none">
                                                        I have read and completed the material
                                                    </label>
                                                    <p className="font-mono text-xs text-gray-600 uppercase">Required to mark this lesson as completed.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Quiz / Knowledge Check */}
                            {(() => {
                                const quizzesToRender = activeLesson.quiz || activeLesson.quizzes || [];
                                if (!Array.isArray(quizzesToRender) || quizzesToRender.length === 0) return null;

                                return (
                                    <div className="mt-4 space-y-6">
                                        <div className="bg-amber-300 border-4 border-black p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center gap-2">
                                            <HelpCircle className="w-7 h-7 text-black stroke-[2.5]" />
                                            <h3 className="text-xl font-mono font-black text-black uppercase tracking-tight">
                                                Knowledge Check Checkpoint
                                            </h3>
                                        </div>

                                        {quizzesToRender.map((quiz: any, idx: number) => {
                                            const quizAnswer = quiz.answer || quiz.correctAnswer;
                                            const quizType = quiz.type?.toLowerCase() || 'mcq';
                                            const isAnswered = !!quizAnswers[quiz.id || idx];
                                            const selectedValue = quizAnswers[quiz.id || idx];
                                            const isCorrect = isAnswered && selectedValue === quizAnswer;

                                            return (
                                                <div key={quiz.id || idx} className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                                                    <div className="flex gap-4 mb-4 items-start">
                                                        <div className="w-10 h-10 bg-black text-yellow-300 border-2 border-black flex items-center justify-center font-mono font-black text-lg flex-shrink-0">
                                                            {idx + 1}
                                                        </div>
                                                        <p className="font-mono font-bold text-black text-lg leading-snug pt-1">{quiz.question}</p>
                                                    </div>

                                                    {/* MCQ options layout */}
                                                    {quizType === 'mcq' && Array.isArray(quiz.options) && (
                                                        <div className="space-y-3 pl-0 md:pl-14">
                                                            {quiz.options.map((opt: any, i: number) => {
                                                                const optValue = typeof opt === 'string' ? opt : opt.id;
                                                                const optLabel = typeof opt === 'string' ? opt : opt.text;
                                                                const isThisSelected = selectedValue === optValue;
                                                                const isThisCorrectOption = optValue === quizAnswer;

                                                                let optStyle = "border-black bg-white text-black hover:bg-gray-50";
                                                                if (isAnswered) {
                                                                    if (isThisCorrectOption) {
                                                                        optStyle = "border-black bg-emerald-300 text-black font-black";
                                                                    } else if (isThisSelected) {
                                                                        optStyle = "border-black bg-red-400 text-black font-black shadow-[2px_2px_0px_rgba(0,0,0,1)]";
                                                                    } else {
                                                                        optStyle = "border-black bg-gray-100 text-gray-500 opacity-60";
                                                                    }
                                                                }

                                                                return (
                                                                    <div
                                                                        key={i}
                                                                        onClick={() => handleQuizSelect(quiz.id || idx, optValue)}
                                                                        className={`p-4 border-4 shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all select-none font-mono font-bold
                                                                            ${isAnswered ? 'cursor-default' : 'cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_rgba(0,0,0,1)]'} 
                                                                            ${optStyle}
                                                                        `}
                                                                    >
                                                                        <div className="flex items-center justify-between">
                                                                            <span>{optLabel}</span>
                                                                            {isThisCorrectOption && isAnswered && (
                                                                                <span className="bg-black text-white px-2 py-0.5 text-xs font-black uppercase border-2 border-black">CORRECT</span>
                                                                            )}
                                                                            {isThisSelected && !isCorrect && (
                                                                                <span className="bg-black text-red-400 px-2 py-0.5 text-xs font-black uppercase border-2 border-black">WRONG</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    {/* True/False layout */}
                                                    {(quizType === 'true/false' || quizType === 'tf') && (
                                                        <div className="flex flex-col sm:flex-row gap-4 pl-0 md:pl-14">
                                                            {['True', 'False'].map(opt => {
                                                                const isThisSelected = selectedValue === opt;
                                                                const isThisCorrectOption = opt.toLowerCase() === quizAnswer?.toLowerCase();

                                                                let optStyle = "border-black bg-white text-black hover:bg-gray-50";
                                                                if (isAnswered) {
                                                                    if (isThisCorrectOption) {
                                                                        optStyle = "border-black bg-emerald-300 text-black font-black";
                                                                    } else if (isThisSelected) {
                                                                        optStyle = "border-black bg-red-400 text-black font-black";
                                                                    } else {
                                                                        optStyle = "border-black bg-gray-100 text-gray-500 opacity-60";
                                                                    }
                                                                }

                                                                return (
                                                                    <div
                                                                        key={opt}
                                                                        onClick={() => handleQuizSelect(quiz.id || idx, opt)}
                                                                        className={`flex-1 p-4 border-4 text-center shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all font-mono font-bold
                                                                            ${isAnswered ? 'cursor-default' : 'cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_rgba(0,0,0,1)]'} 
                                                                            ${optStyle}
                                                                        `}
                                                                    >
                                                                        {opt.toUpperCase()}
                                                                        {isThisCorrectOption && isAnswered && ' ✓'}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    {/* Feedback & Explanation Card */}
                                                    {isAnswered && (
                                                        <div className="mt-5 pl-0 md:pl-14 animate-in fade-in slide-in-from-top-2">
                                                            {!isCorrect ? (
                                                                <div className="bg-red-100 border-4 border-black p-4 font-mono font-black text-black uppercase text-sm mb-3">
                                                                    ❌ {quiz.customMessage || "Oops! That's incorrect. Please try the lesson content again."}
                                                                </div>
                                                            ) : (
                                                                <div className="bg-emerald-100 border-4 border-black p-4 font-mono font-black text-black uppercase text-sm mb-3 flex items-center gap-2">
                                                                    <Check className="w-5 h-5 stroke-[3]" /> Correct choice! Excellent job.
                                                                </div>
                                                            )}

                                                            {quiz.explanation && (
                                                                <div className="text-sm bg-yellow-50 border-4 border-black p-4 shadow-[3px_3px_0px_rgba(0,0,0,1)] text-black font-mono">
                                                                    <span className="font-black text-black block mb-2 uppercase tracking-wide border-b-2 border-black pb-1">EXPLANATION:</span>
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
                        <div className="flex-1 flex flex-col items-center justify-center text-black p-12 text-center bg-gray-50">
                            <BookOpen className="w-20 h-20 text-black mb-4 stroke-[1.5]" />
                            <h3 className="text-2xl font-mono font-black uppercase text-black mb-2">SELECT A LESSON TO BEGIN</h3>
                            <p className="font-mono text-sm max-w-sm text-gray-700">Choose a module and start learning the dynamic curriculums published just for your organization.</p>
                        </div>
                    )}
                </div>

                {/* Sidebar Curriculum panel */}
                <div className="w-full lg:w-1/3 xl:w-1/4 bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] flex flex-col">
                    <div className="p-5 border-b-4 border-black bg-yellow-300">
                        <h2 className="font-mono font-black text-black uppercase text-lg">Course Curriculum</h2>
                    </div>

                    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
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
                                    <div key={modId || mIdx} className="bg-white border-4 border-black overflow-hidden transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                        
                                        {/* Module Header */}
                                        <button
                                            onClick={() => setActiveModuleId(isActiveModule ? null : modId)}
                                            className={`w-full p-4 flex items-center justify-between text-left transition-colors font-mono font-bold
                                                ${isActiveModule ? 'bg-indigo-100 text-black border-b-4 border-black' : 'hover:bg-gray-50'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 border-2 border-black flex items-center justify-center text-sm font-black flex-shrink-0 transition-colors
                                                    ${isActiveModule ? 'bg-black text-white' : 'bg-gray-100 text-black'}`}
                                                >
                                                    {mIdx + 1}
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-black uppercase tracking-tight text-sm">
                                                        {module.title || module.content?.title || 'Untitled Module'}
                                                    </h3>
                                                </div>
                                            </div>
                                            <ChevronRight className={`w-5 h-5 stroke-[3] transition-transform duration-300 ${isActiveModule ? 'rotate-90 text-black' : 'text-gray-400'}`} />
                                        </button>

                                        {/* Lessons List */}
                                        {isActiveModule && (
                                            <div className="bg-gray-50 py-1">
                                                {hasLessons ? (
                                                    moduleLessons.map((lesson: any, lIdx: number) => {
                                                        const currentId = lesson.id?.toString() || lesson.title;
                                                        const isLessonActive = activeLessonId === lesson.id?.toString();
                                                        const isCompleted = completedLessons.includes(currentId);

                                                        return (
                                                            <button
                                                                key={lesson.id || lIdx}
                                                                onClick={() => setActiveLessonId(lesson.id?.toString())}
                                                                className={`w-full px-5 py-3.5 flex items-center justify-between text-left transition-colors font-mono font-bold border-b border-gray-200 last:border-0
                                                                    ${isLessonActive ? 'bg-yellow-200 text-black' : 'hover:bg-gray-100'}
                                                                `}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    {lesson.videoLink ? (
                                                                        <PlayCircle className={`w-5 h-5 flex-shrink-0 ${isLessonActive ? 'text-black stroke-[2.5]' : 'text-gray-500'}`} />
                                                                    ) : lesson.worksheetUrl ? (
                                                                        <FileText className={`w-5 h-5 flex-shrink-0 ${isLessonActive ? 'text-black stroke-[2.5]' : 'text-gray-500'}`} />
                                                                    ) : (
                                                                        <LayoutList className={`w-5 h-5 flex-shrink-0 ${isLessonActive ? 'text-black stroke-[2.5]' : 'text-gray-500'}`} />
                                                                    )}

                                                                    <span className={`text-xs uppercase tracking-tight ${isLessonActive ? 'font-black text-black' : 'font-medium text-gray-700'}`}>
                                                                        {lesson.title || `Lesson ${lIdx + 1}`}
                                                                    </span>
                                                                </div>

                                                                {isCompleted && (
                                                                    <span className="bg-emerald-400 text-black text-[10px] font-mono font-black px-1.5 py-0.5 uppercase border-2 border-black flex items-center gap-0.5">
                                                                        <Check className="w-3 h-3 stroke-[3]" /> DONE
                                                                    </span>
                                                                )}
                                                            </button>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="p-4 text-xs text-gray-500 text-center italic font-mono uppercase">
                                                        No detailed lessons available.
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-6 text-center text-gray-500 flex flex-col items-center font-mono">
                                <LayoutList className="w-10 h-10 text-gray-400 mb-2" />
                                <p className="uppercase text-xs font-bold">This course has no modules yet.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
