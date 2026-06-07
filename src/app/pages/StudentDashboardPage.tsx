import { useState, useEffect } from 'react';
import {
    BookOpen, ChevronRight, Clock as ClockIcon,
    Search,
    Activity, Zap, Building2, Check, X, Bell,
    Flame, Trophy, GraduationCap, Target, Sparkles,
    Sun, Moon, Plus, CheckSquare, FileText, Palette,
    Pause, Music, SlidersHorizontal, Calendar as CalendarIcon,
    MoreVertical, RotateCcw, Play, Settings, ChevronLeft, Trash2, Code, Link2, Github, Copy, StickyNote
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOrganizationMode } from '../../context/OrganizationModeContext';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { OrgStudentDashboard } from '../components/dashboard/OrgStudentDashboard';
import { Enrollment, Profile, Booking, getStudentEnrollments, getUserProfile, getStudentBookings, getPendingOrgInvitesForStudent, respondToOrgStudentInvite } from '../../lib/api';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar } from '../../components/ui/calendar';
import { StudentBookingDetailsModal } from '../components/booking/StudentBookingDetailsModal';
import { toast } from 'sonner';

const getUniqueCode = (userId?: string) => {
    if (!userId) return "MZ000000000VK";
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        const char = userId.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    let seed = Math.abs(hash);
    let digits = "";
    for (let i = 0; i < 9; i++) {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        digits += Math.floor((seed / 4294967296) * 10).toString();
    }
    return `MZ${digits}VK`;
};

