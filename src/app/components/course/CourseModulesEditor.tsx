import React, { useState } from 'react';
import { 
  Plus, Trash2, GripVertical, FileText, Video, HelpCircle, 
  Loader2, UploadCloud, CheckCircle, ChevronDown, ChevronUp, BookOpen 
} from 'lucide-react';
import { uploadDocument } from '../../../lib/api';
import { toast } from 'sonner';

export type QuizType = 'MCQ' | 'True/False' | 'Fill in the blank';

export interface QuizOption {
    id: string;
    text: string;
}

export interface Quiz {
    id: string;
    type: QuizType;
    question: string;
    options: QuizOption[];
    correctAnswer: string;
    explanation: string;
    customMessage: string;
}

export interface Lesson {
    id: string;
    title: string;
    explanation: string;
    videoLink: string;
    worksheetName?: string;
    worksheetUrl?: string;
    quizzes: Quiz[];
}

export interface Module {
    id: string;
    title: string;
    description: string;
    objectives: string[];
    duration: string;
    lessons: Lesson[];
}

interface CourseModulesEditorProps {
    modules: Module[];
    onChange: (modules: Module[]) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export function CourseModulesEditor({ modules, onChange }: CourseModulesEditorProps) {
    const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
    const [expandedLessons, setExpandedLessons] = useState<Record<string, boolean>>({});
    const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({});

    const handleFileUpload = async (moduleId: string, lessonId: string, file: File) => {
        if (!file) return;

        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Please upload a PDF or Word document.");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error("File size must be under 10MB.");
            return;
        }

        const uploadKey = `${moduleId}-${lessonId}`;
        setUploadingFiles(prev => ({ ...prev, [uploadKey]: true }));

        const { url, error } = await uploadDocument(file);

        setUploadingFiles(prev => ({ ...prev, [uploadKey]: false }));

        if (error || !url) {
            toast.error(error?.message || "Failed to upload file. Please try again.");
            return;
        }

        updateLesson(moduleId, lessonId, {
            worksheetName: file.name,
            worksheetUrl: url
        });
        toast.success("Document uploaded successfully!");
    };

    const addModule = () => {
        const newId = generateId();
        onChange([
            ...modules,
            {
                id: newId,
                title: '',
                description: '',
                objectives: [''],
                duration: '1 Week',
                lessons: []
            }
        ]);
        setExpandedWeeks(prev => ({ ...prev, [newId]: true }));
    };

    const updateModule = (moduleId: string, updates: Partial<Module>) => {
        onChange(modules.map(m => m.id === moduleId ? { ...m, ...updates } : m));
    };

    const deleteModule = (moduleId: string) => {
        onChange(modules.filter(m => m.id !== moduleId));
    };

    const addLearningObjective = (moduleId: string) => {
        const module = modules.find(m => m.id === moduleId);
        if (module) {
            updateModule(moduleId, { objectives: [...module.objectives, ''] });
        }
    };

    const updateLearningObjective = (moduleId: string, index: number, value: string) => {
        const module = modules.find(m => m.id === moduleId);
        if (module) {
            const newObjectives = [...module.objectives];
            newObjectives[index] = value;
            updateModule(moduleId, { objectives: newObjectives });
        }
    };

    const removeLearningObjective = (moduleId: string, index: number) => {
        const module = modules.find(m => m.id === moduleId);
        if (module) {
            const newObjectives = [...module.objectives];
            newObjectives.splice(index, 1);
            updateModule(moduleId, { objectives: newObjectives });
        }
    };

    // Lesson functions
    const addLesson = (moduleId: string) => {
        const module = modules.find(m => m.id === moduleId);
        if (module) {
            const newId = generateId();
            updateModule(moduleId, {
                lessons: [
                    ...module.lessons,
                    {
                        id: newId,
                        title: '',
                        explanation: '',
                        videoLink: '',
                        quizzes: []
                    }
                ]
            });
            setExpandedLessons(prev => ({ ...prev, [newId]: true }));
        }
    };

    const updateLesson = (moduleId: string, lessonId: string, updates: Partial<Lesson>) => {
        const module = modules.find(m => m.id === moduleId);
        if (module) {
            updateModule(moduleId, {
                lessons: module.lessons.map(l => l.id === lessonId ? { ...l, ...updates } : l)
            });
        }
    };

