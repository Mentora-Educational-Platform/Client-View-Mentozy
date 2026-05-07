import { useState, useEffect } from 'react';
import {
    BookOpen, ChevronRight, Clock as ClockIcon,
    Search,
    Activity, Zap, Building2, Check, X, Bell,
    Flame, Trophy, GraduationCap, Target, Sparkles,
    Sun, Moon, Plus, CheckSquare, FileText, Palette,
    Pause, Music, SlidersHorizontal, Calendar as CalendarIcon,
    MoreVertical, RotateCcw, Play, Settings, ChevronLeft, Trash2, Code, Link2, Github
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
            <div style={{ fontFamily: '"Comic Sans MS", "Comic Sans", cursive' }} className="-m-4 md:-m-8 flex flex-col xl:flex-row min-h-[calc(100vh-4rem)] md:min-h-screen bg-white rounded-t-3xl overflow-hidden shadow-sm relative text-gray-900 tracking-tight">
                
                {/* Decorative scatter elements like in the shot */}
                <div className="absolute top-10 left-10 text-blue-500 font-bold text-xl opacity-80 pointer-events-none z-0">△</div>
                <div className="absolute top-14 right-1/2 text-gray-300 transform rotate-45 opacity-50 pointer-events-none z-0">+</div>

                {/* Left Column (Main App Area) */}
                <div className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto z-10">
                    
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-6">
                         <div className="flex items-center gap-4">
                              <h1 className="text-[2.5rem] font-extrabold text-gray-900 tracking-tight leading-none">Dashboard</h1>
                         </div>
                         
                         <div className="flex items-center gap-4">
                             <div className="hidden sm:flex items-center bg-gray-50 rounded-full p-1 border border-gray-100">
                                 <button className="p-2 bg-white rounded-full shadow-sm"><Sun className="w-4 h-4 text-gray-700"/></button>
                                 <button className="p-2"><Moon className="w-4 h-4 text-gray-400"/></button>
                             </div>
                             <button className="p-3 bg-white border border-gray-100 rounded-full hover:bg-gray-50 relative">
                                 <Bell className="w-5 h-5 text-gray-600"/>
                                 <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full"></span>
                             </button>
                             <button onClick={() => setIsCategoryModalOpen(true)} className="flex items-center justify-center gap-2 bg-[#5763f6] text-white px-5 py-2.5 md:py-3 rounded-full text-sm font-bold shadow-[0_10px_20px_rgba(87,99,246,0.3)] hover:scale-105 transition-transform whitespace-nowrap">
                                 <Plus className="w-4 h-4"/> New Page
                             </button>
                         </div>
                    </div>

                    {/* Organization Invitations Banner (Render if any) */}
                    {invites.length > 0 && (
                        <div className="mb-8 p-6 rounded-[24px] bg-indigo-50 border border-indigo-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                    <Building2 className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">New Invite to {invites[0]?.org?.full_name}</h3>
                                    <p className="text-sm text-gray-500">Join this organization as a student</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleRespondInvite(invites[0], true)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold">Accept</button>
                                <button onClick={() => handleRespondInvite(invites[0], false)} className="px-4 py-2 bg-gray-200 text-gray-600 rounded-xl text-sm font-bold">Decline</button>
                            </div>
                        </div>
                    )}

                    {/* Top Widgets Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
                        {/* 6 Cards Metric Area */}
                        <div className="md:col-span-3 grid grid-cols-2 gap-x-6 gap-y-6 relative">
                             {/* Card 1 */}
                             <div onClick={() => setIsTodoModalOpen(true)} className="bg-white border-2 border-slate-50 rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.02)] h-[120px] flex flex-col justify-between hover:-translate-y-1 transition-transform cursor-pointer">
                                  <div className="flex justify-between items-start">
                                      <span className="text-3xl font-extrabold">{todos.length}</span>
                                      <div className="w-12 h-12 bg-[#eff3ff] rounded-2xl flex items-center justify-center">
                                           <CheckSquare className="w-6 h-6 text-[#5763f6]" />
                                      </div>
                                  </div>
                                  <span className="text-sm font-bold text-gray-400 tracking-wide">To-do List</span>
                             </div>
                             
                             {/* Card 2 */}
                             <div onClick={() => setIsNotesModalOpen(true)} className="bg-white border-2 border-slate-50 rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.02)] h-[120px] flex flex-col justify-between hover:-translate-y-1 transition-transform cursor-pointer">
                                  <div className="flex justify-between items-start">
                                      <span className="text-3xl font-extrabold">{notes.length}</span>
                                      <div className="w-12 h-12 bg-[#fffdf0] rounded-2xl flex items-center justify-center">
                                           <div className="w-8 h-8 rounded bg-[#efdc4d]"></div>
                                      </div>
                                  </div>
                                  <span className="text-sm font-bold text-gray-400 tracking-wide">Personal Notes</span>
                             </div>

                             {/* Card 3 (Green Tilted) */}
                             <div onClick={() => window.open('https://mentozy.app/library', '_blank')} className="bg-gradient-to-br from-[#38df92] to-[#2bba74] border-t-2 border-l-2 border-white/20 rounded-[24px] p-5 shadow-[0_20px_40px_rgba(43,186,116,0.4)] h-[120px] flex flex-col justify-between transform -rotate-3 scale-[1.02] z-10 hover:rotate-0 hover:scale-100 transition-all cursor-pointer mt-1 relative overflow-hidden">
                                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                                  <div className="flex justify-between items-start relative z-10">
                                      <span className="text-4xl font-extrabold text-white leading-none">∞</span>
                                      <span className="text-4xl filter drop-shadow-md">📚</span>
                                  </div>
                                  <span className="text-sm font-bold text-emerald-50 tracking-wide relative z-10">Study Resources</span>
                             </div>

                             {/* Card 4 */}
                             <div onClick={() => setIsProjectsModalOpen(true)} className="bg-white border-2 border-slate-50 rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.02)] h-[120px] flex flex-col justify-between mt-1 hover:-translate-y-1 transition-transform cursor-pointer">
                                  <div className="flex justify-between items-start">
                                      <span className="text-3xl font-extrabold">{projects.length}</span>
                                      <div className="w-12 h-12 bg-[#fff1f5] rounded-full flex items-center justify-center">
                                           <Code className="w-6 h-6 text-[#ff6896]" />
                                      </div>
                                  </div>
                                  <span className="text-sm font-bold text-gray-400 tracking-wide">My Projects</span>
                             </div>

                             {/* Card 5 */}
                             <div className="bg-white border-2 border-slate-50 rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.02)] h-[120px] flex flex-col justify-between mt-2 hover:-translate-y-1 transition-transform cursor-pointer">
                                  <div className="flex justify-between items-start">
                                      <span className="text-3xl font-extrabold">{upcomingCount}</span>
                                      <span className="text-4xl filter drop-shadow-sm">🗓️</span>
                                  </div>
                                  <span className="text-sm font-bold text-gray-400 tracking-wide">Upcoming Event</span>
                             </div>

                             {/* Card 6 (Blue Tilted) */}
                             <div className="bg-gradient-to-br from-[#1d91fc] to-[#0477e0] border-t-2 border-l-2 border-white/20 rounded-[24px] p-5 shadow-[0_20px_40px_rgba(4,119,224,0.4)] h-[120px] flex flex-col justify-between transform rotate-3 scale-[1.03] z-10 hover:rotate-0 hover:scale-100 transition-all cursor-pointer mt-2 -ml-2 relative overflow-hidden">
                                  <div className="absolute top-0 left-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                                  <div className="flex justify-between items-start relative z-10">
                                      <span className="text-3xl font-extrabold text-white">{0}</span>
                                      <div className="text-4xl filter drop-shadow-md">🏋️‍♂️</div>
                                  </div>
                                  <span className="text-sm font-bold text-blue-50 tracking-wide relative z-10">Workout Record</span>
                             </div>
                        </div>

                        {/* Pomodoro Timer */}
                        <div className="md:col-span-2 bg-gradient-to-b from-white to-[#fff8f5] rounded-[32px] border-2 border-slate-50 shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-8 flex flex-col items-center justify-center relative overflow-hidden">
                             <div className="absolute top-8 left-8 w-3 h-3 border-4 border-[#3bc987] rounded-full"></div>
                             <div className="absolute top-12 right-12 text-yellow-400 text-2xl font-bold">☀️</div>
                             <div className="absolute bottom-16 right-10 w-2 h-2 rounded-full bg-red-400"></div>
                             
                             <div className="w-36 h-36 bg-[#ffe8df] rounded-full flex items-center justify-center mb-8 relative border-8 border-white shadow-xl shadow-orange-100 mt-4 overflow-hidden">
                                 <ClockIcon className="w-16 h-16 text-[#f76332] relative z-10" />
                                 {/* Orange handles mimicking the design */}
                                 <div className="absolute top-0 right-4 w-5 h-5 border-[3px] border-[#f76332] text-[#f76332] flex items-center justify-center rounded-full bg-white shadow-sm text-[10px] font-bold font-sans rotate-12 z-20">Z</div>
                                 <div className="absolute -top-1 w-8 h-8 bg-[#f76332] rounded-full transform -translate-y-1/2"></div>
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
                                 <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="w-16 h-16 bg-[#f76332] rounded-full flex items-center justify-center hover:scale-[1.05] transition-transform shadow-[0_15px_30px_rgba(247,99,50,0.35)] flex-shrink-0">
                                     {isTimerRunning ? (
                                         <Pause className="w-7 h-7 text-white fill-current"/>
                                     ) : (
                                         <Play className="w-7 h-7 text-white fill-current ml-1"/>
                                     )}
                                 </button>
                                 <button onClick={() => toast.success("Focus music activated")} className="text-gray-400 hover:text-gray-900 transition-colors"><Music className="w-5 h-5"/></button>
                                 <Link to="/settings" className="text-gray-400 hover:text-gray-900 transition-colors"><Settings className="w-5 h-5"/></Link>
                             </div>
                        </div>
                    </div>

                    {/* Mentors Row */}
                    {myMentors.length > 0 && (
                        <div className="mb-14">
                            <h3 className="text-[1.35rem] font-bold text-gray-900 mb-6">My Mentors</h3>
                            <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar">
                                {myMentors.map((mentor, i) => (
                                    <Link to={`/dashboard-mentors`} key={i} className="flex items-center gap-4 min-w-[max-content] cursor-pointer group">
                                        <div className="relative">
                                            <div className="w-14 h-14 bg-[#f8f9fc] rounded-full flex items-center justify-center text-3xl border border-gray-100 shadow-[0_5px_15px_rgba(0,0,0,0.05)] group-hover:-translate-y-1 transition-transform overflow-hidden">
                                                {mentor?.avatar_url ? <img src={mentor.avatar_url} className="w-full h-full object-cover" /> : "👨‍🏫"}
                                            </div>
                                            <span className={`absolute bottom-0 right-0 w-4 h-4 bg-[#3bc987] border-[3px] border-white rounded-full`}></span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-[15px]">{mentor.name}</p>
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
                             <h3 className="text-[1.35rem] font-bold text-gray-900">My Life Goals</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-8 gap-y-10 items-start">
                             {goalCategories.map((cat, idx) => (
                                 <div 
                                     key={cat.id} 
                                     className={idx % 2 !== 0 
                                         ? "bg-white border-2 border-slate-50 rounded-[28px] shadow-[0_20px_40px_rgba(0,0,0,0.04)] p-3 transform -skew-y-1 hover:skew-y-0 transition-transform relative group"
                                         : "relative group p-3"}
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
                                                 <span className="text-[14px] font-bold text-gray-600 truncate">{item.text}</span>
                                             </div>
                                         ))}
                                         {cat.items.length > 5 && <div className="text-xs text-gray-400 font-bold ml-10">+{cat.items.length - 5} more</div>}
                                     </div>
                                     <button 
                                         onClick={() => { setActiveGoalCategoryId(cat.id); setIsGoalItemModalOpen(true); }}
                                         className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-[20px] bg-gray-50/50 hover:bg-indigo-50/50 hover:text-[#5763f6] text-gray-400 font-bold text-sm transition-colors border border-dashed border-gray-200"
                                     >
                                         <Plus className="w-4 h-4"/> Manage Goals
                                     </button>
                                 </div>
                             ))}

                             {/* Add Category Button */}
                             <div 
                                 onClick={() => setIsCategoryModalOpen(true)}
                                 className="rounded-[28px] border-2 border-dashed border-gray-200 mt-2 hover:border-[#5763f6] hover:bg-indigo-50/20 transition-colors flex items-center justify-center cursor-pointer h-[200px]"
                             >
                                 <span className="flex items-center gap-2 text-[15px] font-bold text-gray-400 hover:text-[#5763f6] transition-colors">
                                     <Plus className="w-5 h-5"/> New Goal List
                                 </span>
                             </div>
                        </div>
                    </div>

                </div>

                {/* Right Sidebar (Lilac section) */}
                <div className="w-full xl:w-[380px] bg-[#f8f5ff] p-8 md:p-10 flex flex-col xl:min-h-screen border-l border-indigo-50 relative z-0">
                    {/* Decorative elements */}
                    <div className="absolute top-[15%] right-[-10px] w-14 h-14 border-2 border-[#3bc987] rounded-full opacity-60 pointer-events-none"></div>
                    <div className="absolute top-[35%] right-[-20px] w-24 h-24 border-2 border-[#3bc987] rounded-full opacity-30 pointer-events-none"></div>
                    
                    {/* Profile */}
                    <div className="flex flex-col items-center mt-2 mb-12 relative z-10 w-full max-w-[280px] mx-auto">
                         <div 
                            onClick={handleNextAvatar}
                            className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg mb-5 border-4 border-white/50 relative overflow-hidden cursor-pointer hover:scale-105 transition-transform group"
                            title="Click to change avatar"
                         >
                              {profile?.avatar_url ? (
                                  <img src={profile.avatar_url} className="w-full h-full object-cover" />
                              ) : (
                                  <img src={avatarList[avatarIndex]} className="w-full h-full object-cover group-hover:rotate-12 transition-transform" />
                              )}
                         </div>
                         <h3 className="text-[1.35rem] font-extrabold text-gray-900 leading-tight mb-1 text-center">{firstName} {profile?.full_name?.split(' ')[1] || 'Funny'}</h3>
                         <p className="text-[13px] font-bold text-gray-500 tracking-wide mb-6">Free Plan</p>
                         <button className="w-full py-3 rounded-full border-2 border-[#d0bcf9] text-[#8e54f5] font-extrabold text-sm bg-transparent hover:bg-white hover:border-[#a882f0] hover:shadow-md transition-all">
                             Edit Profile
                         </button>
                    </div>

                    {/* Next Deadline */}
                    <div className="mb-10 relative z-10 w-full">
                        <h3 className="text-[1.35rem] font-extrabold text-gray-900 mb-6">Next Deadline</h3>
                        
                        {/* Calendar Ribbon */}
                        <div className="flex justify-between items-center bg-white p-2.5 border border-slate-100 rounded-[24px] shadow-[0_15px_30px_rgba(0,0,0,0.03)] mb-8">
                            {getNextDays().map((d) => (
                              <div 
                                key={d.fullDate.getTime()} 
                                onClick={() => setSelectedDate(d.fullDate)}
                                className={`flex flex-col items-center justify-center p-2 rounded-[20px] w-[50px] h-[68px] cursor-pointer transition-all ${d.active ? 'bg-[#985bf4] text-white shadow-[0_10px_20px_rgba(152,91,244,0.3)]' : 'text-gray-400 hover:bg-gray-50'}`}
                              >
                                  <span className={`text-[11px] font-extrabold uppercase tracking-widest mb-0.5 ${d.active ? 'text-purple-100' : ''}`}>{d.day}</span>
                                  <span className={`text-[1.35rem] font-black ${d.active ? 'text-white' : 'text-gray-900'}`}>{d.date}</span>
                              </div>
                            ))}
                        </div>

                        {/* Dynamic Project Cards */}
                        <div className="space-y-4">
                            {activeProjects.length === 0 ? (
                                <div className="text-center p-6 bg-white rounded-[24px] border border-dashed border-gray-200">
                                    <p className="text-gray-400 font-bold mb-3">No active projects yet.</p>
                                </div>
                            ) : (
                                activeProjects.map(p => (
                                    <div key={p.id} className="bg-white rounded-[24px] p-6 shadow-[0_15px_40px_rgba(0,0,0,0.04)] border border-gray-50/50 relative overflow-hidden cursor-pointer hover:-translate-y-1 transition-transform group">
                                        <div className="absolute top-0 left-0 w-2 h-full bg-[#985bf4]"></div>
                                        
                                        <div className="flex justify-between items-start mb-2 pl-3">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
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
                                                     <div className="w-8 h-8 rounded-full bg-indigo-50 border-2 border-white flex justify-center items-center text-sm shadow-sm z-10">🧔</div>
                                                ) : (
                                                     Array.from({ length: Math.min(3, p.teamCount) }).map((_, idx) => (
                                                         <div key={idx} className="w-8 h-8 rounded-full bg-indigo-50 border-2 border-white flex justify-center items-center text-sm shadow-sm" style={{ zIndex: 10 - idx }}>👦</div>
                                                     ))
                                                )}
                                                {p.teamType === 'team' && p.teamCount > 3 && (
                                                     <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex justify-center items-center text-xs font-bold text-gray-400 shadow-sm z-0">+{p.teamCount - 3}</div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
                                                 <CheckSquare className="w-4 h-4 text-gray-400"/> {p.workLeft}
                                            </div>
                                            <div className="flex items-center gap-1 text-[11px] font-bold text-[#fc4445] bg-red-50 px-2 py-1 rounded-lg truncate max-w-[100px]">
                                                 <ClockIcon className="w-3.5 h-3.5 flex-shrink-0"/> <span className="truncate">{p.deadline || 'No date'}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="pl-3">
                                            <div className="flex justify-between items-center mb-2 text-[11px] font-extrabold uppercase tracking-wide">
                                                 <span className="text-gray-400">Progress</span>
                                                 <span className="text-[#f7aa32]">{p.progress}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full w-full">
                                                 <div className="h-full bg-[#f7aa32] rounded-full shadow-[0_2px_10px_rgba(247,170,50,0.5)] transition-all" style={{ width: `${p.progress}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            
                            <button onClick={handleOpenNewActiveProject} className="w-full bg-white border-2 border-dashed border-gray-200 rounded-[20px] p-4 text-gray-400 font-bold hover:bg-gray-50 hover:text-gray-600 transition-colors flex items-center justify-center gap-2 shadow-sm">
                                <Plus className="w-5 h-5"/> Add Active Project
                            </button>
                        </div>
                    </div>

                    {/* Removed Purple Banner intentionally */}
                </div>
            </div>

            <StudentBookingDetailsModal
                isOpen={detailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                booking={selectedBooking}
                onBookingUpdated={handleBookingUpdated}
            />

            {/* To-Do Modal */}
            {isTodoModalOpen && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative flex flex-col max-h-[80vh]">
                        <button onClick={() => setIsTodoModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 border border-gray-100 p-1 rounded-lg">
                            <X className="w-5 h-5"/>
                        </button>
                        
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-[#eff3ff] rounded-xl flex items-center justify-center">
                                <CheckSquare className="w-5 h-5 text-[#5763f6]" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">To-do List</h2>
                        </div>

                        {/* Input Area */}
                        <div className="flex items-center gap-2 mb-6">
                            <input 
                                type="text"
                                value={newTodo}
                                onChange={(e) => setNewTodo(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
                                placeholder="Add a new task..."
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#5763f6] focus:ring-2 focus:ring-indigo-50 transition-all font-medium text-gray-700"
                            />
                            <button 
                                onClick={handleAddTodo}
                                className="bg-[#5763f6] text-white p-3 rounded-xl hover:bg-indigo-600 transition-colors shadow-md flex-shrink-0"
                            >
                                <Plus className="w-5 h-5"/>
                            </button>
                        </div>

                        {/* List Area */}
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 hide-scrollbar min-h-[200px]">
                            {todos.length === 0 ? (
                                <p className="text-center text-gray-400 mt-10 font-medium">All caught up! Add a task.</p>
                            ) : (
                                todos.map((t) => (
                                    <div key={t.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-colors group">
                                        <div className="flex items-center gap-3 flex-1">
                                            <button 
                                                onClick={() => handleToggleTodo(t.id)} 
                                                className={`w-6 h-6 rounded-md flex items-center justify-center border transition-colors flex-shrink-0 ${t.completed ? 'bg-[#3bc987] border-[#3bc987] text-white' : 'border-gray-300 text-transparent hover:border-[#3bc987]'}`}
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
                                                    className="flex-1 bg-white border border-gray-200 px-2 py-1 rounded outline-none font-medium text-gray-800"
                                                />
                                            ) : (
                                                <span 
                                                    onDoubleClick={() => {
                                                        setEditingTodoId(t.id);
                                                        setEditingTodoText(t.text);
                                                    }}
                                                    className={`font-semibold transition-colors flex-1 cursor-text select-none ${t.completed ? 'opacity-50 line-through text-gray-500' : 'text-gray-800'}`}
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
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative flex flex-col h-[70vh] max-h-[600px]">
                        <button onClick={() => { setIsNotesModalOpen(false); handleSaveNote(); }} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 border border-gray-100 p-1 rounded-lg z-10">
                            <X className="w-5 h-5"/>
                        </button>

                        {activeNoteId ? (
                            <>
                                <div className="flex items-center gap-3 mb-4">
                                    <button onClick={handleSaveNote} className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors">
                                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                                    </button>
                                    <h2 className="text-xl font-bold text-gray-900">Editing Note</h2>
                                </div>
                                <textarea
                                    value={activeNoteText}
                                    onChange={(e) => setActiveNoteText(e.target.value)}
                                    placeholder="Write your note here..."
                                    className="flex-1 w-full bg-yellow-50/50 border border-yellow-100 rounded-2xl p-4 outline-none focus:border-yellow-300 focus:ring-4 focus:ring-yellow-50 resize-none font-medium text-gray-800 leading-relaxed shadow-inner transition-all"
                                    autoFocus
                                />
                                <div className="mt-4 flex justify-end">
                                    <button onClick={handleSaveNote} className="bg-[#efdc4d] text-yellow-900 font-bold px-6 py-2.5 rounded-xl hover:bg-yellow-400 transition-colors shadow-md">
                                        Save Note
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-[#fffdf0] rounded-xl flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-[#efdc4d]" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">Personal Notes</h2>
                                    <button onClick={handleCreateNote} className="ml-auto bg-[#efdc4d] text-yellow-900 p-2 rounded-xl hover:bg-yellow-400 transition-colors shadow-sm mr-10">
                                        <Plus className="w-5 h-5"/>
                                    </button>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto space-y-3 pr-2 hide-scrollbar">
                                    {notes.length === 0 ? (
                                        <div className="text-center mt-12">
                                            <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <FileText className="w-8 h-8 text-yellow-300"/>
                                            </div>
                                            <p className="text-gray-400 font-medium tracking-wide">No notes yet. Create one!</p>
                                        </div>
                                    ) : (
                                        notes.map(n => (
                                            <div 
                                                key={n.id} 
                                                onClick={() => handleOpenNote(n.id, n.text)}
                                                className="p-4 rounded-2xl border border-gray-100 hover:border-yellow-200 hover:bg-yellow-50/50 transition-all cursor-pointer group flex gap-3 h-[100px] shadow-sm hover:shadow-md"
                                            >
                                                <div className="flex-1 overflow-hidden relative">
                                                    <p className="font-semibold text-gray-800 text-sm whitespace-pre-wrap line-clamp-3">
                                                        {n.text || <span className="text-gray-400 italic">Empty note...</span>}
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
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-3xl shadow-2xl relative flex flex-col md:flex-row h-[85vh] max-h-[700px] overflow-hidden gap-6">
                        <button onClick={() => setIsProjectsModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 border border-gray-100 p-1 rounded-lg z-10 bg-white">
                            <X className="w-5 h-5"/>
                        </button>
                        
                        {/* Form Column */}
                        <div className="w-full md:w-1/2 flex flex-col pt-2 hide-scrollbar overflow-y-auto pr-2">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-[#fff1f5] rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Code className="w-5 h-5 text-[#ff6896]" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">{editingProjectId ? "Edit Project" : "Add Project"}</h2>
                            </div>
                            
                            <div className="space-y-4 flex-1">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 pl-1">Project Title</label>
                                    <input 
                                        type="text"
                                        value={projectForm.title}
                                        onChange={e => setProjectForm({...projectForm, title: e.target.value})}
                                        placeholder="e.g. E-Commerce Dashboard"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#ff6896] focus:ring-2 focus:ring-pink-50 transition-all font-medium text-gray-700"
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
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#ff6896] focus:ring-2 focus:ring-pink-50 transition-all font-medium text-gray-700"
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
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#ff6896] focus:ring-2 focus:ring-pink-50 transition-all font-medium text-gray-700"
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
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#ff6896] focus:ring-2 focus:ring-pink-50 transition-all font-medium text-gray-700"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-6 flex gap-3">
                                {editingProjectId && (
                                    <button 
                                        onClick={() => { setEditingProjectId(null); setProjectForm({ title: '', github: '', deployed: '', doc: '' }); }}
                                        className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button 
                                    onClick={handleSaveProject}
                                    disabled={!projectForm.title.trim()}
                                    className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all shadow-md ${projectForm.title.trim() ? 'bg-[#ff6896] text-white hover:bg-pink-500 hover:shadow-lg' : 'bg-gray-100 text-gray-400'}`}
                                >
                                    {editingProjectId ? 'Save Changes' : 'Add Project'}
                                </button>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="hidden md:block w-px bg-gray-100 mx-2"></div>
                        <div className="md:hidden h-px bg-gray-100 my-4"></div>

                        {/* View Column */}
                        <div className="w-full md:w-1/2 flex flex-col hide-scrollbar overflow-y-auto pr-2">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 pt-2">Saved Projects</h3>
                            <div className="flex-1 space-y-4 pb-12">
                                {projects.length === 0 ? (
                                    <div className="text-center mt-16 px-4">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
                                            <Code className="w-8 h-8 text-gray-300"/>
                                        </div>
                                        <p className="text-gray-400 font-medium text-sm">No projects yet. <br/>Add your portfolio highlights here!</p>
                                    </div>
                                ) : (
                                    projects.map(p => (
                                        <div key={p.id} className={`p-4 rounded-2xl border transition-all ${editingProjectId === p.id ? 'border-[#ff6896] bg-pink-50/20' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50 shadow-sm'}`}>
                                            <div className="flex justify-between items-start mb-2 group">
                                                <h4 className="font-bold text-gray-900 leading-tight pr-8">{p.title}</h4>
                                                <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleEditProject(p)} className="p-1.5 text-gray-400 hover:text-[#ff6896] rounded-md transition-colors"><Settings className="w-4 h-4"/></button>
                                                    <button onClick={(e) => handleDeleteProject(p.id, e)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-md transition-colors"><Trash2 className="w-4 h-4"/></button>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 mt-3">
                                                {p.github && (
                                                    <a href={p.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-[#ff6896] transition-colors bg-white/50 border border-gray-100 rounded-lg p-2 truncate">
                                                        <Github className="w-3.5 h-3.5 flex-shrink-0"/> <span className="truncate">{p.github.replace('https://github.com/','')}</span>
                                                    </a>
                                                )}
                                                {p.deployed && (
                                                    <a href={p.deployed} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-[#ff6896] transition-colors bg-white/50 border border-gray-100 rounded-lg p-2 truncate">
                                                        <Link2 className="w-3.5 h-3.5 flex-shrink-0"/> <span className="truncate">Live Demo</span>
                                                    </a>
                                                )}
                                                {p.doc && (
                                                    <a href={p.doc} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-[#ff6896] transition-colors bg-white/50 border border-gray-100 rounded-lg p-2 truncate">
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
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative flex flex-col">
                        <button onClick={() => setIsCategoryModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 border border-gray-100 p-1 rounded-lg">
                            <X className="w-5 h-5"/>
                        </button>
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Create Goal List</h2>
                        <input 
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                            placeholder="e.g. Dream Vacations"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#5763f6] focus:ring-2 focus:ring-indigo-50 transition-all font-medium text-gray-700 mb-4"
                            autoFocus
                        />
                        <button 
                            onClick={handleAddCategory}
                            disabled={!newCategoryName.trim()}
                            className={`w-full py-3 rounded-xl font-bold transition-all ${newCategoryName.trim() ? 'bg-[#5763f6] text-white hover:bg-indigo-600' : 'bg-gray-100 text-gray-400'}`}
                        >
                            Create List
                        </button>
                    </div>
                </div>
            )}

            {/* Goal Items Modal */}
            {isGoalItemModalOpen && activeGoalCategoryId && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative flex flex-col max-h-[80vh]">
                        <button onClick={() => setIsGoalItemModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 border border-gray-100 p-1 rounded-lg">
                            <X className="w-5 h-5"/>
                        </button>
                        
                        <div className="flex items-center gap-3 mb-6 pr-8">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                <Target className="w-5 h-5 text-indigo-500" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 truncate">{goalCategories.find(c => c.id === activeGoalCategoryId)?.name}</h2>
                        </div>

                        {/* Input Area */}
                        <div className="flex items-center gap-2 mb-6">
                            <input 
                                type="text"
                                value={newGoalText}
                                onChange={(e) => setNewGoalText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddGoalItem()}
                                placeholder="Add a new goal..."
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#5763f6] focus:ring-2 focus:ring-indigo-50 transition-all font-medium text-gray-700"
                            />
                            <button 
                                onClick={handleAddGoalItem}
                                className="bg-[#5763f6] text-white p-3 rounded-xl hover:bg-indigo-600 transition-colors shadow-md flex-shrink-0"
                            >
                                <Plus className="w-5 h-5"/>
                            </button>
                        </div>

                        {/* List Area */}
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 hide-scrollbar min-h-[200px]">
                            {goalCategories.find(c => c.id === activeGoalCategoryId)?.items.length === 0 ? (
                                <p className="text-center text-gray-400 mt-10 font-medium">No goals here yet!</p>
                            ) : (
                                goalCategories.find(c => c.id === activeGoalCategoryId)?.items.map((i) => (
                                    <div key={i.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-colors group">
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
                                                    className="flex-1 bg-white border border-gray-200 px-2 py-1 rounded outline-none font-medium text-gray-800"
                                                />
                                            ) : (
                                                <span 
                                                    onDoubleClick={() => {
                                                        setEditingGoalId(i.id);
                                                        setEditingGoalText(i.text);
                                                    }}
                                                    className="font-semibold transition-colors flex-1 cursor-text select-none text-gray-800"
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
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative flex flex-col max-h-[90vh]">
                        <button onClick={() => setIsActiveProjectModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 border border-gray-100 p-1 rounded-lg">
                            <X className="w-5 h-5"/>
                        </button>
                        
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-[#fffdf0] rounded-xl flex items-center justify-center">
                                <Target className="w-5 h-5 text-[#efdc4d]" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">{editingActiveProjectId ? "Edit Project" : "New Active Project"}</h2>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 hide-scrollbar">
                           <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 pl-1">Project Name</label>
                                <input 
                                    type="text"
                                    value={activeProjectForm.name}
                                    onChange={e => setActiveProjectForm({...activeProjectForm, name: e.target.value})}
                                    placeholder="e.g. Ignite Hackathon"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#5763f6] focus:ring-2 focus:ring-indigo-50 transition-all font-medium text-gray-700"
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
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#5763f6] transition-all font-medium text-gray-700"
                                    />
                               </div>
                               <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 pl-1">Theme / Category</label>
                                    <input 
                                        type="text"
                                        value={activeProjectForm.theme}
                                        onChange={e => setActiveProjectForm({...activeProjectForm, theme: e.target.value})}
                                        placeholder="e.g. AI Dev"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#5763f6] transition-all font-medium text-gray-700"
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
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#5763f6] transition-all font-medium text-gray-700"
                                    />
                               </div>
                               <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 pl-1">Team Details</label>
                                    <div className="flex gap-2">
                                         <select 
                                             value={activeProjectForm.teamType} 
                                             onChange={e => setActiveProjectForm({...activeProjectForm, teamType: e.target.value as any})}
                                             className="w-1/2 px-2 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#5763f6] font-medium text-gray-700"
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
                                             className={`w-1/2 px-2 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#5763f6] font-medium text-gray-700 ${activeProjectForm.teamType === 'solo' ? 'bg-gray-100 opacity-50' : ''}`}
                                         />
                                    </div>
                               </div>
                           </div>
                           <div>
                                <label className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 pl-1">
                                    <span>Progress</span>
                                    <span className="text-[#5763f6] bg-indigo-50 px-2 py-0.5 rounded">{activeProjectForm.progress}%</span>
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
                            className={`w-full mt-6 py-3 rounded-xl font-bold transition-all shadow-md ${activeProjectForm.name.trim() ? 'bg-[#5763f6] text-white hover:bg-indigo-600 hover:shadow-lg' : 'bg-gray-100 text-gray-400'}`}
                        >
                            {editingActiveProjectId ? 'Save Changes' : 'Create Project'}
                        </button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};
