import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { getCourseDataForStudent, updateEnrollmentProgress } from '../../lib/api';
import { Play, FileText, HelpCircle, CheckCircle, ChevronLeft, ChevronDown, ChevronUp, Trophy, ArrowRight, Check } from 'lucide-react';
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
    const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

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
                
                // Initialize default active module and lesson
                if (data.track_modules && data.track_modules.length > 0) {
                    const firstModule = data.track_modules[0];
                    const firstModuleId = firstModule.id?.toString() || firstModule.content?.id?.toString();
                    setActiveModuleId(firstModuleId);
                    
                    // Set all modules expanded by default
                    const initialExpanded: Record<string, boolean> = {};
                    data.track_modules.forEach((m: any) => {
                        const id = m.id?.toString() || m.content?.id?.toString();
                        if (id) initialExpanded[id] = true;
                    });
                    setExpandedModules(initialExpanded);

                    const firstLessons = (firstModule.lessons?.length ? firstModule.lessons : firstModule.content?.lessons) || [];
                    if (firstLessons.length > 0) {
                        setActiveLessonId(firstLessons[0].id?.toString());
                    }
                }
            } else {
                toast.error("Unable to load course content.");
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

    // Calculate flat lessons in order to allow Next Item flow
    const flatLessons = useMemo(() => {
        if (!course?.track_modules) return [];
        return course.track_modules.flatMap((m: any) => {
            let lessons = [];
            if (m.lessons && Array.isArray(m.lessons)) {
                lessons = m.lessons;
            } else if (m.content?.lessons && Array.isArray(m.content.lessons)) {
                lessons = m.content.lessons;
            }
            const modId = m.id?.toString() || m.content?.id?.toString();
            return lessons.map((l: any) => ({
                ...l,
                moduleId: modId
            }));
        });
    }, [course]);

    const activeLessonIndex = useMemo(() => {
        if (!activeLessonId || flatLessons.length === 0) return -1;
        return flatLessons.findIndex((l: any) => l.id?.toString() === activeLessonId);
    }, [activeLessonId, flatLessons]);

    const hasNextLesson = activeLessonIndex !== -1 && activeLessonIndex < flatLessons.length - 1;

    const handleNextItem = () => {
        if (hasNextLesson) {
            const nextLesson = flatLessons[activeLessonIndex + 1];
            setActiveModuleId(nextLesson.moduleId);
            setActiveLessonId(nextLesson.id?.toString());
        } else {
            toast.success("Congratulations! You have finished all syllabus items.");
        }
    };

    // Check if entire course is completed
    const allLessonIds = useMemo(() => {
        return flatLessons.map((l: any) => l.id?.toString() || l.title);
    }, [flatLessons]);

    // Auto-complete lesson when conditions are met
    useEffect(() => {
        if (activeLessonIdentifier && isLessonCompletable() && !completedLessons.includes(activeLessonIdentifier)) {
            setCompletedLessons(prev => {
                const newCompleted = [...prev, activeLessonIdentifier];
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
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 bg-white">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-sans text-sm animate-pulse">Loading Course Workspace...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (!course) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[65vh] text-center p-8 bg-white border border-gray-200 rounded-xl max-w-xl mx-auto my-12 shadow-sm">
                    <HelpCircle className="w-14 h-14 text-blue-600 mb-4" />
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Workspace Unavailable</h2>
                    <p className="text-gray-550 text-sm max-w-md mb-6">We could not load this curriculum. It might have been set to draft or belongs to another institution.</p>
                    <button
                        onClick={() => navigate('/student-dashboard')}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                    >
                        Back to Courses
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    const getEmbedUrl = (url: string) => {
        if (!url) return '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        const videoId = (match && match[2].length === 11) ? match[2] : null;
        return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    };

    const toggleModuleExpand = (moduleId: string) => {
        setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm">
                
                {/* Header Navbar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/courses')}
                            className="p-1.5 hover:bg-gray-150 rounded-lg text-gray-500 hover:text-slate-900 transition"
                        >
                            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 leading-tight">{course.title}</h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded">
                                    {course.level || 'University Path'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {isCourseCompleted && (
                        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200 text-xs font-semibold">
                            <Trophy className="w-4 h-4 text-emerald-600" />
                            <span>Course Completed</span>
                        </div>
                    )}
                </div>

                {/* Main Master-Detail Body */}
                <div className="flex flex-1 overflow-hidden">
                    
                    {/* Left Pane (300px sidebar) */}
                    <div className="w-[300px] border-r border-gray-200 bg-slate-50 flex flex-col overflow-y-auto shrink-0 select-none">
                        <div className="p-4 border-b border-gray-200 bg-white">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Curriculum Syllabus</span>
                        </div>
                        
                        <div className="p-3 space-y-2">
                            {course.track_modules && course.track_modules.length > 0 ? (
                                course.track_modules.map((module: any, mIdx: number) => {
                                    const modId = module.id?.toString() || module.content?.id?.toString();
                                    const isExpanded = !!expandedModules[modId];

                                    let moduleLessons: any[] = [];
                                    if (module.lessons && Array.isArray(module.lessons)) {
                                        moduleLessons = module.lessons;
                                    } else if (module.content?.lessons && Array.isArray(module.content.lessons)) {
                                        moduleLessons = module.content.lessons;
                                    }

                                    return (
                                        <div key={modId || mIdx} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs">
                                            {/* Module Accordion Trigger */}
                                            <button
                                                onClick={() => toggleModuleExpand(modId)}
                                                className="w-full p-3 flex items-center justify-between text-left hover:bg-gray-50 transition"
                                            >
                                                <div className="flex items-start gap-2.5">
                                                    <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[10px] flex items-center justify-center mt-0.5 shrink-0">
                                                        {mIdx + 1}
                                                    </span>
                                                    <span className="text-xs font-bold text-slate-800 line-clamp-2">
                                                        {module.title || module.content?.title || 'Untitled Module'}
                                                    </span>
                                                </div>
                                                {isExpanded ? (
                                                    <ChevronUp className="w-4 h-4 text-gray-450 shrink-0 ml-1" />
                                                ) : (
                                                    <ChevronDown className="w-4 h-4 text-gray-450 shrink-0 ml-1" />
                                                )}
                                            </button>

                                            {/* Lessons List Accordion */}
                                            {isExpanded && (
                                                <div className="border-t border-gray-150 divide-y divide-gray-100 bg-white">
                                                    {moduleLessons.length > 0 ? (
                                                        moduleLessons.map((lesson: any, lIdx: number) => {
                                                            const currentId = lesson.id?.toString() || lesson.title;
                                                            const isItemActive = activeLessonId === lesson.id?.toString();
                                                            const isCompleted = completedLessons.includes(currentId);

                                                            return (
                                                                <button
                                                                    key={lesson.id || lIdx}
                                                                    onClick={() => {
                                                                        setActiveModuleId(modId);
                                                                        setActiveLessonId(lesson.id?.toString());
                                                                    }}
                                                                    className={`w-full px-4 py-2.5 flex items-center justify-between text-left text-xs font-medium hover:bg-gray-50 transition-colors
                                                                        ${isItemActive ? 'bg-blue-50/70 text-blue-700' : 'text-slate-700'}
                                                                    `}
                                                                >
                                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                                        {lesson.videoLink && lesson.videoLink.trim() !== '' ? (
                                                                            <Play className={`w-3.5 h-3.5 shrink-0 ${isItemActive ? 'text-blue-700' : 'text-gray-400'}`} />
                                                                        ) : lesson.quizzes && lesson.quizzes.length > 0 ? (
                                                                            <HelpCircle className={`w-3.5 h-3.5 shrink-0 ${isItemActive ? 'text-blue-700' : 'text-gray-400'}`} />
                                                                        ) : (
                                                                            <FileText className={`w-3.5 h-3.5 shrink-0 ${isItemActive ? 'text-blue-700' : 'text-gray-400'}`} />
                                                                        )}
                                                                        <span className="truncate pr-1">{lesson.title || `Lesson ${lIdx + 1}`}</span>
                                                                    </div>

                                                                    {isCompleted && (
                                                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                                                                    )}
                                                                </button>
                                                            );
                                                        })
                                                    ) : (
                                                        <div className="p-3 text-[10px] text-gray-400 italic text-center">No syllabus items.</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-4 text-xs text-gray-400 text-center italic">No modules added yet.</div>
                            )}
                        </div>
                    </div>

                    {/* Right Pane (Detail view area) */}
                    <div className="flex-1 overflow-y-auto bg-white p-8 md:p-12 flex flex-col justify-between relative">
                        
                        <div className="max-w-4xl w-full mx-auto pb-24">
                            {activeLesson ? (
                                <div className="space-y-8">
                                    
                                    {/* Topic Title */}
                                    <div className="border-b border-gray-200 pb-5">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-widest mb-1.5">
                                            {activeLesson.videoLink && activeLesson.videoLink.trim() !== '' ? 'Video Lecture' : activeLesson.quizzes && activeLesson.quizzes.length > 0 ? 'Practice Assessment' : 'Required Reading'}
                                        </div>
                                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{activeLesson.title}</h2>
                                    </div>

                                    {/* 1. Video Player */}
                                    {activeLesson.videoLink && activeLesson.videoLink.trim() !== "" && (
                                        <div className="space-y-4">
                                            <div className="w-full bg-slate-950 rounded-xl overflow-hidden aspect-video shadow-xs border border-slate-200">
                                                <iframe
                                                    src={getEmbedUrl(activeLesson.videoLink)}
                                                    title={activeLesson.title}
                                                    className="w-full h-full border-0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                ></iframe>
                                            </div>
                                            <p className="text-sm font-semibold text-slate-800">Lecture Video Resource</p>
                                        </div>
                                    )}

                                    {/* 2. Reading Explanation with Elegant Typography */}
                                    {activeLesson.explanation && (
                                        <div className="prose prose-slate max-w-none">
                                            <h3 className="text-lg font-bold text-slate-900 mb-2 uppercase tracking-wide text-xs text-gray-400">Concept Overview</h3>
                                            <p className="text-slate-750 text-base leading-relaxed whitespace-pre-line font-sans">
                                                {activeLesson.explanation}
                                            </p>
                                        </div>
                                    )}

                                    {/* 3. Document / Worksheet Section */}
                                    {(activeLesson.worksheetUrl || activeLesson.pdf_url) && (() => {
                                        const pdfUrl = activeLesson.worksheetUrl || activeLesson.pdf_url;
                                        return (
                                            <div className="p-5 bg-slate-50 border border-gray-250 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 bg-blue-50 rounded-lg shrink-0 border border-blue-100">
                                                        <FileText className="w-6 h-6 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-slate-800">{activeLesson.worksheetName || 'Topic Reference Document'}</h4>
                                                        <p className="text-xs text-gray-500 mt-0.5">Please review the syllabus document to mark this lesson complete.</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                                                    <a
                                                        href={pdfUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-slate-700 text-xs font-bold rounded-lg transition shadow-xs whitespace-nowrap"
                                                    >
                                                        View Document
                                                    </a>
                                                    <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 border border-gray-300 hover:bg-slate-50 rounded-lg select-none">
                                                        <input
                                                            type="checkbox"
                                                            checked={!!readPdfs[activeLessonIdentifier]}
                                                            onChange={(e) => setReadPdfs(prev => ({ ...prev, [activeLessonIdentifier]: e.target.checked }))}
                                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                                        />
                                                        <span className="text-[11px] font-bold text-slate-700 uppercase">Mark Completed</span>
                                                    </label>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* 4. MCQ / True-False Quiz View */}
                                    {(() => {
                                        const quizzesToRender = activeLesson.quiz || activeLesson.quizzes || [];
                                        if (!Array.isArray(quizzesToRender) || quizzesToRender.length === 0) return null;

                                        return (
                                            <div className="space-y-6 pt-4 border-t border-gray-200">
                                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                                    <HelpCircle className="w-5 h-5 text-blue-600" />
                                                    Practice Quiz Verification
                                                </h3>

                                                <div className="space-y-4">
                                                    {quizzesToRender.map((quiz: any, idx: number) => {
                                                        const quizAnswer = quiz.answer || quiz.correctAnswer;
                                                        const quizType = quiz.type?.toLowerCase() || 'mcq';
                                                        const isAnswered = !!quizAnswers[quiz.id || idx];
                                                        const selectedValue = quizAnswers[quiz.id || idx];
                                                        const isCorrect = isAnswered && selectedValue === quizAnswer;

                                                        return (
                                                            <div key={quiz.id || idx} className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
                                                                <div className="flex gap-3 mb-4 text-left">
                                                                    <span className="font-bold text-slate-500 text-sm">{idx + 1}.</span>
                                                                    <p className="font-semibold text-slate-900 text-sm">{quiz.question}</p>
                                                                </div>

                                                                {/* Radio items for MCQ */}
                                                                {quizType === 'mcq' && Array.isArray(quiz.options) && (
                                                                    <div className="space-y-2.5 pl-6">
                                                                        {quiz.options.map((opt: any, i: number) => {
                                                                            const optValue = typeof opt === 'string' ? opt : opt.id;
                                                                            const optLabel = typeof opt === 'string' ? opt : opt.text;
                                                                            const isThisSelected = selectedValue === optValue;
                                                                            const isThisCorrectOption = optValue === quizAnswer;

                                                                            let optionBorder = "border-gray-200 bg-white text-slate-700";
                                                                            if (isAnswered) {
                                                                                if (isThisCorrectOption) {
                                                                                    optionBorder = "border-emerald-250 bg-emerald-50 text-emerald-900 font-medium";
                                                                                } else if (isThisSelected) {
                                                                                    optionBorder = "border-rose-250 bg-rose-50 text-rose-900 font-medium";
                                                                                } else {
                                                                                    optionBorder = "border-gray-150 opacity-60 bg-gray-50";
                                                                                }
                                                                            }

                                                                            return (
                                                                                <label
                                                                                    key={i}
                                                                                    onClick={() => handleQuizSelect(quiz.id || idx, optValue)}
                                                                                    className={`flex items-center gap-3 p-3 rounded-lg border text-xs font-medium cursor-pointer transition select-none ${optionBorder}`}
                                                                                >
                                                                                    <input
                                                                                        type="radio"
                                                                                        name={`quiz-${quiz.id || idx}`}
                                                                                        checked={isThisSelected}
                                                                                        disabled={isAnswered}
                                                                                        onChange={() => {}}
                                                                                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                                                                                    />
                                                                                    <span>{optLabel}</span>
                                                                                </label>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}

                                                                {/* Radio items for True/False */}
                                                                {(quizType === 'true/false' || quizType === 'tf') && (
                                                                    <div className="flex flex-col sm:flex-row gap-3 pl-6">
                                                                        {['True', 'False'].map(opt => {
                                                                            const isThisSelected = selectedValue === opt;
                                                                            const isThisCorrectOption = opt.toLowerCase() === quizAnswer?.toLowerCase();

                                                                            let optionBorder = "border-gray-200 bg-white text-slate-700";
                                                                            if (isAnswered) {
                                                                                if (isThisCorrectOption) {
                                                                                    optionBorder = "border-emerald-250 bg-emerald-50 text-emerald-900 font-medium";
                                                                                } else if (isThisSelected) {
                                                                                    optionBorder = "border-rose-250 bg-rose-50 text-rose-900 font-medium";
                                                                                } else {
                                                                                    optionBorder = "border-gray-150 opacity-60 bg-gray-50";
                                                                                }
                                                                            }

                                                                            return (
                                                                                <label
                                                                                    key={opt}
                                                                                    onClick={() => handleQuizSelect(quiz.id || idx, opt)}
                                                                                    className={`flex-1 flex items-center justify-center gap-3 p-3 rounded-lg border text-xs font-medium cursor-pointer transition select-none ${optionBorder}`}
                                                                                >
                                                                                    <input
                                                                                        type="radio"
                                                                                        name={`quiz-${quiz.id || idx}`}
                                                                                        checked={isThisSelected}
                                                                                        disabled={isAnswered}
                                                                                        onChange={() => {}}
                                                                                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                                                                                    />
                                                                                    <span>{opt.toUpperCase()}</span>
                                                                                </label>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}

                                                                {/* Explanation and Status Feedbacks */}
                                                                {isAnswered && (
                                                                    <div className="mt-4 pl-6 space-y-3">
                                                                        {!isCorrect ? (
                                                                            <p className="text-rose-600 font-semibold text-xs">
                                                                                Incorrect choice. {quiz.customMessage || 'Review reading modules above to test again.'}
                                                                            </p>
                                                                        ) : (
                                                                            <p className="text-emerald-700 font-semibold text-xs flex items-center gap-1">
                                                                                ✓ Correct answer selected!
                                                                            </p>
                                                                        )}
                                                                        {quiz.explanation && (
                                                                            <div className="p-3 bg-slate-50 border border-gray-200 rounded-lg text-slate-700 text-xs">
                                                                                <strong className="text-slate-900 block mb-1">Explanation:</strong>
                                                                                {quiz.explanation}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })()}

                                </div>
                            ) : (
                                <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-gray-300">
                                    <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <h4 className="font-bold text-slate-800">Get Ready to Start</h4>
                                    <p className="text-xs text-gray-500 mt-1">Select a week and topic from the syllabus navigation to launch the module.</p>
                                </div>
                            )}
                        </div>

                        {/* Floating next item button at bottom-right */}
                        {activeLesson && (
                            <div className="absolute bottom-6 right-8 z-10">
                                <button
                                    onClick={handleNextItem}
                                    className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow-md transition-all active:scale-[0.98] select-none"
                                >
                                    <span>{hasNextLesson ? 'Go to next item' : 'Finish Course'}</span>
                                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                                </button>
                            </div>
                        )}

                    </div>

                </div>

            </div>
        </DashboardLayout>
    );
}