    const deleteLesson = (moduleId: string, lessonId: string) => {
        const module = modules.find(m => m.id === moduleId);
        if (module) {
            updateModule(moduleId, {
                lessons: module.lessons.filter(l => l.id !== lessonId)
            });
        }
    };

    // Quiz functions
    const addQuiz = (moduleId: string, lessonId: string) => {
        const module = modules.find(m => m.id === moduleId);
        if (module) {
            const lesson = module.lessons.find(l => l.id === lessonId);
            if (lesson) {
                updateLesson(moduleId, lessonId, {
                    quizzes: [
                        ...lesson.quizzes,
                        {
                            id: generateId(),
                            type: 'MCQ',
                            question: '',
                            options: [{ id: generateId(), text: '' }, { id: generateId(), text: '' }],
                            correctAnswer: '',
                            explanation: '',
                            customMessage: ''
                        }
                    ]
                });
            }
        }
    };

    const updateQuiz = (moduleId: string, lessonId: string, quizId: string, updates: Partial<Quiz>) => {
        const module = modules.find(m => m.id === moduleId);
        if (module) {
            const lesson = module.lessons.find(l => l.id === lessonId);
            if (lesson) {
                updateLesson(moduleId, lessonId, {
                    quizzes: lesson.quizzes.map(q => q.id === quizId ? { ...q, ...updates } : q)
                });
            }
        }
    };

    const deleteQuiz = (moduleId: string, lessonId: string, quizId: string) => {
        const module = modules.find(m => m.id === moduleId);
        if (module) {
            const lesson = module.lessons.find(l => l.id === lessonId);
            if (lesson) {
                updateLesson(moduleId, lessonId, {
                    quizzes: lesson.quizzes.filter(q => q.id !== quizId)
                });
            }
        }
    };

    const updateQuizOptions = (moduleId: string, lessonId: string, quizId: string, newOptions: QuizOption[]) => {
        updateQuiz(moduleId, lessonId, quizId, { options: newOptions });
    };

