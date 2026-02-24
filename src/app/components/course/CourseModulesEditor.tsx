import { Plus, Trash2, GripVertical, Video, HelpCircle, CheckCircle } from 'lucide-react';

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

    const addModule = () => {
        onChange([
            ...modules,
            {
                id: generateId(),
                title: '',
                description: '',
                objectives: [''],
                duration: '1 Week',
                lessons: []
            }
        ]);
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
            updateModule(moduleId, {
                lessons: [
                    ...module.lessons,
                    {
                        id: generateId(),
                        title: '',
                        explanation: '',
                        videoLink: '',
                        quizzes: []
                    }
                ]
            });
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


    return (
        <div className="space-y-6">
            {modules.map((module, mIndex) => (
                <div key={module.id} className="bg-white border text-gray-800 border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    {/* Module Header */}
                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm cursor-grab">
                                <GripVertical className="w-5 h-5 text-gray-400" />
                            </div>
                            <h3 className="font-bold text-lg">Module {mIndex + 1}: {module.title || 'Untitled Module'}</h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => deleteModule(module.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-5 space-y-6">
                        {/* Module Details */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-bold text-gray-700">Module Title *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. English - Alphabet & Phonics"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                                    value={module.title}
                                    onChange={e => updateModule(module.id, { title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-bold text-gray-700">Module Description *</label>
                                <textarea
                                    placeholder="Short explanation of what kids will learn."
                                    rows={2}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-none"
                                    value={module.description}
                                    onChange={e => updateModule(module.id, { description: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-bold text-gray-700">Learning Objectives * (3-5 points)</label>
                                {module.objectives.map((obj, i) => (
                                    <div key={i} className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder={`Objective ${i + 1}`}
                                            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 transition-all text-sm"
                                            value={obj}
                                            onChange={e => updateLearningObjective(module.id, i, e.target.value)}
                                            required
                                        />
                                        {module.objectives.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeLearningObjective(module.id, i)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
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
                                        className="text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center mt-2"
                                    >
                                        <Plus className="w-4 h-4 mr-1" /> Add Objective
                                    </button>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Duration *</label>
                                <select
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                                    value={module.duration}
                                    onChange={e => updateModule(module.id, { duration: e.target.value })}
                                >
                                    <option>1 Week</option>
                                    <option>2 Weeks</option>
                                    <option>3 Weeks</option>
                                    <option>4 Weeks</option>
                                    <option>Custom</option>
                                </select>
                            </div>
                        </div>

                        {/* Lessons Section */}
                        <div className="mt-8">
                            <h4 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                                <Video className="w-5 h-5 text-amber-500" />
                                Lessons in this Module
                            </h4>

                            <div className="space-y-4">
                                {module.lessons.map((lesson, lIndex) => (
                                    <div key={lesson.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <h5 className="font-bold text-gray-700">Lesson {lIndex + 1}</h5>
                                            <button
                                                type="button"
                                                onClick={() => deleteLesson(module.id, lesson.id)}
                                                className="p-1.5 text-red-500 hover:bg-red-100 rounded-md transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <input
                                                    type="text"
                                                    placeholder="Lesson Title *"
                                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                                                    value={lesson.title}
                                                    onChange={e => updateLesson(module.id, lesson.id, { title: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <textarea
                                                    placeholder="Short Explanation (Text Editor) *"
                                                    rows={3}
                                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-sm resize-none"
                                                    value={lesson.explanation}
                                                    onChange={e => updateLesson(module.id, lesson.id, { explanation: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <input
                                                        type="text"
                                                        placeholder="YouTube Video Link (Optional)"
                                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                                                        value={lesson.videoLink}
                                                        onChange={e => updateLesson(module.id, lesson.id, { videoLink: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-600 block mb-1">Worksheet (PDF/Doc)</label>
                                                    {lesson.worksheetName && lesson.worksheetUrl ? (
                                                        <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                                                            <a
                                                                href={lesson.worksheetUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm font-bold text-amber-600 hover:text-amber-800 hover:underline flex-1 truncate"
                                                                title="View Document"
                                                            >
                                                                📄 {lesson.worksheetName}
                                                            </a>
                                                            <button
                                                                type="button"
                                                                onClick={() => updateLesson(module.id, lesson.id, { worksheetName: '', worksheetUrl: '' })}
                                                                className="p-1.5 text-red-500 hover:bg-red-100 rounded-md transition-colors flex-shrink-0"
                                                                title="Remove file"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="relative">
                                                            <input
                                                                type="url"
                                                                placeholder="Paste public PDF link here (e.g. from Google Drive or Supabase)"
                                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-gray-50"
                                                                value={lesson.worksheetUrl || ''}
                                                                onChange={(e) => updateLesson(module.id, lesson.id, { worksheetUrl: e.target.value, worksheetName: 'Lesson Document' })}
                                                            />
                                                            <p className="text-xs text-gray-500 mt-1">Make sure the link is publicly accessible to students.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Quizzes Section */}
                                            <div className="pt-4 mt-4 border-t border-gray-200">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h6 className="font-bold text-sm text-gray-800 flex items-center gap-1.5">
                                                        <HelpCircle className="w-4 h-4 text-amber-500" />
                                                        Quiz Section
                                                    </h6>
                                                    <button
                                                        type="button"
                                                        onClick={() => addQuiz(module.id, lesson.id)}
                                                        className="text-xs font-bold text-amber-600 hover:bg-amber-50 px-2 py-1 rounded border border-amber-200 flex items-center gap-1"
                                                    >
                                                        <Plus className="w-3 h-3" /> Add Question
                                                    </button>
                                                </div>

                                                <div className="space-y-4 text-sm">
                                                    {lesson.quizzes.map((quiz) => (
                                                        <div key={quiz.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative">
                                                            <button
                                                                type="button"
                                                                onClick={() => deleteQuiz(module.id, lesson.id, quiz.id)}
                                                                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>

                                                            <div className="mb-3 w-48">
                                                                <label className="block text-xs font-bold text-gray-600 mb-1">Question Type</label>
                                                                <select
                                                                    className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded outline-none focus:ring-1 focus:ring-amber-500"
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
                                                                <div>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Question *"
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded font-medium outline-none focus:border-amber-500"
                                                                        value={quiz.question}
                                                                        onChange={e => updateQuiz(module.id, lesson.id, quiz.id, { question: e.target.value })}
                                                                        required
                                                                    />
                                                                </div>

                                                                {/* Options based on type */}
                                                                {quiz.type === 'MCQ' && (
                                                                    <div className="space-y-2 pl-4 border-l-2 border-gray-100">
                                                                        <label className="text-xs font-bold text-gray-600 block">Options & Correct Answer</label>
                                                                        {quiz.options.map((opt, oIndex) => (
                                                                            <div key={opt.id} className="flex items-center gap-2">
                                                                                <input
                                                                                    type="radio"
                                                                                    name={`correct-${quiz.id}`}
                                                                                    checked={quiz.correctAnswer === opt.id}
                                                                                    onChange={() => updateQuiz(module.id, lesson.id, quiz.id, { correctAnswer: opt.id })}
                                                                                    className="w-4 h-4 text-amber-500 focus:ring-amber-500"
                                                                                    required
                                                                                />
                                                                                <input
                                                                                    type="text"
                                                                                    placeholder={`Option ${oIndex + 1}`}
                                                                                    className="flex-1 px-2 py-1 border border-gray-300 rounded outline-none focus:border-amber-500"
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
                                                                                        className="text-gray-400 hover:text-red-500"
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
                                                                                className="text-xs text-amber-600 font-bold hover:underline"
                                                                            >
                                                                                + Add Option
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {quiz.type === 'True/False' && (
                                                                    <div className="space-y-2 pl-4 border-l-2 border-gray-100">
                                                                        <label className="text-xs font-bold text-gray-600 block">Select Correct Answer</label>
                                                                        <div className="flex gap-4">
                                                                            {quiz.options.map((opt) => (
                                                                                <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
                                                                                    <input
                                                                                        type="radio"
                                                                                        name={`correct-${quiz.id}`}
                                                                                        checked={quiz.correctAnswer === opt.id}
                                                                                        onChange={() => updateQuiz(module.id, lesson.id, quiz.id, { correctAnswer: opt.id })}
                                                                                        className="w-4 h-4 text-amber-500 focus:ring-amber-500"
                                                                                        required
                                                                                    />
                                                                                    <span>{opt.text}</span>
                                                                                </label>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {quiz.type === 'Fill in the blank' && (
                                                                    <div className="space-y-2 pl-4 border-l-2 border-gray-100">
                                                                        <label className="text-xs font-bold text-gray-600 block">Correct Answer</label>
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Type the exact word or phrase"
                                                                            className="w-full max-w-sm px-3 py-1.5 border border-gray-300 rounded outline-none focus:border-amber-500"
                                                                            value={quiz.correctAnswer}
                                                                            onChange={e => updateQuiz(module.id, lesson.id, quiz.id, { correctAnswer: e.target.value })}
                                                                            required
                                                                        />
                                                                    </div>
                                                                )}


                                                                {/* Explanations and Smart Features */}
                                                                <div className="space-y-3 pt-3 mt-3 border-t border-gray-100">
                                                                    <div>
                                                                        <label className="text-xs font-bold text-gray-700 flex items-center gap-1 mb-1">
                                                                            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                                                            Explanation * <span className="text-gray-400 font-normal ml-1">(Powers auto-correction)</span>
                                                                        </label>
                                                                        <textarea
                                                                            placeholder="Why is this answer correct?"
                                                                            rows={2}
                                                                            className="w-full px-3 py-1.5 border border-gray-300 rounded outline-none focus:border-green-500 text-xs resize-none"
                                                                            value={quiz.explanation}
                                                                            onChange={e => updateQuiz(module.id, lesson.id, quiz.id, { explanation: e.target.value })}
                                                                            required
                                                                        />
                                                                    </div>

                                                                    <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100/50">
                                                                        <label className="text-xs font-bold text-amber-800 flex items-center gap-1 mb-1">
                                                                            🎯 Smart Feature: Custom Encouragement Message (Optional)
                                                                        </label>
                                                                        <p className="text-[10px] text-amber-600 mb-2 leading-tight">
                                                                            Personalize what the child sees when they select an answer. <br />
                                                                            Example: "Remember, A says 'aa' like apple 🍎"
                                                                        </p>
                                                                        <textarea
                                                                            placeholder="Your custom message here..."
                                                                            rows={2}
                                                                            className="w-full px-3 py-1.5 border border-amber-200 rounded outline-none focus:border-amber-400 text-xs bg-white resize-none"
                                                                            value={quiz.customMessage}
                                                                            onChange={e => updateQuiz(module.id, lesson.id, quiz.id, { customMessage: e.target.value })}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {lesson.quizzes.length === 0 && (
                                                        <p className="text-xs text-gray-400 italic text-center py-2">No questions added yet. Quizzes are highly recommended!</p>
                                                    )}
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={() => addLesson(module.id)}
                                    className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-5 h-5" /> Add New Lesson
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            <button
                type="button"
                onClick={addModule}
                className="w-full py-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl text-gray-600 font-bold hover:bg-gray-100 hover:text-gray-900 transition-all flex items-center justify-center gap-3 text-lg"
            >
                <Plus className="w-6 h-6" /> Add New Module
            </button>
        </div>
    );
}
