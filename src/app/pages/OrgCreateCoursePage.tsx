import { useState } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Save, 
  X,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { CourseModulesEditor, Module } from '../components/course/CourseModulesEditor';

export function OrgCreateCoursePage() {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [actionStatus, setActionStatus] = useState<'published' | 'draft'>('published');
  const [activeTab, setActiveTab] = useState<'basic' | 'curriculum' | 'settings'>('basic');
  
  // Tab 1: Basic Info States
  const [courseTitle, setCourseTitle] = useState('Full-Stack Architecture & AI Integration');
  const [courseSubtitle, setCourseSubtitle] = useState('Build, deploy, and scale self-healing AI agents with low-latency WebRTC pipelines.');
  const [instructorName, setInstructorName] = useState('Dr. Sarah Jenkins & Mentozy Team');
  const [selectedTechs, setSelectedTechs] = useState<string[]>(['Next.js', 'WebRTC', 'OpenAI API', 'TypeScript']);
  const [newTechName, setNewTechName] = useState('');

  // Tab 2: Curriculum States (Week Timeline Builder)
  const [modules, setModules] = useState<Module[]>([
    {
      id: 'mod-1',
      title: 'Command Line & Asynchronous Javascript',
      description: 'Master advanced asynchronous patterns, event loop mechanics, and CLI orchestration essentials.',
      duration: '1 Week',
      objectives: ['Master thread management', 'Understand macro vs micro tasks'],
      lessons: [
        {
          id: 'item-1-1',
          title: 'Weekly Live Kickoff & Advanced Event Loop deep-dive',
          explanation: 'Analyzing microtasks, macrotasks, and performance pitfalls in asynchronous execution pipelines.',
          videoLink: 'https://youtube.com',
          quizzes: []
        },
        {
          id: 'item-1-2',
          title: 'Blueprints for Event-Driven Microservices',
          explanation: 'Official production specs and state diagrams detailing thread management and non-blocking I/O.',
          videoLink: '',
          quizzes: []
        }
      ]
    }
  ]);

  // Tab 3: Settings & Cohort Portals
  const [totalHours, setTotalHours] = useState(48);
  const [weeklyAllocation, setWeeklyAllocation] = useState(12);
  const [slackUrl, setSlackUrl] = useState('https://slack.com');
  const [organizerUrl, setOrganizerUrl] = useState('#');

  const handleAddTech = () => {
    if (newTechName.trim() && !selectedTechs.includes(newTechName.trim())) {
      setSelectedTechs(prev => [...prev, newTechName.trim()]);
      setNewTechName('');
    }
  };

  const handleRemoveTech = (tech: string) => {
    setSelectedTechs(prev => prev.filter(t => t !== tech));
  };

  const handleSaveCourse = async (status: 'draft' | 'published') => {
    setLoading(true);
    setActionStatus(status);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    
    if (status === 'draft') {
      toast.success('Course draft saved successfully!');
    } else {
      toast.success('Course officially published to your Organisation!');
      navigate('/org-courses');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto pb-24 font-mono text-gray-900">
        
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6 text-left">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 border-2 border-gray-900 bg-white text-xs font-black uppercase tracking-wider mb-3 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
              Course Creator
            </span>
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Create New Course</h1>
            <p className="text-xs text-gray-600 mt-2 uppercase font-bold">Build a professional, structured learning path for your students.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSaveCourse('draft')}
              disabled={loading}
              className="px-6 py-3 bg-white border-4 border-gray-900 text-gray-900 font-black text-xs uppercase shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSaveCourse('published')}
              disabled={loading}
              className="px-6 py-3 bg-[#f39c12] border-4 border-gray-900 text-gray-900 font-black text-xs uppercase shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2"
            >
              {loading && actionStatus === 'published' && (
                <div className="w-4 h-4 border-2 border-gray-950 border-t-white rounded-full animate-spin" />
              )}
              <Save className="w-4 h-4" />
              Publish Course
            </button>
          </div>
        </div>

        {/* Tabbed Layout Area */}
        <div className="flex flex-col lg:flex-row gap-8 text-left">
          
          {/* Left Sidebar Menu */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white border-4 border-gray-900 p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 px-2">Course Setup</h2>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => setActiveTab('basic')} 
                    className={`w-full text-left px-4 py-3 border-2 transition-all flex items-center gap-3 text-xs font-black uppercase ${activeTab === 'basic' ? 'bg-[#f39c12] border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] text-gray-900' : 'text-gray-750 border-transparent hover:bg-gray-50'}`}
                  >
                    <div className={`w-2 h-2 border border-gray-900 ${activeTab === 'basic' ? 'bg-black' : 'bg-transparent'}`} />
                    Basic Info
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('curriculum')} 
                    className={`w-full text-left px-4 py-3 border-2 transition-all flex items-center gap-3 text-xs font-black uppercase ${activeTab === 'curriculum' ? 'bg-[#f39c12] border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] text-gray-900' : 'text-gray-750 border-transparent hover:bg-gray-50'}`}
                  >
                    <div className={`w-2 h-2 border border-gray-900 ${activeTab === 'curriculum' ? 'bg-black' : 'bg-transparent'}`} />
                    Curriculum
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('settings')} 
                    className={`w-full text-left px-4 py-3 border-2 transition-all flex items-center gap-3 text-xs font-black uppercase ${activeTab === 'settings' ? 'bg-[#f39c12] border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] text-gray-900' : 'text-gray-750 border-transparent hover:bg-gray-50'}`}
                  >
                    <div className={`w-2 h-2 border border-gray-900 ${activeTab === 'settings' ? 'bg-black' : 'bg-transparent'}`} />
                    Pricing & Settings
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Main Form Container */}
          <div className="flex-grow">
            <div className="bg-white border-4 border-gray-900 shadow-[6px_6px_0px_rgba(0,0,0,1)] p-8 min-h-[600px]">
              
              {/* TAB 1: BASIC INFORMATION */}
              {activeTab === 'basic' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-350">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 border-b-4 border-gray-900 pb-4 uppercase tracking-tight">Basic Information</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-black uppercase text-gray-900 mb-1.5">Course Title *</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-4 py-3 bg-white border-2 border-gray-900 text-xs font-bold uppercase outline-none focus:bg-[#eff3ff]"
                        value={courseTitle}
                        onChange={e => setCourseTitle(e.target.value)}
                        placeholder="E.g. Advanced System Design & Architecture"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase text-gray-900 mb-1.5">One-sentence Subtitle *</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-4 py-3 bg-white border-2 border-gray-900 text-xs font-bold uppercase outline-none focus:bg-[#eff3ff]"
                        value={courseSubtitle}
                        onChange={e => setCourseSubtitle(e.target.value)}
                        placeholder="Build, deploy, and scale self-healing AI agents"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-black uppercase text-gray-900 mb-1.5">Instructor Name *</label>
                        <input 
                          type="text" 
                          required
                          className="w-full px-4 py-3 bg-white border-2 border-gray-900 text-xs font-bold uppercase outline-none focus:bg-[#eff3ff]"
                          value={instructorName}
                          onChange={e => setInstructorName(e.target.value)}
                          placeholder="Dr. Sarah Jenkins"
                        />
                      </div>
                      
                      {/* Operator Stack / Technologies inside Basic Info */}
                      <div>
                        <label className="block text-xs font-black uppercase text-gray-900 mb-1.5 font-black">Operator Tech Stack</label>
                        <div className="flex flex-wrap gap-1.5 mb-2 min-h-[36px] items-center">
                          {selectedTechs.map(tech => (
                            <span 
                              key={tech}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#eff3ff] text-gray-900 border-2 border-gray-900 text-[10px] font-black uppercase shadow-[1px_1px_0px_rgba(0,0,0,1)]"
                            >
                              {tech}
                              <button type="button" onClick={() => handleRemoveTech(tech)} className="text-gray-500 hover:text-gray-900">
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            placeholder="Add technology..."
                            className="flex-grow px-3 py-1.5 bg-white border-2 border-gray-900 text-xs font-bold uppercase outline-none"
                            value={newTechName}
                            onChange={e => setNewTechName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
                          />
                          <button
                            type="button"
                            onClick={handleAddTech}
                            className="px-4 bg-[#f39c12] border-2 border-gray-900 text-gray-900 text-xs font-black uppercase shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 flex justify-end border-t-2 border-gray-900">
                    <button 
                      type="button"
                      onClick={() => setActiveTab('curriculum')}
                      className="px-6 py-3 bg-gray-900 text-white font-black text-xs uppercase hover:bg-gray-800 transition-colors"
                    >
                      Save & Continue to Curriculum
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: CURRICULUM BUILDER */}
              {activeTab === 'curriculum' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-350">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 border-b-4 border-gray-900 pb-4 flex items-center gap-3 uppercase tracking-tight">
                      <BookOpen className="w-6 h-6 text-[#f39c12]" />
                      Curriculum Builder
                    </h2>
                    <p className="text-xs text-gray-500 font-bold uppercase mt-3 mb-6">Start putting together your course syllabus by creating modules (weeks), topics, readings, and practice quizzes.</p>
                  </div>

                  <CourseModulesEditor modules={modules} onChange={setModules} />

                  <div className="pt-8 flex justify-between border-t-2 border-gray-900">
                    <button 
                      type="button" 
                      onClick={() => setActiveTab('basic')}
                      className="px-5 py-3 border-2 border-gray-900 bg-white font-black text-xs uppercase hover:bg-gray-100 transition-colors"
                    >
                      Back to Basic Info
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setActiveTab('settings')}
                      className="px-6 py-3 bg-gray-900 text-white font-black text-xs uppercase hover:bg-gray-800 transition-colors"
                    >
                      Save & Continue to Settings
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: PRICING & COHORT SETTINGS */}
              {activeTab === 'settings' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-355">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 border-b-4 border-gray-900 pb-4 uppercase tracking-tight">Pricing & Cohort Settings</h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Commitment Range Sliders */}
                    <div className="space-y-6 bg-[#FAF9F6] border-4 border-gray-900 p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                      <h3 className="font-black text-sm uppercase tracking-wider text-gray-900 border-b-2 border-gray-900 pb-2">Estimated Commitment</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                            <span className="text-gray-500">Total Program Hours:</span>
                            <span className="text-gray-900">{totalHours} Hours</span>
                          </div>
                          <input 
                            type="range" 
                            min="10" 
                            max="120"
                            step="2"
                            className="w-full accent-gray-900 h-2 cursor-pointer bg-white border border-gray-900"
                            value={totalHours}
                            onChange={e => setTotalHours(parseInt(e.target.value))}
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                            <span className="text-gray-500">Weekly Commitment:</span>
                            <span className="text-gray-900">{weeklyAllocation} hrs/week</span>
                          </div>
                          <input 
                            type="range" 
                            min="4" 
                            max="30"
                            className="w-full accent-[#f39c12] h-2 cursor-pointer bg-white border border-gray-900"
                            value={weeklyAllocation}
                            onChange={e => setWeeklyAllocation(parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Slack & Dashboard Portals */}
                    <div className="space-y-6 bg-[#FAF9F6] border-4 border-gray-900 p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                      <h3 className="font-black text-sm uppercase tracking-wider text-gray-900 border-b-2 border-gray-900 pb-2">Cohort Channels</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[9px] font-black text-gray-500 uppercase mb-1">Slack Cohort Channel URL</label>
                          <input 
                            type="text"
                            className="w-full bg-white border-2 border-gray-900 px-3 py-1.5 text-xs font-bold uppercase outline-none"
                            value={slackUrl}
                            onChange={e => setSlackUrl(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-black text-gray-500 uppercase mb-1">Team Organizer Dashboard URL</label>
                          <input 
                            type="text"
                            className="w-full bg-white border-2 border-gray-900 px-3 py-1.5 text-xs font-bold uppercase outline-none"
                            value={organizerUrl}
                            onChange={e => setOrganizerUrl(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 flex justify-between border-t-2 border-gray-900">
                    <button 
                      type="button" 
                      onClick={() => setActiveTab('curriculum')}
                      className="px-5 py-3 border-2 border-gray-900 bg-white font-black text-xs uppercase hover:bg-gray-100 transition-colors"
                    >
                      Back to Curriculum
                    </button>
                    <button 
                      type="submit"
                      onClick={() => handleSaveCourse('published')}
                      disabled={loading}
                      className="px-6 py-3 bg-[#f39c12] border-4 border-gray-900 text-gray-900 font-black text-xs uppercase shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2"
                    >
                      {loading && <div className="w-4 h-4 border-2 border-gray-950 border-t-white rounded-full animate-spin" />}
                      <Save className="w-5 h-5" />
                      Publish Course Now
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}

export default OrgCreateCoursePage;