    const toggleLessonExpand = (id: string) => {
        setExpandedLessons(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleWeekExpand = (id: string) => {
        setExpandedWeeks(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="space-y-8 font-mono">
            {modules.map((module, mIndex) => {
                const isWeekExpanded = expandedWeeks[module.id] !== false; // Default expanded
                return (
                    <div key={module.id} className="bg-white border-4 border-gray-900 shadow-[6px_6px_0px_rgba(0,0,0,1)] text-gray-900 relative">
                        {/* Week / Module Title Header */}
                        <div className="p-6 bg-[#FAF9F6] border-b-4 border-gray-900 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-grab">
                                    <GripVertical className="w-5 h-5 text-gray-900" />
                                </div>
                                <div className="text-left">
                                    <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Week {mIndex + 1}</span>
                                    <h3 className="font-black text-xl uppercase tracking-tight">
                                        {module.title || 'Untitled Week Blueprint'}
                                    </h3>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => toggleWeekExpand(module.id)}
                                    className="p-2 border-2 border-gray-900 bg-white shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-[#eff3ff] transition-all"
                                >
                                    {isWeekExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => deleteModule(module.id)}
                                    className="p-2 border-2 border-gray-900 bg-rose-100 text-rose-700 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {isWeekExpanded && (
                            <div className="p-6 space-y-8">
                                {/* Week Meta details */}
                                <div className="grid md:grid-cols-3 gap-6 bg-[#FAF9F6] p-6 border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                    <div className="md:col-span-2 space-y-4">
                                        <div>
                                            <label className="block text-xs font-black uppercase text-gray-900 mb-1">Week Title *</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Introduction to React Components"
                                                className="w-full px-4 py-3 bg-white border-2 border-gray-900 text-xs font-bold uppercase outline-none focus:bg-[#eff3ff]"
                                                value={module.title}
                                                onChange={e => updateModule(module.id, { title: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black uppercase text-gray-900 mb-1">Week Overview / Goal *</label>
                                            <textarea
                                                placeholder="Short summary detailing what skills students master this week."
                                                rows={2}
                                                className="w-full px-4 py-3 bg-white border-2 border-gray-900 text-xs font-bold uppercase outline-none focus:bg-[#eff3ff] resize-none"
                                                value={module.description}
                                                onChange={e => updateModule(module.id, { description: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-black uppercase text-gray-900 mb-1">Estimated Commitment *</label>
                                            <select
                                                className="w-full px-4 py-3 bg-white border-2 border-gray-900 text-xs font-bold uppercase outline-none"
                                                value={module.duration}
                                                onChange={e => updateModule(module.id, { duration: e.target.value })}
                                            >
                                                <option>1 Week</option>
                                                <option>2 Weeks</option>
                                                <option>3 Weeks</option>
                                                <option>4 Weeks</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-black uppercase text-gray-900 mb-1">Learning Objectives</label>
                                            <div className="space-y-2">
                                                {module.objectives.map((obj, i) => (
                                                    <div key={i} className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder={`Objective ${i + 1}`}
                                                            className="flex-1 px-3 py-2 bg-white border-2 border-gray-900 text-xs font-bold uppercase"
                                                            value={obj}
                                                            onChange={e => updateLearningObjective(module.id, i, e.target.value)}
                                                            required
                                                        />
                                                        {module.objectives.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeLearningObjective(module.id, i)}
                                                                className="text-rose-600 hover:text-rose-800"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                {module.objectives.length < 5 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => addLearningObjective(module.id)}
                                                        className="text-xs font-black text-[#f39c12] hover:underline flex items-center gap-1 mt-1"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" /> Add Objective
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Coursera Syllabus Timeline Items */}
                                <div className="space-y-6">
                                    <h4 className="font-black text-lg uppercase tracking-tight border-b-4 border-gray-900 pb-2 flex items-center gap-2">
                                        <BookOpen className="w-5 h-5 text-[#f39c12]" />
                                        Weekly Syllabus Timeline
                                    </h4>

                                    <div className="space-y-6 relative border-l-4 border-gray-950 pl-6 ml-4">
                                        {module.lessons.map((lesson, lIndex) => {
                                            const isLessonExpanded = expandedLessons[lesson.id] !== false; // Default expanded
                                            return (
                                                <div key={lesson.id} className="relative bg-white border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                                    {/* Timeline node */}
                                                    <div className="absolute -left-[38px] top-6 w-5 h-5 bg-[#f39c12] border-4 border-gray-900 rounded-full flex items-center justify-center shadow-[1px_1px_0px_rgba(0,0,0,1)]" />

                                                    {/* Lesson Title Box */}
                                                    <div 
                                                        onClick={() => toggleLessonExpand(lesson.id)}
                                                        className="p-4 bg-[#FAF9F6] border-b-4 border-gray-900 flex justify-between items-center cursor-pointer select-none"
                                                    >
                                                        <div className="text-left">
                                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Syllabus Topic {lIndex + 1}</span>
                                                            <h5 className="font-black text-sm uppercase tracking-tight">{lesson.title || 'Untitled Topic'}</h5>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); deleteLesson(module.id, lesson.id); }}
                                                                className="p-1.5 border border-gray-900 bg-white hover:bg-rose-50 text-rose-600 rounded"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                            {isLessonExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                        </div>
                                                    </div>

                                                    {isLessonExpanded && (
                                                        <div className="p-6 space-y-6 text-left">
                                                            {/* Topic Title Input */}
                                                            <div>
                                                                <label className="block text-xs font-black uppercase text-gray-900 mb-1">Topic Title *</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Topic Title *"
                                                                    className="w-full px-3 py-2 border-2 border-gray-900 text-xs font-bold uppercase outline-none focus:bg-[#eff3ff]"
                                                                    value={lesson.title}
                                                                    onChange={e => updateLesson(module.id, lesson.id, { title: e.target.value })}
                                                                    required
                                                                />
                                                            </div>

                                                            {/* Coursera Item Blocks Grid */}
                                                            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t-2 border-gray-900">
                                                                {/* Item A: Video Lecture */}
                                                                <div className="border-4 border-gray-900 bg-[#FAF9F6] p-4 shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                                                                    <h6 className="font-black text-xs uppercase text-gray-900 flex items-center gap-1.5 mb-3 border-b-2 border-gray-900 pb-1.5">
                                                                        <Video className="w-4 h-4 text-[#f39c12]" /> Video Lecture
                                                                    </h6>
                                                                    <div className="space-y-3">
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Paste YouTube Video Link"
                                                                            className="w-full px-3 py-2 border-2 border-gray-900 text-xs font-bold bg-white outline-none"
                                                                            value={lesson.videoLink}
                                                                            onChange={e => updateLesson(module.id, lesson.id, { videoLink: e.target.value })}
                                                                        />
                                                                        <p className="text-[10px] text-gray-500 uppercase leading-relaxed">
                                                                            Include video resources to anchor this topic step.
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* Item B: Lab Worksheet / PDF */}
                                                                <div className="border-4 border-gray-900 bg-[#FAF9F6] p-4 shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                                                                    <h6 className="font-black text-xs uppercase text-gray-900 flex items-center gap-1.5 mb-3 border-b-2 border-gray-900 pb-1.5">
                                                                        <FileText className="w-4 h-4 text-[#f39c12]" /> Reference Lab / Worksheet
                                                                    </h6>
                                                                    {lesson.worksheetName && lesson.worksheetUrl ? (
                                                                        <div className="flex items-center justify-between p-3 border-2 border-gray-900 bg-white">
                                                                            <a
                                                                                href={lesson.worksheetUrl}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="text-xs font-black text-[#f39c12] hover:underline truncate"
                                                                                download
                                                                            >
                                                                                📄 {lesson.worksheetName}
                                                                            </a>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => updateLesson(module.id, lesson.id, { worksheetName: '', worksheetUrl: '' })}
                                                                                className="text-rose-600 hover:text-rose-800"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="space-y-3">
                                                                            <input
                                                                                type="url"
                                                                                placeholder="Paste direct PDF link"
                                                                                className="w-full px-3 py-2 border-2 border-gray-900 text-xs font-bold bg-white outline-none"
                                                                                value={lesson.worksheetUrl || ''}
                                                                                onChange={(e) => updateLesson(module.id, lesson.id, { worksheetUrl: e.target.value, worksheetName: 'Topic Document' })}
                                                                            />
                                                                            <div className="text-center text-[9px] font-black text-gray-400">OR</div>
                                                                            <div>
                                                                                <input
                                                                                    type="file"
                                                                                    id={`file-${lesson.id}`}
                                                                                    className="hidden"
                                                                                    accept=".pdf,.doc,.docx"
                                                                                    onChange={(e) => {
                                                                                        const file = e.target.files?.[0];
                                                                                        if (file) handleFileUpload(module.id, lesson.id, file);
                                                                                    }}
                                                                                    disabled={uploadingFiles[`${module.id}-${lesson.id}`]}
                                                                                />
                                                                                <label
                                                                                    htmlFor={`file-${lesson.id}`}
                                                                                    className={`w-full flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-gray-400 bg-white text-xs font-black hover:border-gray-900 hover:bg-[#eff3ff] cursor-pointer transition-colors`}
                                                                                >
                                                                                    {uploadingFiles[`${module.id}-${lesson.id}`] ? (
                                                                                        <>
                                                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                                            Uploading...
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <UploadCloud className="w-4 h-4" />
                                                                                            Upload Doc (Max 10MB)
                                                                                        </>
                                                                                    )}
                                                                                </label>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Item C: Reading Explanation */}
                                                            <div className="border-4 border-gray-900 bg-[#FAF9F6] p-4 shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                                                                <h6 className="font-black text-xs uppercase text-gray-900 flex items-center gap-1.5 mb-3 border-b-2 border-gray-900 pb-1.5">
                                                                    <FileText className="w-4 h-4 text-[#f39c12]" /> Reading Material
                                                                </h6>
                                                                <textarea
                                                                    placeholder="Type reading materials, key lessons, markdown syntax, or resources here..."
                                                                    rows={4}
                                                                    className="w-full px-3 py-2 border-2 border-gray-900 text-xs font-bold bg-white outline-none resize-none"
                                                                    value={lesson.explanation}
                                                                    onChange={e => updateLesson(module.id, lesson.id, { explanation: e.target.value })}
                                                                    required
                                                                />
                                                            </div>

                                                            {/* Item D: Practice Quizzes */}
                                                            <div className="border-4 border-gray-900 bg-[#FAF9F6] p-4 shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                                                                <div className="flex justify-between items-center mb-3 border-b-2 border-gray-900 pb-1.5">
                                                                    <h6 className="font-black text-xs uppercase text-gray-900 flex items-center gap-1.5">
                                                                        <HelpCircle className="w-4 h-4 text-[#f39c12]" />
                                                                        Practice Quiz
                                                                    </h6>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => addQuiz(module.id, lesson.id)}
                                                                        className="text-[10px] font-black bg-white hover:bg-[#eff3ff] px-2.5 py-1 border-2 border-gray-900 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] flex items-center gap-1"
                                                                    >
                                                                        <Plus className="w-3.5 h-3.5" /> Add Question
                                                                    </button>
                                                                </div>

                                                                <div className="space-y-4">
                                                                    {lesson.quizzes.map((quiz) => (
                                                                        <div key={quiz.id} className="bg-white border-2 border-gray-900 p-4 shadow-[2px_2px_0px_rgba(0,0,0,1)] relative">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => deleteQuiz(module.id, lesson.id, quiz.id)}
                                                                                className="absolute top-3 right-3 text-gray-400 hover:text-rose-600 transition-colors"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>

                                                                            <div className="mb-3 w-48 text-left">
                                                                                <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Question Type</label>
                                                                                <select
                                                                                    className="w-full px-2 py-1.5 border-2 border-gray-900 bg-[#FAF9F6] text-[10px] font-black uppercase outline-none"
                                                                                    value={quiz.type}
                                                                                    onChange={(e) => {
                                                                                        const type = e.target.value as QuizType;
                                                                                        let newOptions = quiz.options;
                                                                                        if (type === 'True/False') {
                                                                                            newOptions = [{ id: generateId(), text: 'True' }, { id: generateId(), text: 'False' }];
                                                                                        } else if (type === 'MCQ' && quiz.options.length < 2) {
                                                                                            newOptions = [{ id: generateId(), text: '' }, { id: generateId(), text: '' }];
                                                                                        }
                                                                                        updateQuiz(module.id, lesson.id, quiz.id, { type, options: newOptions });
                                                                                    }}
                                                                                >
                                                                                    <option value="MCQ">Multiple Choice</option>
                                                                                    <option value="True/False">True/False</option>
                                                                                    <option value="Fill in the blank">Fill in the blank</option>
                                                                                </select>
                                                                            </div>

                                                                            <div className="space-y-3">
                                                                                <input
                                                                                    type="text"
                                                                                    placeholder="Question *"
                                                                                    className="w-full px-3 py-2 border-2 border-gray-900 text-xs font-bold outline-none"
                                                                                    value={quiz.question}
                                                                                    onChange={e => updateQuiz(module.id, lesson.id, quiz.id, { question: e.target.value })}
                                                                                    required
                                                                                />

                                                                                {quiz.type === 'MCQ' && (
                                                                                    <div className="space-y-2 pl-4 border-l-2 border-gray-900">
                                                                                        <label className="text-[10px] font-black text-gray-500 uppercase block">Options & Correct Answer</label>
                                                                                        {quiz.options.map((opt, oIndex) => (
                                                                                            <div key={opt.id} className="flex items-center gap-2">
                                                                                                <input
                                                                                                    type="radio"
                                                                                                    name={`correct-${quiz.id}`}
                                                                                                    checked={quiz.correctAnswer === opt.id}
                                                                                                    onChange={() => updateQuiz(module.id, lesson.id, quiz.id, { correctAnswer: opt.id })}
                                                                                                    className="w-4 h-4 text-gray-900 focus:ring-gray-900"
                                                                                                    required
                                                                                                />
                                                                                                <input
                                                                                                    type="text"
                                                                                                    placeholder={`Option ${oIndex + 1}`}
                                                                                                    className="flex-1 px-2 py-1 border-2 border-gray-900 text-xs font-bold outline-none"
                                                                                                    value={opt.text}
                                                                                                    onChange={e => {
                                                                                                        const newOpts = [...quiz.options];
                                                                                                        newOpts[oIndex].text = e.target.value;
                                                                                                        updateQuizOptions(module.id, lesson.id, quiz.id, newOpts);
                                                                                                    }}
                                                                                                    required
                                                                                                />
                                                                                                {quiz.options.length > 2 && (
                                                                                                    <button
                                                                                                        type="button"
                                                                                                        onClick={() => {
                                                                                                            const newOpts = quiz.options.filter(o => o.id !== opt.id);
                                                                                                            updateQuizOptions(module.id, lesson.id, quiz.id, newOpts);
                                                                                                            if (quiz.correctAnswer === opt.id) {
                                                                                                                updateQuiz(module.id, lesson.id, quiz.id, { correctAnswer: '' });
                                                                                                            }
                                                                                                        }}
                                                                                                        className="text-gray-400 hover:text-rose-600"
                                                                                                    >
                                                                                                        <Trash2 className="w-4 h-4" />
                                                                                                    </button>
                                                                                                )}
                                                                                            </div>
                                                                                        ))}
                                                                                        {quiz.options.length < 5 && (
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => updateQuizOptions(module.id, lesson.id, quiz.id, [...quiz.options, { id: generateId(), text: '' }])}
                                                                                                className="text-[10px] font-black text-[#f39c12] hover:underline"
                                                                                            >
                                                                                                + Add Option
                                                                                            </button>
                                                                                        )}
                                                                                    </div>
                                                                                )}

                                                                                {quiz.type === 'True/False' && (
                                                                                    <div className="space-y-2 pl-4 border-l-2 border-gray-900">
                                                                                        <label className="text-[10px] font-black text-gray-500 uppercase block">Select Correct Answer</label>
                                                                                        <div className="flex gap-4 text-xs font-bold">
                                                                                            {quiz.options.map((opt) => (
                                                                                                <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
                                                                                                    <input
                                                                                                        type="radio"
                                                                                                        name={`correct-${quiz.id}`}
                                                                                                        checked={quiz.correctAnswer === opt.id}
                                                                                                        onChange={() => updateQuiz(module.id, lesson.id, quiz.id, { correctAnswer: opt.id })}
                                                                                                        className="w-4 h-4 text-gray-900 focus:ring-gray-900"
                                                                                                        required
                                                                                                    />
                                                                                                    <span>{opt.text}</span>
                                                                                                </label>
                                                                                            ))}
                                                                                        </div>
                                                                                    </div>
                                                                                )}

                                                                                {quiz.type === 'Fill in the blank' && (
                                                                                    <div className="space-y-2 pl-4 border-l-2 border-gray-900">
                                                                                        <label className="text-[10px] font-black text-gray-500 uppercase block">Correct Answer</label>
                                                                                        <input
                                                                                            type="text"
                                                                                            placeholder="Type the exact word or phrase"
                                                                                            className="w-full max-w-sm px-3 py-1.5 border-2 border-gray-900 text-xs font-bold outline-none"
                                                                                            value={quiz.correctAnswer}
                                                                                            onChange={e => updateQuiz(module.id, lesson.id, quiz.id, { correctAnswer: e.target.value })}
                                                                                            required
                                                                                        />
                                                                                    </div>
                                                                                )}

                                                                                <div className="space-y-3 pt-3 mt-3 border-t-2 border-gray-900">
                                                                                    <div>
                                                                                        <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-1 mb-1">
                                                                                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                                                                            Explanation *
                                                                                        </label>
                                                                                        <textarea
                                                                                            placeholder="Why is this answer correct? Explanations help auto-correct."
                                                                                            rows={2}
                                                                                            className="w-full px-3 py-1.5 border-2 border-gray-900 text-xs font-bold bg-white outline-none resize-none"
                                                                                            value={quiz.explanation}
                                                                                            onChange={e => updateQuiz(module.id, lesson.id, quiz.id, { explanation: e.target.value })}
                                                                                            required
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                    {lesson.quizzes.length === 0 && (
                                                                        <p className="text-[10px] text-gray-400 italic text-center py-2">No quiz questions added yet.</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        <button
                                            type="button"
                                            onClick={() => addLesson(module.id)}
                                            className="w-full py-4 border-4 border-dashed border-gray-900 bg-white text-xs font-black text-gray-700 hover:text-[#f39c12] hover:border-[#f39c12] hover:bg-[#eff3ff]/10 transition-all flex items-center justify-center gap-2 shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                                        >
                                            <Plus className="w-5 h-5" /> Add New Topic Step
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            <button
                type="button"
                onClick={addModule}
                className="w-full py-5 border-4 border-dashed border-gray-900 bg-[#f39c12] text-sm font-black text-gray-900 hover:bg-[#e08e0b] shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2"
            >
                <Plus className="w-5 h-5" /> Add New Syllabus Week
            </button>
        </div>
    );
}

export default CourseModulesEditor;