export function StudentDashboardPage() {
    const { user } = useAuth();
    const { mode, activeOrganization } = useOrganizationMode();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [invites, setInvites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    // Avatar Selection
    const avatarList = [
        'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
        'https://api.dicebear.com/7.x/adventurer/svg?seed=Aria',
        'https://api.dicebear.com/7.x/adventurer/svg?seed=Jasper',
        'https://api.dicebear.com/7.x/adventurer/svg?seed=Luna',
        'https://api.dicebear.com/7.x/adventurer/svg?seed=Buster',
        'https://api.dicebear.com/7.x/adventurer/svg?seed=Milo'
    ];
    const [avatarIndex, setAvatarIndex] = useState(0);

    const handleNextAvatar = () => {
        setAvatarIndex((prev) => (prev + 1) % avatarList.length);
    };

    // To-Do Logic
    const [todos, setTodos] = useState<{id: string, text: string, completed: boolean}[]>(() => {
        const saved = localStorage.getItem('mentozy_todos');
        return saved ? JSON.parse(saved) : [];
    });
    const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
    const [newTodo, setNewTodo] = useState('');
    const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
    const [editingTodoText, setEditingTodoText] = useState('');

    useEffect(() => {
        localStorage.setItem('mentozy_todos', JSON.stringify(todos));
    }, [todos]);

    const handleAddTodo = () => {
        if (!newTodo.trim()) return;
        setTodos([{ id: Date.now().toString(), text: newTodo, completed: false }, ...todos]);
        setNewTodo('');
    };

    const handleToggleTodo = (id: string) => {
        setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const handleDeleteTodo = (id: string) => {
        setTodos(todos.filter(t => t.id !== id));
    };

    const handleSaveEdit = (id: string) => {
        if (!editingTodoText.trim()) return;
        setTodos(todos.map(t => t.id === id ? { ...t, text: editingTodoText } : t));
        setEditingTodoId(null);
    };

    // Notes Logic
    const [notes, setNotes] = useState<{id: string, text: string, updatedAt: number}[]>(() => {
        const saved = localStorage.getItem('mentozy_notes');
        return saved ? JSON.parse(saved) : [];
    });
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
    const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
    const [activeNoteText, setActiveNoteText] = useState('');

    useEffect(() => {
        localStorage.setItem('mentozy_notes', JSON.stringify(notes));
    }, [notes]);

    const handleCreateNote = () => {
        const newId = Date.now().toString();
        const newNote = { id: newId, text: '', updatedAt: Date.now() };
        setNotes([newNote, ...notes]);
        setActiveNoteId(newId);
        setActiveNoteText('');
    };

    const handleSaveNote = () => {
        if (!activeNoteId) return;
        setNotes(notes.map(n => n.id === activeNoteId ? { ...n, text: activeNoteText, updatedAt: Date.now() } : n));
        setActiveNoteId(null);
    };

    const handleDeleteNote = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setNotes(notes.filter(n => n.id !== id));
        if (activeNoteId === id) setActiveNoteId(null);
    };

    const handleOpenNote = (id: string, text: string) => {
        setActiveNoteId(id);
        setActiveNoteText(text);
    };

    // Projects Logic
    const [projects, setProjects] = useState<{id: string, title: string, github: string, deployed: string, doc: string}[]>(() => {
        const saved = localStorage.getItem('mentozy_projects');
        return saved ? JSON.parse(saved) : [];
    });
    const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [projectForm, setProjectForm] = useState({ title: '', github: '', deployed: '', doc: '' });

    useEffect(() => {
        localStorage.setItem('mentozy_projects', JSON.stringify(projects));
    }, [projects]);

    const handleSaveProject = () => {
        if (!projectForm.title.trim()) return;
        if (editingProjectId) {
            setProjects(projects.map(p => p.id === editingProjectId ? { ...p, ...projectForm } : p));
        } else {
            setProjects([{ id: Date.now().toString(), ...projectForm }, ...projects]);
        }
        setEditingProjectId(null);
        setProjectForm({ title: '', github: '', deployed: '', doc: '' });
    };

    const handleEditProject = (p: any) => {
        setEditingProjectId(p.id);
        setProjectForm({ title: p.title, github: p.github, deployed: p.deployed, doc: p.doc });
    };

    const handleDeleteProject = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setProjects(projects.filter(p => p.id !== id));
        if (editingProjectId === id) {
            setEditingProjectId(null);
            setProjectForm({ title: '', github: '', deployed: '', doc: '' });
        }
    };

    // Life Goals Logic
    type GoalItem = { id: string, text: string };
    type GoalCategory = { id: string, name: string, items: GoalItem[] };

    const [goalCategories, setGoalCategories] = useState<GoalCategory[]>(() => {
        const saved = localStorage.getItem('mentozy_life_goals');
        return saved ? JSON.parse(saved) : [{ id: '1', name: 'Weekend Goals', items: [] }, { id: '2', name: 'Career Goals', items: [] }, { id: '3', name: 'Study Goals', items: [] }];
    });

    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const [activeGoalCategoryId, setActiveGoalCategoryId] = useState<string | null>(null);
    const [isGoalItemModalOpen, setIsGoalItemModalOpen] = useState(false);
    const [newGoalText, setNewGoalText] = useState('');

    const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
    const [editingGoalText, setEditingGoalText] = useState('');

    useEffect(() => {
        localStorage.setItem('mentozy_life_goals', JSON.stringify(goalCategories));
    }, [goalCategories]);

    const handleAddCategory = () => {
        if (!newCategoryName.trim()) return;
        setGoalCategories([...goalCategories, { id: Date.now().toString(), name: newCategoryName, items: [] }]);
        setNewCategoryName('');
        setIsCategoryModalOpen(false);
    };

    const handleDeleteCategory = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setGoalCategories(goalCategories.filter(c => c.id !== id));
    };

    const handleAddGoalItem = () => {
        if (!newGoalText.trim() || !activeGoalCategoryId) return;
        setGoalCategories(cats => cats.map(c => 
            c.id === activeGoalCategoryId ? { ...c, items: [...c.items, { id: Date.now().toString(), text: newGoalText }] } : c
        ));
        setNewGoalText('');
    };

    const handleDeleteGoalItem = (itemId: string) => {
        if (!activeGoalCategoryId) return;
        setGoalCategories(cats => cats.map(c => 
            c.id === activeGoalCategoryId ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c
        ));
    };

    const handleSaveEditGoal = (itemId: string) => {
        if (!editingGoalText.trim() || !activeGoalCategoryId) return;
        setGoalCategories(cats => cats.map(c => 
            c.id === activeGoalCategoryId ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, text: editingGoalText } : i) } : c
        ));
        setEditingGoalId(null);
    };

    // Active Projects Logic
    type ActiveProject = { id: string, name: string, deadline: string, theme: string, progress: number, workLeft: string, teamType: 'solo' | 'team', teamCount: number };
    const [activeProjects, setActiveProjects] = useState<ActiveProject[]>(() => {
        const saved = localStorage.getItem('mentozy_active_projects');
        return saved ? JSON.parse(saved) : [];
    });
    
    useEffect(() => {
        localStorage.setItem('mentozy_active_projects', JSON.stringify(activeProjects));
    }, [activeProjects]);

    const [isActiveProjectModalOpen, setIsActiveProjectModalOpen] = useState(false);
    const [editingActiveProjectId, setEditingActiveProjectId] = useState<string | null>(null);
    const [activeProjectForm, setActiveProjectForm] = useState<ActiveProject>({ id: '', name: '', deadline: '', theme: '', progress: 0, workLeft: '', teamType: 'solo', teamCount: 1 });

    const handleSaveActiveProject = () => {
        if (!activeProjectForm.name.trim()) return;
        if (editingActiveProjectId) {
            setActiveProjects(activeProjects.map(p => p.id === editingActiveProjectId ? { ...activeProjectForm, id: p.id } : p));
        } else {
            setActiveProjects([{ ...activeProjectForm, id: Date.now().toString() }, ...activeProjects]);
        }
        setIsActiveProjectModalOpen(false);
    };

    const handleEditActiveProject = (p: ActiveProject, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingActiveProjectId(p.id);
        setActiveProjectForm(p);
        setIsActiveProjectModalOpen(true);
    };

    const handleDeleteActiveProject = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setActiveProjects(activeProjects.filter(p => p.id !== id));
    };

    const handleOpenNewActiveProject = () => {
        setEditingActiveProjectId(null);
        setActiveProjectForm({ id: '', name: '', deadline: '', theme: '', progress: 0, workLeft: '', teamType: 'solo', teamCount: 1 });
        setIsActiveProjectModalOpen(true);
    };

    // Timer State
    const [sessionTime, setSessionTime] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(true);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setSessionTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h.toString().padStart(2, '0')} : ${m.toString().padStart(2, '0')} : ${s.toString().padStart(2, '0')}`;
        return `${m.toString().padStart(2, '0')} : ${s.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        const loadDashboardData = async () => {
            if (!user) return;
            // Clear previous state to avoid flickering
            setProfile(null);

            try {
                const [profileData, enrollmentsData, bookingsData, invitesData] = await Promise.all([
                    getUserProfile(user.id),
                    getStudentEnrollments(user.id),
                    getStudentBookings(user.id),
                    getPendingOrgInvitesForStudent(user.id)
                ]);

                if (profileData) {
                    // Redirect if accessing wrong dashboard
                    if (user?.user_metadata?.is_org) {
                        navigate('/org-dashboard', { replace: true });
                        return;
                    }
                    if (profileData.role === 'mentor') {
                        navigate('/mentor-dashboard', { replace: true });
                        return;
                    }
                    setProfile(profileData);
                }

                if (enrollmentsData) setEnrollments(enrollmentsData);
                if (bookingsData) setBookings(bookingsData);
                if (invitesData) setInvites(invitesData);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        loadDashboardData();
    }, [user]);

    const handleRespondInvite = async (invite: any, accept: boolean) => {
        try {
            const success = await respondToOrgStudentInvite(invite.id, invite.org_id, user!.id, accept);
            if (success) {
                toast.success(accept ? `Joined ${invite.org.full_name}!` : "Invitation declined.");
                setInvites(prev => prev.filter(i => i.id !== invite.id));
                // Reload dashboard data to show new organization if accepted (though organizations aren't shown much on student dash yet)
            } else {
                toast.error("Failed to respond to invitation.");
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred.");
        }
    };

    // Derived Statistics
    console.log("Dashboard Render: ", { profile, enrollments, bookings, loading });

    const safeEnrollments = Array.isArray(enrollments) ? enrollments : [];
    const completedCourses = safeEnrollments.filter(e => e.status === 'completed');
    const completedCount = completedCourses.length;

    // Estimate hours: 10 hours per course * (progress / 100)
    const totalHours = Math.round(safeEnrollments.reduce((acc, curr) => acc + (10 * (curr.progress / 100)), 0));
    const lessonsCompleted = Math.round(safeEnrollments.reduce((acc, curr) => acc + (12 * (curr.progress / 100)), 0)); // Approx 12 lessons per course

    // Key Stats
    const streak = profile?.streak || 0;

    const firstName = profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'Student';

    // Sort Bookings by date
    const safeBookings = Array.isArray(bookings) ? bookings : [];
    const featureBookings = [...safeBookings].sort((a, b) => {
        const dateA = new Date(a.scheduled_at).getTime();
        const dateB = new Date(b.scheduled_at).getTime();
        return (isNaN(dateA) ? 0 : dateA) - (isNaN(dateB) ? 0 : dateB);
    });

    const upcomingCount = featureBookings.filter(b => {
        const date = new Date(b.scheduled_at).getTime();
        return !isNaN(date) && date > Date.now();
    }).length;

    // Calendar Modifiers (Highlight booked dates)
    const bookedDates = featureBookings
        .map(b => new Date(b.scheduled_at))
        .filter(d => !isNaN(d.getTime()));

    const uniqueMentorsMap = new Map();
    safeBookings.forEach(b => {
        if (b.mentors && !uniqueMentorsMap.has(b.mentors.id)) {
            uniqueMentorsMap.set(b.mentors.id, b.mentors);
        }
    });
    const myMentors = Array.from(uniqueMentorsMap.values());

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            navigate(`/tracks?search=${e.currentTarget.value}`);
        }
    };

    const handleBookingClick = (booking: Booking) => {
        setSelectedBooking(booking);
        setDetailsModalOpen(true);
    };

    const handleBookingUpdated = (bookingId: string, updates: Partial<Booking>) => {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, ...updates } : b));
        setSelectedBooking(prev => prev && prev.id === bookingId ? { ...prev, ...updates } : prev);
    };

    // Organization mode: show isolated org dashboard
    if (mode === 'organization' && activeOrganization) {
        return (
            <DashboardLayout>
                <OrgStudentDashboard />
            </DashboardLayout>
        );
    }

    const getNextDays = () => {
        const days = [];
        const today = new Date();
        // Show 2 days before today, today, and 2 days after today
        for (let i = -2; i <= 2; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            days.push({
                fullDate: d,
                day: d.toLocaleDateString('en-US', { weekday: 'short' }),
                date: d.getDate(),
                active: d.toDateString() === selectedDate.toDateString()
            });
        }
        return days;
    };

    return (
        <DashboardLayout>
            <div className="-m-4 md:-m-8 flex flex-col xl:flex-row min-h-[calc(100vh-4rem)] md:min-h-screen bg-[#FAF9F6] overflow-hidden font-mono text-gray-900 tracking-tight select-none">
                
                {/* Decorative scatter elements */}
                <div className="absolute top-10 left-10 text-blue-500 font-bold text-xl opacity-80 pointer-events-none z-0">△</div>
                <div className="absolute top-14 right-1/2 text-gray-300 transform rotate-45 opacity-50 pointer-events-none z-0">+</div>

                {/* Left Column (Main App Area) */}
                <div className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto z-10">
                    
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-6 border-b-2 border-gray-900 pb-6">
                         <div className="flex items-center gap-4">
                              <h1 className="text-[2.5rem] font-black text-gray-900 tracking-tight leading-none uppercase">Dashboard</h1>
                         </div>
                         
                         <div className="flex items-center gap-4">
                              <button onClick={() => setIsCategoryModalOpen(true)} className="flex items-center justify-center gap-2 bg-[#818CF8] text-white px-5 py-2.5 md:py-3 border-2 border-gray-900 rounded-2xl text-sm font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all whitespace-nowrap">
                                  <Plus className="w-4 h-4"/> New Page
                              </button>
                         </div>
                    </div>

                    {/* Organization Invitations Banner (Render if any) */}
                    {invites.length > 0 && (
                        <div className="mb-8 p-6 bg-indigo-50 border-2 border-gray-900 rounded-3xl shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)] flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl border-2 border-gray-900 flex items-center justify-center shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                                    <Building2 className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">New Invite to {invites[0]?.org?.full_name}</h3>
                                    <p className="text-sm text-gray-500">Join this organization as a student</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleRespondInvite(invites[0], true)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold border-2 border-gray-900 shadow-[1px_1px_0px_rgba(0,0,0,1)]">Accept</button>
                                <button onClick={() => handleRespondInvite(invites[0], false)} className="px-4 py-2 bg-gray-250 text-gray-700 rounded-xl text-sm font-bold border-2 border-gray-900 shadow-[1px_1px_0px_rgba(0,0,0,1)]">Decline</button>
                            </div>
                        </div>
                    )}

                    {/* Top Widgets Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
                        {/* 6 Cards Metric Area */}
                        <div className="md:col-span-3 grid grid-cols-2 gap-x-6 gap-y-6 relative">
                             {/* Card 1 */}
                             <div onClick={() => setIsTodoModalOpen(true)} className="bg-white border-2 border-gray-900 rounded-3xl p-5 shadow-[2px_2px_0px_rgba(0,0,0,1)] h-[120px] flex flex-col justify-between hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer">
                                  <div className="flex justify-between items-start">
                                      <span className="text-3xl font-extrabold">{todos.length}</span>
                                      <div className="w-12 h-12 bg-white border-2 border-gray-900 rounded-xl flex items-center justify-center shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                                           <CheckSquare className="w-6 h-6 text-[#5763f6]" />
                                      </div>
                                  </div>
                                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">To-do List</span>
                             </div>
                             
                             {/* Card 2 */}
                             <div onClick={() => setIsNotesModalOpen(true)} className="bg-white border-2 border-gray-900 rounded-3xl p-5 shadow-[2px_2px_0px_rgba(0,0,0,1)] h-[120px] flex flex-col justify-between hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer">
                                  <div className="flex justify-between items-start">
                                      <span className="text-3xl font-extrabold">{notes.length}</span>
                                      <div className="w-12 h-12 bg-[#FEF9C3] border-2 border-gray-900 rounded-xl flex items-center justify-center shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                                           <StickyNote className="w-6 h-6 text-yellow-800" />
                                      </div>
                                  </div>
                                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Personal Notes</span>
                             </div>

                             {/* Card 3 (Green Doodle Style) */}
                             <div onClick={() => window.open('https://mentozy.app/library', '_blank')} className="bg-[#DCFCE7] text-green-950 border-2 border-gray-900 rounded-3xl p-5 shadow-[2px_2px_0px_rgba(0,0,0,1)] h-[120px] flex flex-col justify-between hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer mt-1 relative overflow-hidden">
                                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                                  <div className="flex justify-between items-start relative z-10">
                                      <span className="text-4xl font-extrabold leading-none">∞</span>
                                      <span className="text-4xl">📚</span>
                                  </div>
                                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-850 relative z-10">Study Resources</span>
                             </div>

                             {/* Card 4 */}
                             <div onClick={() => setIsProjectsModalOpen(true)} className="bg-white border-2 border-gray-900 rounded-3xl p-5 shadow-[2px_2px_0px_rgba(0,0,0,1)] h-[120px] flex flex-col justify-between mt-1 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer">
                                  <div className="flex justify-between items-start">
                                      <span className="text-3xl font-extrabold">{projects.length}</span>
                                      <div className="w-12 h-12 bg-white border-2 border-gray-900 rounded-xl flex items-center justify-center shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                                           <Code className="w-6 h-6 text-[#ff6896]" />
                                      </div>
                                  </div>
                                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">My Projects</span>
                             </div>

                             {/* Card 5 */}
                             <div className="bg-white border-2 border-gray-900 rounded-3xl p-5 shadow-[2px_2px_0px_rgba(0,0,0,1)] h-[120px] flex flex-col justify-between mt-2 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer">
                                  <div className="flex justify-between items-start">
                                      <span className="text-3xl font-extrabold">{upcomingCount}</span>
                                      <span className="text-4xl">🗓️</span>
                                  </div>
                                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Upcoming Event</span>
                             </div>

                             {/* Card 6 (Blue Doodle Style) */}
                             <div className="bg-[#E0F2FE] text-blue-950 border-2 border-gray-900 rounded-3xl p-5 shadow-[2px_2px_0px_rgba(0,0,0,1)] h-[120px] flex flex-col justify-between hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer mt-2 relative overflow-hidden">
                                  <div className="absolute top-0 left-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                                  <div className="flex justify-between items-start relative z-10">
                                      <span className="text-3xl font-extrabold text-blue-950">{0}</span>
                                      <div className="text-4xl">🏋️‍♂️</div>
                                  </div>
                                  <span className="text-xs font-bold uppercase tracking-widest text-blue-900 relative z-10">Workout Record</span>
                             </div>
                        </div>

                        {/* Pomodoro Timer */}
                        <div className="md:col-span-2 bg-[#FFEDD5] text-orange-950 rounded-[2rem] border-2 border-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] p-8 flex flex-col items-center justify-center relative overflow-hidden">
                             <div className="absolute top-8 left-8 w-3 h-3 border-2 border-gray-900 rounded-full"></div>
                             <div className="absolute top-12 right-12 text-2xl font-bold">☀️</div>
                             <div className="absolute bottom-16 right-10 w-2 h-2 rounded-full bg-red-400"></div>
                             
                             <div className="w-36 h-36 bg-white rounded-2xl border-4 border-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-8 relative mt-4 overflow-hidden">
                                 <ClockIcon className="w-16 h-16 text-[#f76332] relative z-10" />
                                 <div className="absolute top-1 right-1.5 w-6 h-6 border-2 border-gray-900 text-gray-900 flex items-center justify-center rounded bg-white shadow-[1px_1px_0px_rgba(0,0,0,1)] text-[10px] font-bold rotate-12 z-20">Z</div>
                             </div>

                             <div className="flex items-center gap-2 text-[10px] font-extrabold text-gray-500 tracking-widest mb-1 uppercase">
                                 <span className={`w-2 h-2 rounded-full ${isTimerRunning ? 'bg-[#f76332] animate-pulse' : 'bg-gray-300'}`}></span> Session Timer
                             </div>
                             <h2 className={`text-[2.75rem] font-black tracking-tight text-gray-900 mb-8 tabular-nums font-mono transition-opacity ${!isTimerRunning && 'opacity-50'}`}>
                                 {formatTime(sessionTime)}
                             </h2>

                             <div className="flex items-center justify-between w-full max-w-[240px]">
                                 <button onClick={() => setSessionTime(0)} title="Reset Timer" className="text-gray-400 hover:text-gray-900 transition-colors"><RotateCcw className="w-5 h-5"/></button>
                                 <button onClick={() => toast.success("Notifications enabled for this session")} className="text-gray-400 hover:text-gray-900 transition-colors"><Bell className="w-5 h-5"/></button>
                                 <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="w-16 h-16 bg-[#f76332] rounded-2xl flex items-center justify-center hover:scale-[1.05] transition-transform shadow-[2px_2px_0px_rgba(0,0,0,1)] border-2 border-gray-900 flex-shrink-0">
                                     {isTimerRunning ? (
                                         <Pause className="w-7 h-7 text-white fill-current"/>
                                     ) : (
                                         <Play className="w-7 h-7 text-white fill-current ml-1"/>
                                     )}
                                 </button>
                                 <button onClick={() => toast.success("Focus music activated")} className="text-gray-400 hover:text-gray-900 transition-colors"><Music className="w-5 h-5"/></button>
                                 <Link to="/notes" className="text-gray-400 hover:text-gray-900 transition-colors"><StickyNote className="w-5 h-5"/></Link>
                             </div>
                        </div>
                    </div>

                    {/* Mentors Row */}
                    {myMentors.length > 0 && (
                        <div className="mb-14">
                            <h3 className="text-[1.35rem] font-black text-gray-900 mb-6 uppercase">My Mentors</h3>
                            <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar">
                                {myMentors.map((mentor, i) => (
                                    <Link to={`/dashboard-mentors`} key={i} className="flex items-center gap-4 min-w-[max-content] cursor-pointer group">
                                        <div className="relative">
                                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] group-hover:-translate-y-0.5 transition-transform overflow-hidden">
                                                {mentor?.avatar_url ? <img src={mentor.avatar_url} className="w-full h-full object-cover" /> : "👨‍🏫"}
                                            </div>
                                            <span className={`absolute bottom-0 right-0 w-3 h-3 bg-[#3bc987] border-2 border-gray-900 rounded-full`}></span>
                                        </div>
                                        <div>
                                            <p className="font-extrabold text-gray-900 text-[15px]">{mentor.name}</p>
                                            <p className="text-xs font-semibold text-gray-400 mt-0.5">{mentor.company || 'Mentor'}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* My Life Goals */}
                    <div>
                        <div className="flex items-center justify-between mb-8">
                             <h3 className="text-[1.35rem] font-black text-gray-900 uppercase">My Life Goals</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-8 gap-y-10 items-start">
                             {goalCategories.map((cat, idx) => (
                                 <div 
                                     key={cat.id} 
                                     className="bg-white border-2 border-gray-900 rounded-3xl shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)] p-4 relative group"
                                 >
                                     <div className="flex items-center justify-between mb-4 px-3 pt-2">
                                         <h4 className="font-extrabold text-gray-900">{cat.name}</h4>
                                         <button onClick={(e) => handleDeleteCategory(cat.id, e)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-colors">
                                             <Trash2 className="w-4 h-4" />
                                         </button>
                                     </div>
                                     <div className="space-y-1.5 min-h-[100px]">
                                         {cat.items.length === 0 && <span className="text-gray-400 text-sm px-3 italic">No goals yet...</span>}
                                         {cat.items.slice(0, 5).map(item => (
                                             <div key={item.id} className="flex items-center gap-3.5 px-4 py-2.5 bg-transparent hover:bg-gray-50 rounded-[20px] transition-colors relative group/item">
                                                 <Target className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                 <span className="text-[14px] font-bold text-gray-650 truncate">{item.text}</span>
                                             </div>
                                         ))}
                                         {cat.items.length > 5 && <div className="text-xs text-gray-400 font-bold ml-10">+{cat.items.length - 5} more</div>}
                                     </div>
                                     <button 
                                         onClick={() => { setActiveGoalCategoryId(cat.id); setIsGoalItemModalOpen(true); }}
                                         className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gray-50/50 hover:bg-indigo-50/50 hover:text-[#5763f6] text-gray-400 font-bold text-sm transition-colors border border-dashed border-gray-250"
                                     >
                                         <Plus className="w-4 h-4"/> Manage Goals
                                     </button>
                                 </div>
                             ))}

                             {/* Add Category Button */}
                             <div 
                                 onClick={() => setIsCategoryModalOpen(true)}
                                 className="rounded-3xl border-2 border-dashed border-gray-900 mt-2 hover:border-indigo-500 hover:bg-indigo-50/20 transition-all flex items-center justify-center cursor-pointer h-[200px]"
                             >
                                 <span className="flex items-center gap-2 text-[15px] font-bold text-gray-400 hover:text-[#5763f6] transition-colors">
                                     <Plus className="w-5 h-5"/> New Goal List
                                 </span>
                             </div>
                        </div>
                    </div>

                </div>

                {/* Right Sidebar (Lilac section) */}
                <div className="w-full xl:w-[380px] bg-[#FAF9F6] p-8 md:p-10 flex flex-col xl:min-h-screen border-l-2 border-gray-900 relative z-0">
                    
                    {/* Profile */}
                    <div className="flex flex-col items-center mt-2 mb-12 relative z-10 w-full max-w-[280px] mx-auto">
                         <div 
                            onClick={handleNextAvatar}
                            className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)] border-2 border-gray-900 mb-5 relative overflow-hidden cursor-pointer hover:scale-105 transition-transform group"
                            title="Click to change avatar"
                         >
                              {profile?.avatar_url ? (
                                  <img src={profile.avatar_url} className="w-full h-full object-cover" />
                              ) : (
                                  <img src={avatarList[avatarIndex]} className="w-full h-full object-cover group-hover:rotate-12 transition-transform" />
                              )}
                         </div>
                         <h3 className="text-[1.35rem] font-black text-gray-900 leading-tight mb-1 text-center uppercase">{firstName} {profile?.full_name?.split(' ')[1] || 'Funny'}</h3>
                         <div className="flex flex-col items-center gap-1.5 mb-6">
                             <p className="text-[13px] font-bold text-gray-500 tracking-wide">Free Plan</p>
                             <div 
                                 className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-gray-900 bg-white text-[11px] font-mono font-bold text-indigo-600 select-all shadow-[1px_1px_0px_rgba(0,0,0,1)] group/code cursor-pointer hover:bg-gray-50 transition-colors" 
                                 title="Click to copy unique ID" 
                                 onClick={() => {
                                     navigator.clipboard.writeText(getUniqueCode(user?.id));
                                     toast.success("Unique ID copied to clipboard!");
                                 }}
                             >
                                 <span>{getUniqueCode(user?.id)}</span>
                                 <Copy className="w-3.5 h-3.5 opacity-60 group-hover/code:opacity-100 transition-opacity" />
                             </div>
                         </div>
                         <button onClick={() => navigate('/profile')} className="w-full py-3 rounded-2xl border-2 border-gray-900 text-gray-900 font-extrabold text-sm bg-white hover:bg-gray-50 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                             Edit Profile
                         </button>
                    </div>

                    {/* Next Deadline */}
                    <div className="mb-10 relative z-10 w-full">
                        <h3 className="text-[1.35rem] font-black text-gray-900 mb-6 uppercase">Next Deadline</h3>
                        
                        {/* Calendar Ribbon */}
                        <div className="flex justify-between items-center bg-white p-2.5 border-2 border-gray-900 rounded-3xl shadow-[2px_2px_0px_rgba(0,0,0,1)] mb-8">
                            {getNextDays().map((d) => (
                              <div 
                                key={d.fullDate.getTime()} 
                                onClick={() => setSelectedDate(d.fullDate)}
                                className={`flex flex-col items-center justify-center p-2 rounded-2xl w-[50px] h-[68px] cursor-pointer transition-all ${d.active ? 'bg-indigo-650 bg-indigo-600 text-white border-2 border-gray-900 shadow-[1px_1px_0px_rgba(0,0,0,1)]' : 'text-gray-400 hover:bg-gray-50'}`}
                              >
                                  <span className={`text-[11px] font-extrabold uppercase tracking-widest mb-0.5 ${d.active ? 'text-purple-100' : ''}`}>{d.day}</span>
                                  <span className={`text-[1.35rem] font-black ${d.active ? 'text-white' : 'text-gray-900'}`}>{d.date}</span>
                              </div>
                            ))}
                        </div>

                        {/* Dynamic Project Cards */}
                        <div className="space-y-4">
                            {activeProjects.length === 0 ? (
                                <div className="text-center p-6 bg-white rounded-3xl border-2 border-dashed border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                    <p className="text-gray-400 font-bold mb-3">No active projects yet.</p>
                                </div>
                            ) : (
                                activeProjects.map(p => (
                                    <div key={p.id} className="bg-white rounded-3xl p-6 shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)] border-2 border-gray-900 relative overflow-hidden cursor-pointer hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none transition-all group">
                                        <div className="absolute top-0 left-0 w-2 h-full bg-[#818CF8]"></div>
                                        
                                        <div className="flex justify-between items-start mb-2 pl-3">
                                            <span className="text-[10px] font-black text-gray-450 uppercase tracking-widest flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span> {p.theme} <ChevronRight className="w-2.5 h-2.5"/> ONGOING
                                            </span>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={(e) => handleEditActiveProject(p, e)} className="p-1 text-gray-400 hover:text-gray-900"><Settings className="w-4 h-4"/></button>
                                                <button onClick={(e) => handleDeleteActiveProject(p.id, e)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                                            </div>
                                        </div>
                                        <h4 className="text-[1.35rem] font-black text-gray-900 mb-6 pl-3">{p.name}</h4>
                                        
                                        <div className="flex items-center justify-between pl-3 mb-6 pr-1">
                                            <div className="flex -space-x-2">
                                                {p.teamType === 'solo' ? (
                                                     <div className="w-8 h-8 rounded-full bg-indigo-50 border-2 border-gray-900 flex justify-center items-center text-sm shadow-sm z-10">🧔</div>
                                                ) : (
                                                     Array.from({ length: Math.min(3, p.teamCount) }).map((_, idx) => (
                                                          <div key={idx} className="w-8 h-8 rounded-full bg-indigo-50 border-2 border-gray-900 flex justify-center items-center text-sm shadow-sm" style={{ zIndex: 10 - idx }}>👦</div>
                                                      ))
                                                )}
                                                {p.teamType === 'team' && p.teamCount > 3 && (
                                                     <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-gray-900 flex justify-center items-center text-xs font-bold text-gray-400 shadow-sm z-0">+{p.teamCount - 3}</div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 border border-gray-300 rounded-lg">
                                                 <CheckSquare className="w-4 h-4 text-gray-400"/> {p.workLeft}
                                            </div>
                                            <div className="flex items-center gap-1 text-[11px] font-bold text-[#fc4445] bg-red-50 px-2 py-1 border border-red-200 rounded-lg truncate max-w-[100px]">
                                                 <ClockIcon className="w-3.5 h-3.5 flex-shrink-0"/> <span className="truncate">{p.deadline || 'No date'}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="pl-3">
                                            <div className="flex justify-between items-center mb-2 text-[11px] font-extrabold uppercase tracking-wide">
                                                 <span className="text-gray-400">Progress</span>
                                                 <span className="text-[#f7aa32]">{p.progress}%</span>
                                            </div>
                                            <div className="h-3 bg-gray-100 border border-gray-900 rounded-xl overflow-hidden w-full p-0.5">
                                                 <div className="h-full bg-[#f7aa32] rounded-lg transition-all" style={{ width: `${p.progress}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            
                            <button onClick={handleOpenNewActiveProject} className="w-full bg-white border-2 border-dashed border-gray-900 rounded-2xl p-4 text-gray-400 font-bold hover:bg-gray-50 hover:text-gray-600 transition-all flex items-center justify-center gap-2">
                                <Plus className="w-5 h-5"/> Add Active Project
                            </button>
                        </div>
                    </div>
                </div>
            <StudentBookingDetailsModal
                isOpen={detailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                booking={selectedBooking}
                onBookingUpdated={handleBookingUpdated}
            />

            {isTodoModalOpen && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity font-mono">
                    <div className="bg-[#FAF9F6] border-2 border-gray-900 rounded-3xl p-6 w-full max-w-md shadow-[4px_4px_0px_rgba(0,0,0,1)] relative flex flex-col max-h-[80vh]">
                        <button onClick={() => setIsTodoModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 border-2 border-gray-900 p-1.5 rounded-lg bg-white shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                            <X className="w-5 h-5"/>
                        </button>
                        
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-[#eff3ff] border-2 border-gray-900 rounded-xl flex items-center justify-center shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                                <CheckSquare className="w-5 h-5 text-[#5763f6]" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 uppercase">To-do List</h2>
                        </div>

                        {/* Input Area */}
                        <div className="flex items-center gap-2 mb-6">
                            <input 
                                type="text"
                                value={newTodo}
                                onChange={(e) => setNewTodo(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
                                placeholder="Add a new task..."
                                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-900 outline-none focus:ring-2 focus:ring-indigo-150 transition-all font-bold text-gray-900 bg-white"
                            />
                            <button 
                                onClick={handleAddTodo}
                                className="bg-[#5763f6] text-white p-3 rounded-xl border-2 border-gray-900 hover:bg-indigo-650 shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex-shrink-0"
                            >
                                <Plus className="w-5 h-5"/>
                            </button>
                        </div>

                        {/* List Area */}
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 hide-scrollbar min-h-[200px]">
                            {todos.length === 0 ? (
                                <p className="text-center text-gray-400 mt-10 font-bold italic">All caught up! Add a task.</p>
                            ) : (
                                todos.map((t) => (
                                    <div key={t.id} className="flex items-center justify-between p-3 rounded-xl border-2 border-gray-900 bg-white shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:bg-gray-50/50 transition-colors group">
                                        <div className="flex items-center gap-3 flex-1">
                                            <button 
                                                onClick={() => handleToggleTodo(t.id)} 
                                                className={`w-6 h-6 rounded-md flex items-center justify-center border-2 border-gray-900 transition-colors flex-shrink-0 ${t.completed ? 'bg-[#3bc987] border-[#3bc987] text-white' : 'border-gray-300 text-transparent hover:border-[#3bc987]'}`}
                                            >
                                                <Check className="w-4 h-4"/>
                                            </button>
                                            
                                            {editingTodoId === t.id ? (
                                                <input 
                                                    type="text"
                                                    value={editingTodoText}
                                                    onChange={(e) => setEditingTodoText(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(t.id)}
                                                    onBlur={() => handleSaveEdit(t.id)}
                                                    autoFocus
                                                    className="flex-1 bg-white border-2 border-gray-900 px-2 py-1 rounded outline-none font-bold text-gray-900"
                                                />
                                            ) : (
                                                <span 
                                                    onDoubleClick={() => {
                                                        setEditingTodoId(t.id);
                                                        setEditingTodoText(t.text);
                                                    }}
                                                    className={`font-bold transition-colors flex-1 cursor-text select-none ${t.completed ? 'opacity-50 line-through text-gray-400' : 'text-gray-900'}`}
                                                    title="Double-click to edit"
                                                >
                                                    {t.text}
                                                </span>
                                            )}
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteTodo(t.id)}
                                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1 flex-shrink-0"
                                            title="Delete"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Notes Modal */}
            {isNotesModalOpen && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity font-mono">
                    <div className="bg-[#FAF9F6] border-2 border-gray-900 rounded-3xl p-6 w-full max-w-md shadow-[4px_4px_0px_rgba(0,0,0,1)] relative flex flex-col h-[70vh] max-h-[600px]">
                        <button onClick={() => { setIsNotesModalOpen(false); handleSaveNote(); }} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 border-2 border-gray-900 p-1.5 rounded-lg bg-white shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] z-10">
                            <X className="w-5 h-5"/>
                        </button>

                        {activeNoteId ? (
                            <>
                                <div className="flex items-center gap-3 mb-4">
                                    <button onClick={handleSaveNote} className="w-10 h-10 bg-white hover:bg-gray-100 rounded-xl border-2 border-gray-900 flex items-center justify-center shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-colors">
                                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                                    </button>
                                    <h2 className="text-xl font-black text-gray-900 uppercase">Editing Note</h2>
                                </div>
                                <textarea
                                    value={activeNoteText}
                                    onChange={(e) => setActiveNoteText(e.target.value)}
                                    placeholder="Write your note here..."
                                    className="flex-1 w-full bg-yellow-50/50 border-2 border-gray-900 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-150 resize-none font-bold text-gray-900 leading-relaxed shadow-inner transition-all"
                                    autoFocus
                                />
                                <div className="mt-4 flex justify-end">
                                    <button onClick={handleSaveNote} className="bg-[#efdc4d] text-yellow-900 font-extrabold px-6 py-2.5 rounded-xl border-2 border-gray-900 hover:bg-yellow-400 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                                        Save Note
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-[#fffdf0] border-2 border-gray-900 rounded-xl flex items-center justify-center shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                                        <FileText className="w-5 h-5 text-[#efdc4d]" />
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900 uppercase">Notes</h2>
                                    <button onClick={handleCreateNote} className="ml-auto bg-[#efdc4d] text-yellow-900 p-2.5 rounded-xl border-2 border-gray-900 hover:bg-yellow-400 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all mr-10">
                                        <Plus className="w-5 h-5"/>
                                    </button>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto space-y-3 pr-2 hide-scrollbar">
                                    {notes.length === 0 ? (
                                        <div className="text-center mt-12">
                                            <div className="w-16 h-16 bg-white border-2 border-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                                                <FileText className="w-8 h-8 text-yellow-500"/>
                                            </div>
                                            <p className="text-gray-400 font-bold tracking-wide italic">No notes yet. Create one!</p>
                                        </div>
                                    ) : (
                                        notes.map(n => (
                                            <div 
                                                key={n.id} 
                                                onClick={() => handleOpenNote(n.id, n.text)}
                                                className="p-4 rounded-2xl border-2 border-gray-900 bg-white hover:bg-gray-50/50 transition-all cursor-pointer group flex gap-3 h-[100px] shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                                            >
                                                <div className="flex-1 overflow-hidden relative">
                                                    <p className="font-bold text-gray-800 text-sm whitespace-pre-wrap line-clamp-3">
                                                        {n.text || <span className="text-gray-450 italic">Empty note...</span>}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col justify-between items-end">
                                                    <button 
                                                        onClick={(e) => handleDeleteNote(n.id, e)}
                                                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1"
                                                    >
                                                        <Trash2 className="w-4 h-4"/>
                                                    </button>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(n.updatedAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Projects Modal */}
            {isProjectsModalOpen && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity font-mono">
                    <div className="bg-[#FAF9F6] border-2 border-gray-900 rounded-3xl p-6 w-full max-w-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)] relative flex flex-col md:flex-row h-[85vh] max-h-[700px] overflow-hidden gap-6">
                        <button onClick={() => setIsProjectsModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 border-2 border-gray-900 p-1.5 rounded-lg bg-white shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] z-10">
                            <X className="w-5 h-5"/>
                        </button>
                        
                        {/* Form Column */}
                        <div className="w-full md:w-1/2 flex flex-col pt-2 hide-scrollbar overflow-y-auto pr-2">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-[#fff1f5] border-2 border-gray-900 rounded-xl flex items-center justify-center flex-shrink-0 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                                    <Code className="w-5 h-5 text-[#ff6896]" />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 uppercase">{editingProjectId ? "Edit Project" : "Add Project"}</h2>
                            </div>
                            
                            <div className="space-y-4 flex-1">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 pl-1">Project Title</label>
                                    <input 
                                        type="text"
                                        value={projectForm.title}
                                        onChange={e => setProjectForm({...projectForm, title: e.target.value})}
                                        placeholder="e.g. E-Commerce Dashboard"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-900 outline-none focus:ring-2 focus:ring-pink-50 transition-all font-bold text-gray-900 bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 pl-1">GitHub Repository</label>
                                    <div className="relative">
                                        <Github className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                                        <input 
                                            type="text"
                                            value={projectForm.github}
                                            onChange={e => setProjectForm({...projectForm, github: e.target.value})}
                                            placeholder="https://github.com/..."
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-900 outline-none focus:ring-2 focus:ring-pink-50 transition-all font-bold text-gray-900 bg-white"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 pl-1">Deployed Link</label>
                                    <div className="relative">
                                        <Link2 className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                                        <input 
                                            type="text"
                                            value={projectForm.deployed}
                                            onChange={e => setProjectForm({...projectForm, deployed: e.target.value})}
                                            placeholder="https://my-app.vercel.app"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-900 outline-none focus:ring-2 focus:ring-pink-50 transition-all font-bold text-gray-900 bg-white"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 pl-1">Documentation</label>
                                    <div className="relative">
                                        <FileText className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                                        <input 
                                            type="text"
                                            value={projectForm.doc}
                                            onChange={e => setProjectForm({...projectForm, doc: e.target.value})}
                                            placeholder="Figma / Notion / Doc URL"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-900 outline-none focus:ring-2 focus:ring-pink-50 transition-all font-bold text-gray-900 bg-white"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-6 flex gap-3">
                                {editingProjectId && (
                                    <button 
                                        onClick={() => { setEditingProjectId(null); setProjectForm({ title: '', github: '', deployed: '', doc: '' }); }}
                                        className="px-6 py-3 rounded-xl border-2 border-gray-900 font-bold text-gray-700 bg-white hover:bg-gray-50 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button 
                                    onClick={handleSaveProject}
                                    disabled={!projectForm.title.trim()}
                                    className={`flex-1 px-6 py-3 rounded-xl font-bold border-2 border-gray-900 transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none ${projectForm.title.trim() ? 'bg-[#ff6896] text-white hover:bg-pink-500' : 'bg-gray-100 text-gray-400 opacity-50'}`}
                                >
                                    {editingProjectId ? 'Save Changes' : 'Add Project'}
                                </button>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="hidden md:block w-px bg-gray-300 mx-2"></div>
                        <div className="md:hidden h-px bg-gray-300 my-4"></div>

                        {/* View Column */}
                        <div className="w-full md:w-1/2 flex flex-col hide-scrollbar overflow-y-auto pr-2">
                            <h3 className="text-lg font-black text-gray-900 mb-4 pt-2 uppercase">Saved Projects</h3>
                            <div className="flex-1 space-y-4 pb-12">
                                {projects.length === 0 ? (
                                    <div className="text-center mt-16 px-4">
                                        <div className="w-16 h-16 bg-white border-2 border-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] border-dashed">
                                            <Code className="w-8 h-8 text-gray-300"/>
                                        </div>
                                        <p className="text-gray-400 font-bold text-sm italic">No projects yet. <br/>Add your portfolio highlights here!</p>
                                    </div>
                                ) : (
                                    projects.map(p => (
                                        <div key={p.id} className={`p-4 rounded-2xl border-2 border-gray-900 bg-white transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] ${editingProjectId === p.id ? 'border-[#ff6896] bg-pink-50/20' : 'hover:bg-gray-50'}`}>
                                            <div className="flex justify-between items-start mb-2 group">
                                                <h4 className="font-extrabold text-gray-900 leading-tight pr-8">{p.title}</h4>
                                                <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleEditProject(p)} className="p-1.5 text-gray-400 hover:text-[#ff6896] rounded-md transition-colors"><Settings className="w-4 h-4"/></button>
                                                    <button onClick={(e) => handleDeleteProject(p.id, e)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-md transition-colors"><Trash2 className="w-4 h-4"/></button>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 mt-3">
                                                {p.github && (
                                                    <a href={p.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold text-gray-650 hover:text-[#ff6896] transition-colors bg-white border border-gray-200 rounded-lg p-2 truncate">
                                                        <Github className="w-3.5 h-3.5 flex-shrink-0"/> <span className="truncate">{p.github.replace('https://github.com/','')}</span>
                                                    </a>
                                                )}
                                                {p.deployed && (
                                                    <a href={p.deployed} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold text-gray-650 hover:text-[#ff6896] transition-colors bg-white border border-gray-200 rounded-lg p-2 truncate">
                                                        <Link2 className="w-3.5 h-3.5 flex-shrink-0"/> <span className="truncate">Live Demo</span>
                                                    </a>
                                                )}
                                                {p.doc && (
                                                    <a href={p.doc} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold text-gray-650 hover:text-[#ff6896] transition-colors bg-white border border-gray-200 rounded-lg p-2 truncate">
                                                        <FileText className="w-3.5 h-3.5 flex-shrink-0"/> <span className="truncate">Documentation</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* New Category Modal */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity font-mono">
                    <div className="bg-[#FAF9F6] border-2 border-gray-900 rounded-3xl p-6 w-full max-w-sm shadow-[4px_4px_0px_rgba(0,0,0,1)] relative flex flex-col">
                        <button onClick={() => setIsCategoryModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 border-2 border-gray-900 p-1.5 rounded-lg bg-white shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                            <X className="w-5 h-5"/>
                        </button>
                        <h2 className="text-xl font-black text-gray-900 mb-6 uppercase">Create Goal List</h2>
                        <input 
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                            placeholder="e.g. Dream Vacations"
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-900 outline-none focus:ring-2 focus:ring-indigo-150 transition-all font-bold text-gray-905 bg-white mb-4"
                            autoFocus
                        />
                        <button 
                            onClick={handleAddCategory}
                            disabled={!newCategoryName.trim()}
                            className={`w-full py-3 rounded-xl border-2 border-gray-900 font-bold transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none ${newCategoryName.trim() ? 'bg-[#5763f6] text-white hover:bg-indigo-600' : 'bg-gray-100 text-gray-400 opacity-50'}`}
                        >
                            Create List
                        </button>
                    </div>
                </div>
            )}

            {/* Goal Items Modal */}
            {isGoalItemModalOpen && activeGoalCategoryId && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity font-mono">
                    <div className="bg-[#FAF9F6] border-2 border-gray-900 rounded-3xl p-6 w-full max-w-md shadow-[4px_4px_0px_rgba(0,0,0,1)] relative flex flex-col max-h-[80vh]">
                        <button onClick={() => setIsGoalItemModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 border-2 border-gray-900 p-1.5 rounded-lg bg-white shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                            <X className="w-5 h-5"/>
                        </button>
                        
                        <div className="flex items-center gap-3 mb-6 pr-8">
                            <div className="w-10 h-10 bg-indigo-50 border-2 border-gray-900 rounded-xl flex items-center justify-center shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                                <Target className="w-5 h-5 text-indigo-500" />
                            </div>
                            <h2 className="text-xl font-black text-gray-900 truncate uppercase">{goalCategories.find(c => c.id === activeGoalCategoryId)?.name}</h2>
                        </div>

                        {/* Input Area */}
                        <div className="flex items-center gap-2 mb-6">
                            <input 
                                type="text"
                                value={newGoalText}
                                onChange={(e) => setNewGoalText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddGoalItem()}
                                placeholder="Add a new goal..."
                                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-900 outline-none focus:ring-2 focus:ring-indigo-150 transition-all font-bold text-gray-900 bg-white"
                            />
                            <button 
                                onClick={handleAddGoalItem}
                                className="bg-[#5763f6] text-white p-3 rounded-xl border-2 border-gray-900 hover:bg-indigo-600 shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex-shrink-0"
                            >
                                <Plus className="w-5 h-5"/>
                            </button>
                        </div>

                        {/* List Area */}
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 hide-scrollbar min-h-[200px]">
                            {goalCategories.find(c => c.id === activeGoalCategoryId)?.items.length === 0 ? (
                                <p className="text-center text-gray-400 mt-10 font-bold italic">No goals here yet!</p>
                            ) : (
                                goalCategories.find(c => c.id === activeGoalCategoryId)?.items.map((i) => (
                                    <div key={i.id} className="flex items-center justify-between p-3 rounded-xl border-2 border-gray-900 bg-white shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:bg-gray-50/50 transition-colors group">
                                        <div className="flex items-center gap-3 flex-1">
                                            <Target className="w-4 h-4 text-[#5763f6] flex-shrink-0"/>
                                            {editingGoalId === i.id ? (
                                                <input 
                                                    type="text"
                                                    value={editingGoalText}
                                                    onChange={(e) => setEditingGoalText(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEditGoal(i.id)}
                                                    onBlur={() => handleSaveEditGoal(i.id)}
                                                    autoFocus
                                                    className="flex-1 bg-white border-2 border-gray-900 px-2 py-1 rounded outline-none font-bold text-gray-900"
                                                />
                                            ) : (
                                                <span 
                                                    onDoubleClick={() => {
                                                        setEditingGoalId(i.id);
                                                        setEditingGoalText(i.text);
                                                    }}
                                                    className="font-bold transition-colors flex-1 cursor-text select-none text-gray-805"
                                                    title="Double-click to edit"
                                                >
                                                    {i.text}
                                                </span>
                                            )}
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteGoalItem(i.id)}
                                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1 flex-shrink-0"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Active Project Form Modal */}
            {isActiveProjectModalOpen && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity font-mono">
                    <div className="bg-[#FAF9F6] border-2 border-gray-900 rounded-3xl p-6 w-full max-w-md shadow-[4px_4px_0px_rgba(0,0,0,1)] relative flex flex-col max-h-[90vh]">
                        <button onClick={() => setIsActiveProjectModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 border-2 border-gray-900 p-1.5 rounded-lg bg-white shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                            <X className="w-5 h-5"/>
                        </button>
                        
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-[#fffdf0] border-2 border-gray-900 rounded-xl flex items-center justify-center shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                                <Target className="w-5 h-5 text-[#efdc4d]" />
                            </div>
                            <h2 className="text-xl font-black text-gray-900 uppercase">{editingActiveProjectId ? "Edit Project" : "New Active Project"}</h2>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 hide-scrollbar">
                           <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 pl-1">Project Name</label>
                                <input 
                                    type="text"
                                    value={activeProjectForm.name}
                                    onChange={e => setActiveProjectForm({...activeProjectForm, name: e.target.value})}
                                    placeholder="e.g. Ignite Hackathon"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-900 outline-none focus:ring-2 focus:ring-indigo-150 transition-all font-bold text-gray-900 bg-white"
                                />
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                               <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 pl-1">Deadline Date</label>
                                    <input 
                                        type="text"
                                        value={activeProjectForm.deadline}
                                        onChange={e => setActiveProjectForm({...activeProjectForm, deadline: e.target.value})}
                                        placeholder="e.g. Wed, 25 Nov"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-900 outline-none focus:ring-2 focus:ring-indigo-150 transition-all font-bold text-gray-900 bg-white"
                                    />
                               </div>
                               <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 pl-1">Theme / Category</label>
                                    <input 
                                        type="text"
                                        value={activeProjectForm.theme}
                                        onChange={e => setActiveProjectForm({...activeProjectForm, theme: e.target.value})}
                                        placeholder="e.g. AI Dev"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-900 outline-none focus:ring-2 focus:ring-indigo-150 transition-all font-bold text-gray-900 bg-white"
                                    />
                               </div>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                               <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 pl-1">Amount of Work</label>
                                    <input 
                                        type="text"
                                        value={activeProjectForm.workLeft}
                                        onChange={e => setActiveProjectForm({...activeProjectForm, workLeft: e.target.value})}
                                        placeholder="e.g. 3/5 Tasks"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-900 outline-none focus:ring-2 focus:ring-indigo-150 transition-all font-bold text-gray-900 bg-white"
                                    />
                               </div>
                               <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 pl-1">Team Details</label>
                                    <div className="flex gap-2">
                                         <select 
                                             value={activeProjectForm.teamType} 
                                             onChange={e => setActiveProjectForm({...activeProjectForm, teamType: e.target.value as any})}
                                             className="w-1/2 px-2 py-3 rounded-xl border-2 border-gray-900 bg-white outline-none focus:ring-2 focus:ring-indigo-150 font-bold text-gray-900"
                                         >
                                             <option value="solo">Solo</option>
                                             <option value="team">Team</option>
                                         </select>
                                         <input 
                                             type="number"
                                             value={activeProjectForm.teamCount}
                                             min="1"
                                             onChange={e => setActiveProjectForm({...activeProjectForm, teamCount: Number(e.target.value)})}
                                             disabled={activeProjectForm.teamType === 'solo'}
                                             className={`w-1/2 px-2 py-3 rounded-xl border-2 border-gray-900 bg-white outline-none focus:ring-2 focus:ring-indigo-150 font-bold text-gray-900 ${activeProjectForm.teamType === 'solo' ? 'bg-gray-100 opacity-50' : ''}`}
                                         />
                                    </div>
                                </div>
                           </div>
                           <div>
                                <label className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 pl-1">
                                    <span>Progress</span>
                                    <span className="text-[#5763f6] bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">{activeProjectForm.progress}%</span>
                                </label>
                                <input 
                                    type="range"
                                    min="0" max="100"
                                    value={activeProjectForm.progress}
                                    onChange={e => setActiveProjectForm({...activeProjectForm, progress: Number(e.target.value)})}
                                    className="w-full accent-[#5763f6]"
                                />
                           </div>
                        </div>

                        <button 
                            onClick={handleSaveActiveProject}
                            disabled={!activeProjectForm.name.trim()}
                            className={`w-full mt-6 py-3 rounded-xl border-2 border-gray-900 font-bold transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none ${activeProjectForm.name.trim() ? 'bg-[#5763f6] text-white hover:bg-indigo-650' : 'bg-gray-100 text-gray-400 opacity-50'}`}
                        >
                            {editingActiveProjectId ? 'Save Changes' : 'Create Project'}
                        </button>
                    </div>
                </div>
            )}
            </div>
        </DashboardLayout>
    );
}
