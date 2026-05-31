import { useState } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { 
  Video, 
  FileText, 
  Terminal, 
  ClipboardCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Laptop, 
  Award, 
  Sparkles, 
  Slack, 
  Layers, 
  Save, 
  ArrowLeft,
  CheckCircle2,
  X,
  Compass
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

// Type definitions
interface SyllabusItem {
  id: string;
  type: 'video' | 'docs' | 'sandbox' | 'milestone';
  title: string;
  duration: string;
  description?: string;
  url?: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  items: SyllabusItem[];
}

export function OrgCreateCoursePage() {
  const navigate = useNavigate();
  
  // App States
  const [loading, setLoading] = useState(false);
  const [actionStatus, setActionStatus] = useState<'published' | 'draft'>('published');
  
  // Edit mode states for Course Details
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [courseTitle, setCourseTitle] = useState('Full-Stack Architecture & AI Integration');
  const [courseSubtitle, setCourseSubtitle] = useState('Build, deploy, and scale self-healing AI agents with low-latency WebRTC pipelines.');
  const [instructorName, setInstructorName] = useState('Dr. Sarah Jenkins & Mentozy Core Team');
  
  // Meta-data states
  const [totalHours, setTotalHours] = useState(48);
  const [weeklyAllocation, setWeeklyAllocation] = useState(12);
  const [slackUrl, setSlackUrl] = useState('https://slack.com');
  const [organizerUrl, setOrganizerUrl] = useState('#');

  // Technology Stack list & selected
  const availableTechnologies = [
    { name: 'Next.js', category: 'Frontend' },
    { name: 'WebRTC', category: 'Network' },
    { name: 'OpenAI API', category: 'AI' },
    { name: 'Tailwind CSS', category: 'Styling' },
    { name: 'TypeScript', category: 'Language' },
    { name: 'Node.js', category: 'Backend' },
    { name: 'Supabase', category: 'Database' },
    { name: 'Docker', category: 'DevOps' },
    { name: 'FastAPI', category: 'Backend' },
    { name: 'LangChain', category: 'AI' }
  ];
  const [selectedTechs, setSelectedTechs] = useState<string[]>(['Next.js', 'WebRTC', 'OpenAI API', 'Tailwind CSS', 'TypeScript']);
  const [newTechName, setNewTechName] = useState('');

  // Default modules for high-fidelity representation
  const [modules, setModules] = useState<Module[]>([
    {
      id: 'mod-1',
      title: 'Module 1: Command Line & Asynchronous Javascript',
      description: 'Master advanced asynchronous patterns, event loop mechanics, and CLI orchestration essentials.',
      items: [
        {
          id: 'item-1-1',
          type: 'video',
          title: '🎥 Video Briefing: Weekly Live Kickoff & Advanced Event Loop deep-dive',
          duration: '45 mins',
          description: 'Analyzing microtasks, macrotasks, and performance pitfalls in asynchronous execution pipelines.'
        },
        {
          id: 'item-1-2',
          type: 'docs',
          title: '📄 Core Documentation: Blueprints for Event-Driven Microservices',
          duration: '30 mins read',
          description: 'Official production specs and state diagrams detailing thread management and non-blocking I/O.'
        },
        {
          id: 'item-1-3',
          type: 'sandbox',
          title: '💻 The Live Sandbox: CLI Automation Lab & Shell Scripting',
          duration: '60 mins',
          description: 'Deploy a sandbox containing pre-configured tools to test process isolation and IPC.'
        },
        {
          id: 'item-1-4',
          type: 'milestone',
          title: '📝 The Milestone Audit: Async Pipeline Code Submission & Review',
          duration: 'Due in 3 days',
          description: 'Submit your solution for a multi-threaded batch file processor. Subject to strict automated test cases.'
        }
      ]
    },
    {
      id: 'mod-2',
      title: 'Module 2: Custom WebRTC & AI Agent Logic',
      description: 'Building custom low-latency streaming infrastructure and integrating real-time LLM feedback loops.',
      items: [
        {
          id: 'item-2-1',
          type: 'video',
          title: '🎥 Video Briefing: WebRTC Peer Connections & SDP Negotiation mechanics',
          duration: '55 mins',
          description: 'Understanding ICE candidates, STUN/TURN servers, and dynamic stream resolution.'
        },
        {
          id: 'item-2-2',
          type: 'docs',
          title: '📄 Core Documentation: AI Agent System Architecture & Tool Calling',
          duration: '20 mins read',
          description: 'Implementation plan for function-calling LLMs running alongside media streams.'
        },
        {
          id: 'item-2-3',
          type: 'sandbox',
          title: '💻 The Live Sandbox / Lab: WebRTC Audio Stream Loopback sandbox',
          duration: '90 mins',
          description: 'Initialize a clean browser sandbox with simulated audio input channels and real-time LLM listeners.'
        }
      ]
    }
  ]);

  // Expansion state for accordion modules
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    'mod-1': true,
    'mod-2': true
  });

  // Modal / Creator states for new Module or Syllabus Item
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDesc, setNewModuleDesc] = useState('');

  const [activeModuleForNewItem, setActiveModuleForNewItem] = useState<string | null>(null);
  const [newItemType, setNewItemType] = useState<'video' | 'docs' | 'sandbox' | 'milestone'>('video');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDuration, setNewItemDuration] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');

  // Toggles module expand state
  const toggleModule = (id: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Add technology chip
  const handleAddTech = () => {
    if (newTechName.trim() && !selectedTechs.includes(newTechName.trim())) {
      setSelectedTechs(prev => [...prev, newTechName.trim()]);
      setNewTechName('');
    }
  };

  const handleRemoveTech = (tech: string) => {
    setSelectedTechs(prev => prev.filter(t => t !== tech));
  };

  // Create Module
  const handleCreateModule = () => {
    if (!newModuleTitle.trim()) {
      toast.error('Module Title is required');
      return;
    }
    const newId = `mod-${Date.now()}`;
    const newMod: Module = {
      id: newId,
      title: newModuleTitle,
      description: newModuleDesc,
      items: []
    };
    setModules(prev => [...prev, newMod]);
    setExpandedModules(prev => ({ ...prev, [newId]: true }));
    setNewModuleTitle('');
    setNewModuleDesc('');
    setIsAddingModule(false);
    toast.success('New Module added to syllabus');
  };

  // Delete Module
  const handleDeleteModule = (id: string) => {
    setModules(prev => prev.filter(m => m.id !== id));
    toast.success('Module removed');
  };

  // Create Syllabus Item
  const handleCreateSyllabusItem = () => {
    if (!newItemTitle.trim()) {
      toast.error('Item Title is required');
      return;
    }
    if (!activeModuleForNewItem) return;

    let prefix = '🎥 Video Briefing: ';
    if (newItemType === 'docs') prefix = '📄 Core Documentation: ';
    if (newItemType === 'sandbox') prefix = '💻 The Live Sandbox: ';
    if (newItemType === 'milestone') prefix = '📝 The Milestone Audit: ';

    const createdItem: SyllabusItem = {
      id: `item-${Date.now()}`,
      type: newItemType,
      title: `${prefix}${newItemTitle}`,
      duration: newItemDuration || (newItemType === 'video' ? '40 mins' : newItemType === 'docs' ? '15 mins read' : '60 mins'),
      description: newItemDesc
    };

    setModules(prev => prev.map(mod => {
      if (mod.id === activeModuleForNewItem) {
        return {
          ...mod,
          items: [...mod.items, createdItem]
        };
      }
      return mod;
    }));

    setNewItemTitle('');
    setNewItemDuration('');
    setNewItemDesc('');
    setActiveModuleForNewItem(null);
    toast.success('Syllabus item added successfully');
  };

  // Delete Syllabus Item
  const handleDeleteSyllabusItem = (moduleId: string, itemId: string) => {
    setModules(prev => prev.map(mod => {
      if (mod.id === moduleId) {
        return {
          ...mod,
          items: mod.items.filter(item => item.id !== itemId)
        };
      }
      return mod;
    }));
    toast.success('Syllabus item removed');
  };

  // Save / Publish course triggers
  const handleSaveCourse = async (status: 'draft' | 'published') => {
    setLoading(true);
    setActionStatus(status);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    
    if (status === 'draft') {
      toast.success('Course draft saved successfully!');
    } else {
      toast.success('Course officially published to your Organisation!');
      navigate('/org-courses');
    }
  };

  // Helper render for Media Type Icon
  const renderTypeIcon = (type: 'video' | 'docs' | 'sandbox' | 'milestone') => {
    switch (type) {
      case 'video':
        return <Video className="w-5 h-5 text-indigo-400" />;
      case 'docs':
        return <FileText className="w-5 h-5 text-emerald-400" />;
      case 'sandbox':
        return <Terminal className="w-5 h-5 text-amber-400" />;
      case 'milestone':
        return <ClipboardCheck className="w-5 h-5 text-rose-400" />;
      default:
        return <Compass className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto pb-24 font-sans text-slate-100">
        
        {/* Navigation & Actions Topbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <button 
            onClick={() => navigate('/org-courses')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-semibold self-start"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Courses
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSaveCourse('draft')}
              disabled={loading}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold transition-all flex items-center gap-2"
            >
              {loading && actionStatus === 'draft' && (
                <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
              )}
              Save Draft
            </button>
            <button
              onClick={() => handleSaveCourse('published')}
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              {loading && actionStatus === 'published' && (
                <div className="w-4 h-4 border-2 border-indigo-400 border-t-white rounded-full animate-spin" />
              )}
              <Save className="w-4.5 h-4.5" />
              Publish Course
            </button>
          </div>
        </div>

        {/* ==================== 1. THE HERO BANNER (TOP SECTION) ==================== */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 border border-indigo-950/80 shadow-2xl mb-8">
          {/* Panoramic Royal Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-purple-950/60 z-0"></div>
          
          {/* Accent Glow Gradients */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
          <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
          
          <div className="relative z-10 p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
            
            {/* Left Side: Bold Typography & Details */}
            <div className="flex-1 space-y-4 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-300 uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                Royal Cohort Syllabus Builder
              </div>
              
              {isEditingHeader ? (
                <div className="space-y-3 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 animate-in fade-in zoom-in-95 duration-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Course Title</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-bold text-lg focus:border-indigo-500 outline-none"
                      value={courseTitle}
                      onChange={e => setCourseTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">One-sentence Subtitle</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:border-indigo-500 outline-none"
                      value={courseSubtitle}
                      onChange={e => setCourseSubtitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Instructor / Creator</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-300 text-sm focus:border-indigo-500 outline-none"
                      value={instructorName}
                      onChange={e => setInstructorName(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <button 
                      onClick={() => setIsEditingHeader(false)}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all"
                    >
                      Apply Details
                    </button>
                  </div>
                </div>
              ) : (
                <div className="group relative">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                    {courseTitle}
                  </h1>
                  <p className="text-slate-300 text-base md:text-lg max-w-2xl mt-2 font-medium">
                    {courseSubtitle}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-6">
                    <div className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800/80 text-xs">
                      <span className="text-slate-500 font-bold uppercase tracking-wider">Instructor:</span>
                      <span className="text-slate-200 font-semibold">{instructorName}</span>
                    </div>
                    <button 
                      onClick={() => setIsEditingHeader(true)}
                      className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-bold"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit Course Banner Details
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Right Side: Sleek minimal progress card (Student Preview) */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="bg-slate-900/70 border border-white/10 p-6 rounded-2xl backdrop-blur-md shadow-xl flex flex-col justify-between min-h-[160px]">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Student Preview</span>
                    <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-bold">12% Complete</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-slate-950 rounded-full h-2 mb-6 border border-slate-800">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full" style={{ width: '12%' }}></div>
                  </div>
                </div>
                
                <button className="w-full py-3 bg-white text-slate-950 hover:bg-slate-100 font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-default pointer-events-none">
                  Resume Building
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* 70/30 Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
          
          {/* ==================== 2. THE LEFT COLUMN: THE DYNAMIC SYLLABUS (70%) ==================== */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="bg-slate-950 rounded-3xl border border-slate-900 p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-900 pb-5 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-400" />
                    Dynamic Chronological Syllabus
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Design accordion-style modules and individual interactive briefings.</p>
                </div>
                <button
                  onClick={() => setIsAddingModule(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 rounded-xl text-xs font-bold border border-indigo-500/25 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Module
                </button>
              </div>

              {/* Dynamic Module Creator Card */}
              <AnimatePresence>
                {isAddingModule && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-6"
                  >
                    <div className="bg-slate-900/60 p-5 rounded-2xl border border-indigo-950 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <Plus className="w-4 h-4 text-indigo-400" /> Create New Module
                        </h4>
                        <button onClick={() => setIsAddingModule(false)} className="text-slate-400 hover:text-white">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Module Title</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Module 3: Microservice Deployment & Resilient Backends"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                            value={newModuleTitle}
                            onChange={e => setNewModuleTitle(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Brief Description</label>
                          <textarea 
                            rows={2}
                            placeholder="Explain the learning outcome or production milestones of this module..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:border-indigo-500 outline-none resize-none"
                            value={newModuleDesc}
                            onChange={e => setNewModuleDesc(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <button 
                          onClick={() => setIsAddingModule(false)}
                          className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-400 rounded-xl text-xs font-bold"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleCreateModule}
                          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                        >
                          Add Module
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Modules Accordion List */}
              <div className="space-y-4">
                {modules.map((module) => {
                  const isExpanded = expandedModules[module.id];
                  return (
                    <div 
                      key={module.id} 
                      className="bg-slate-900/30 rounded-2xl border border-slate-900 overflow-hidden transition-colors hover:border-slate-800/80"
                    >
                      {/* Accordion Trigger Header */}
                      <div 
                        onClick={() => toggleModule(module.id)}
                        className="p-5 flex items-center justify-between cursor-pointer select-none"
                      >
                        <div className="flex-1 text-left pr-4">
                          <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                            {module.title}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1">
                            {module.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveModuleForNewItem(module.id);
                            }}
                            className="p-1.5 bg-slate-800/60 hover:bg-slate-800 text-indigo-400 rounded-lg border border-slate-700/50 hover:text-indigo-300 transition-colors"
                            title="Add item to module"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteModule(module.id);
                            }}
                            className="p-1.5 bg-slate-900 hover:bg-slate-950 text-slate-500 hover:text-rose-400 rounded-lg border border-slate-800 transition-colors"
                            title="Delete Module"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-slate-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-500" />
                          )}
                        </div>
                      </div>

                      {/* Accordion Expandable Content */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-t border-slate-900/60 bg-slate-950/20"
                          >
                            <div className="p-5 space-y-3">
                              
                              {/* Inline Item Creator Form */}
                              {activeModuleForNewItem === module.id && (
                                <div className="bg-slate-900/80 p-4 rounded-xl border border-indigo-950/50 space-y-4 mb-4 animate-in slide-in-from-top-4 duration-200">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Add Syllabus Item</span>
                                    <button onClick={() => setActiveModuleForNewItem(null)} className="text-slate-500 hover:text-white">
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Item Type</label>
                                      <select 
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                                        value={newItemType}
                                        onChange={e => setNewItemType(e.target.value as any)}
                                      >
                                        <option value="video">🎥 Video Briefing</option>
                                        <option value="docs">📄 Core Documentation</option>
                                        <option value="sandbox">💻 The Live Sandbox / Lab</option>
                                        <option value="milestone">📝 The Milestone Audit</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Duration / Due Date</label>
                                      <input 
                                        type="text" 
                                        placeholder="e.g. 45 mins, 20 mins read, Due in 2 days"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                                        value={newItemDuration}
                                        onChange={e => setNewItemDuration(e.target.value)}
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Item Name</label>
                                    <input 
                                      type="text" 
                                      placeholder="e.g. Setting up WebRTC connections"
                                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                                      value={newItemTitle}
                                      onChange={e => setNewItemTitle(e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Short Objective/Description</label>
                                    <input 
                                      type="text" 
                                      placeholder="What will they master in this step?"
                                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                                      value={newItemDesc}
                                      onChange={e => setNewItemDesc(e.target.value)}
                                    />
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <button 
                                      onClick={() => setActiveModuleForNewItem(null)}
                                      className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-slate-400 rounded-lg text-xs font-semibold"
                                    >
                                      Cancel
                                    </button>
                                    <button 
                                      onClick={handleCreateSyllabusItem}
                                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold"
                                    >
                                      Save Item
                                    </button>
                                  </div>
                                </div>
                              )}

                              {module.items.length === 0 ? (
                                <p className="text-xs text-slate-500 py-4 text-center border border-dashed border-slate-850 rounded-xl">
                                  No items inside this module. Click the (+) button to add briefings.
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  {module.items.map((item) => (
                                    <div 
                                      key={item.id} 
                                      className="group flex items-start gap-4 p-4 bg-slate-950/40 hover:bg-slate-900/60 rounded-xl border border-slate-900/80 transition-all text-left"
                                    >
                                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                                        {renderTypeIcon(item.type)}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                          <h4 className="font-semibold text-sm text-slate-100 truncate pr-4">
                                            {item.title}
                                          </h4>
                                          <span className="text-xs font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 self-start sm:self-auto shrink-0">
                                            {item.duration}
                                          </span>
                                        </div>
                                        {item.description && (
                                          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                                            {item.description}
                                          </p>
                                        )}
                                      </div>
                                      <button 
                                        onClick={() => handleDeleteSyllabusItem(module.id, item.id)}
                                        className="p-1.5 text-slate-600 hover:text-rose-400 transition-colors self-center opacity-0 group-hover:opacity-100"
                                        title="Delete Item"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>

          {/* ==================== 3. THE RIGHT COLUMN: CONTEXTUAL META-PANEL (30%) ==================== */}
          <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24">
            
            {/* Meta-Panel Container */}
            <div className="bg-slate-950 rounded-3xl border border-slate-900 p-6 shadow-xl space-y-6">
              
              {/* SECTION A: Estimated Commitment */}
              <div className="space-y-4 text-left">
                <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                  <Clock className="w-4.5 h-4.5 text-indigo-400" />
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-300">Estimated Commitment</h3>
                </div>
                
                <div className="space-y-4 bg-slate-900/30 p-4 rounded-2xl border border-slate-900">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-400">Total Program Hours:</span>
                      <span className="text-white">{totalHours} Hours</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="120"
                      step="2"
                      className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                      value={totalHours}
                      onChange={e => setTotalHours(parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-400">Weekly Commitment:</span>
                      <span className="text-white">{weeklyAllocation} hrs/week</span>
                    </div>
                    <input 
                      type="range" 
                      min="4" 
                      max="30"
                      className="w-full accent-purple-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                      value={weeklyAllocation}
                      onChange={e => setWeeklyAllocation(parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION B: The Operator Stack */}
              <div className="space-y-4 text-left">
                <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                  <Layers className="w-4.5 h-4.5 text-indigo-400" />
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-300">The Operator Stack</h3>
                </div>
                
                <div className="space-y-3">
                  {/* Grid of active chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTechs.map(tech => (
                      <span 
                        key={tech}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-bold rounded-lg"
                      >
                        {tech}
                        <button 
                          onClick={() => handleRemoveTech(tech)}
                          className="hover:text-white transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add technology input */}
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Add tech (e.g. Docker)..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:border-indigo-500 outline-none"
                      value={newTechName}
                      onChange={e => setNewTechName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddTech()}
                    />
                    <button
                      onClick={handleAddTech}
                      className="px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION C: Instant Workspace Portals */}
              <div className="space-y-4 text-left">
                <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                  <Slack className="w-4.5 h-4.5 text-indigo-400" />
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-300">Cohort Portals</h3>
                </div>

                <div className="space-y-2">
                  <div className="bg-slate-900/30 p-4 rounded-2xl border border-slate-900 space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Slack Cohort Channel URL
                      </label>
                      <input 
                        type="text"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:border-indigo-500 outline-none"
                        value={slackUrl}
                        onChange={e => setSlackUrl(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Native Team Organizer Dashboard URL
                      </label>
                      <input 
                        type="text"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:border-indigo-500 outline-none"
                        value={organizerUrl}
                        onChange={e => setOrganizerUrl(e.target.value)}
                      />
                    </div>
                  </div>

                  <a 
                    href={slackUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <Slack className="w-4 h-4 text-amber-500" />
                    Launch Cohort Slack
                  </a>
                  
                  <button 
                    disabled
                    className="w-full py-2.5 bg-slate-900 text-slate-400 border border-slate-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all opacity-50 cursor-not-allowed"
                  >
                    <Laptop className="w-4 h-4 text-indigo-400" />
                    Native Team Organizer
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}

export default OrgCreateCoursePage;
