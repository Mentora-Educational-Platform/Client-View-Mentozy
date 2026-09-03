import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  ArrowRight, 
  ArrowUpDown, 
  Loader2,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { supabase } from '../../../lib/supabase';

interface ApplicationRow {
  id: string;
  application_number: string;
  full_name: string;
  display_name?: string;
  email: string;
  phone_number?: string;
  primary_expertise: string;
  secondary_expertise?: string[];
  education_status?: string;
  degree?: string;
  institution?: string;
  occupation?: string;
  years_experience?: string;
  status: string;
  submitted_at: string;
}

export function AdminMentorApplicationsPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expertiseFilter, setExpertiseFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Fetch all applications
  const fetchApplications = async () => {
    setLoading(true);
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('mentor_applications')
        .select('*')
        .order('submitted_at', { ascending: sortOrder === 'oldest' });

      if (!error && data) {
        setApplications(data);
      }
    } catch (err) {
      console.warn('[Applications Page] Error querying applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [sortOrder]);

  // Extract unique expertise categories for filter
  const expertiseCategories = useMemo(() => {
    const set = new Set<string>();
    applications.forEach(a => {
      if (a.primary_expertise) set.add(a.primary_expertise);
    });
    return Array.from(set);
  }, [applications]);

  // Filtered & Searched records
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      // 1. Status Filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'under_review') {
          if (app.status !== 'under_review' && app.status !== 'pending' && app.status !== 'submitted') return false;
        } else if (app.status !== statusFilter) {
          return false;
        }
      }

      // 2. Expertise Filter
      if (expertiseFilter !== 'all' && app.primary_expertise !== expertiseFilter) {
        return false;
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = app.full_name?.toLowerCase().includes(query);
        const matchDisplay = app.display_name?.toLowerCase().includes(query);
        const matchEmail = app.email?.toLowerCase().includes(query);
        const matchId = app.application_number?.toLowerCase().includes(query);
        const matchExpertise = app.primary_expertise?.toLowerCase().includes(query);

        if (!matchName && !matchDisplay && !matchEmail && !matchId && !matchExpertise) {
          return false;
        }
      }

      return true;
    });
  }, [applications, statusFilter, expertiseFilter, searchQuery]);

  return (
    <AdminLayout activeTab="applications">
      <div className="space-y-6 text-left">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-4 border-gray-900">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 bg-[#eff3ff] border-2 border-gray-900 text-[10px] font-black uppercase">
                Admissions Registry
              </span>
              <span className="text-xs font-bold text-gray-500 uppercase">{filteredApplications.length} Found</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-gray-900">
              Mentor Applications
            </h1>
          </div>

          <button 
            onClick={fetchApplications}
            className="flex items-center gap-2 px-4 py-2 border-2 border-gray-900 bg-white text-gray-900 text-xs font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-gray-50 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Records
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white border-2 sm:border-4 border-gray-900 p-3.5 sm:p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_rgba(0,0,0,1)] space-y-3.5 sm:space-y-4">
          
          {/* Top Search & Category dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            
            {/* Search Input */}
            <div className="sm:col-span-6 lg:col-span-7 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
              <input 
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, ID, or expertise..."
                className="w-full bg-[#FAF9F6] border-2 border-gray-900 pl-10 pr-3 py-2.5 min-h-[44px] font-bold text-xs focus:bg-white outline-none"
              />
            </div>

            {/* Expertise Filter */}
            <div className="sm:col-span-3 lg:col-span-3">
              <select
                value={expertiseFilter}
                onChange={e => setExpertiseFilter(e.target.value)}
                className="w-full bg-[#FAF9F6] border-2 border-gray-900 px-3 py-2.5 min-h-[44px] font-bold text-xs focus:bg-white outline-none"
              >
                <option value="all">All Expertise Areas</option>
                {expertiseCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div className="sm:col-span-3 lg:col-span-2">
              <button 
                onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
                className="w-full py-2.5 px-3 min-h-[44px] border-2 border-gray-900 bg-[#eff3ff] font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-indigo-100 cursor-pointer"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
              </button>
            </div>

          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-2 border-t-2 border-gray-100 text-[11px] sm:text-xs font-black uppercase">
            {[
              { id: 'all', label: 'All' },
              { id: 'under_review', label: 'Under Review' },
              { id: 'needs_info', label: 'Needs Info' },
              { id: 'approved', label: 'Approved' },
              { id: 'rejected', label: 'Declined' }
            ].map(tab => {
              const count = applications.filter(a => {
                if (tab.id === 'all') return true;
                if (tab.id === 'under_review') return a.status === 'under_review' || a.status === 'pending' || a.status === 'submitted';
                return a.status === tab.id;
              }).length;

              const isSelected = statusFilter === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-2.5 sm:px-3 py-1.5 min-h-[36px] border-2 border-gray-900 transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-[#f39c12] text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] font-black' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab.label} ({count})
                </button>
              );
            })}
          </div>

        </div>

        {/* Applications List */}
        <div className="bg-white border-2 sm:border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_rgba(0,0,0,1)] overflow-hidden">
          {loading ? (
            <div className="p-12 sm:p-16 text-center text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#f39c12] mb-3" />
              <p className="font-black text-xs uppercase">Querying Admissions Database...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="p-12 sm:p-16 text-center space-y-3">
              <div className="w-12 h-12 bg-gray-100 border-2 border-gray-900 flex items-center justify-center mx-auto text-gray-400">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-black text-sm uppercase text-gray-900">No applications match the selected criteria</h3>
              <p className="text-xs font-bold text-gray-500 max-w-sm mx-auto">
                Try resetting your filters or search query to view all applications.
              </p>
              <button 
                onClick={() => { setSearchQuery(''); setStatusFilter('all'); setExpertiseFilter('all'); }}
                className="px-4 py-2 min-h-[40px] bg-gray-900 text-white font-black text-xs uppercase border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table View (>= 768px) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs font-bold">
                  <thead>
                    <tr className="border-b-4 border-gray-900 bg-gray-50 text-[11px] font-black uppercase text-gray-700">
                      <th className="p-4">Application ID</th>
                      <th className="p-4">Applicant</th>
                      <th className="p-4">Expertise & Skills</th>
                      <th className="p-4">Education / Role</th>
                      <th className="p-4">Submitted</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-gray-100">
                    {filteredApplications.map(app => {
                      const isUnderReview = app.status === 'under_review' || app.status === 'pending' || app.status === 'submitted';
                      const isNeedsInfo = app.status === 'needs_info';
                      const isApproved = app.status === 'approved';
                      const isRejected = app.status === 'rejected';

                      return (
                        <tr key={app.id} className="hover:bg-[#FAF9F6] transition-colors">
                          
                          {/* ID */}
                          <td className="p-4 font-black text-gray-900 whitespace-nowrap">
                            {app.application_number || 'MNT-2026-APP'}
                          </td>

                          {/* Name / Email */}
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-[#eff3ff] border-2 border-gray-900 flex items-center justify-center font-black text-xs shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                {app.full_name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-black text-gray-900 text-xs uppercase">{app.full_name}</p>
                                <p className="text-[10px] text-gray-500 font-bold">{app.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* Expertise */}
                          <td className="p-4">
                            <p className="font-black text-indigo-700">{app.primary_expertise}</p>
                            {app.secondary_expertise && app.secondary_expertise.length > 0 && (
                              <p className="text-[10px] text-gray-500 truncate max-w-[180px]">
                                {app.secondary_expertise.join(', ')}
                              </p>
                            )}
                          </td>

                          {/* Education / Role */}
                          <td className="p-4 text-[11px] text-gray-700">
                            <p className="font-bold">{app.degree || app.education_status || '—'}</p>
                            <p className="text-[10px] text-gray-500">{app.occupation || app.institution || '—'}</p>
                          </td>

                          {/* Submitted */}
                          <td className="p-4 text-gray-600 text-[11px] whitespace-nowrap">
                            {new Date(app.submitted_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </td>

                          {/* Status */}
                          <td className="p-4 whitespace-nowrap">
                            <span className={`inline-block px-3 py-1 border-2 border-gray-900 text-[10px] font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] ${
                              isApproved ? 'bg-emerald-300 text-gray-900' :
                              isNeedsInfo ? 'bg-purple-300 text-gray-900 animate-pulse' :
                              isRejected ? 'bg-rose-300 text-gray-900' :
                              'bg-amber-300 text-gray-900'
                            }`}>
                              {isApproved ? 'Approved' : isNeedsInfo ? 'Needs Info' : isRejected ? 'Declined' : 'Under Review'}
                            </span>
                          </td>

                          {/* Action */}
                          <td className="p-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => navigate(`/admin/mentor-applications/${app.id}`)}
                              className="px-4 py-2 bg-[#f39c12] hover:bg-[#e08e0b] border-2 border-gray-900 text-gray-900 text-xs font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all inline-flex items-center gap-1 cursor-pointer"
                            >
                              View Application <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List (< 768px) */}
              <div className="md:hidden divide-y-4 divide-gray-900">
                {filteredApplications.map(app => {
                  const isUnderReview = app.status === 'under_review' || app.status === 'pending' || app.status === 'submitted';
                  const isNeedsInfo = app.status === 'needs_info';
                  const isApproved = app.status === 'approved';
                  const isRejected = app.status === 'rejected';

                  return (
                    <div key={app.id} className="p-4 bg-white space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 bg-[#eff3ff] border-2 border-gray-900 flex items-center justify-center font-black text-xs shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                            {app.full_name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-xs text-gray-900 uppercase truncate">{app.full_name}</p>
                            <p className="text-[10px] text-gray-500 font-mono truncate">{app.application_number || 'MNT-2026-APP'}</p>
                          </div>
                        </div>
                        <span className={`inline-block px-2.5 py-1 border-2 border-gray-900 text-[10px] font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] shrink-0 ${
                          isApproved ? 'bg-emerald-300 text-gray-900' :
                          isNeedsInfo ? 'bg-purple-300 text-gray-900 animate-pulse' :
                          isRejected ? 'bg-rose-300 text-gray-900' :
                          'bg-amber-300 text-gray-900'
                        }`}>
                          {isApproved ? 'Approved' : isNeedsInfo ? 'Needs Info' : isRejected ? 'Declined' : 'Under Review'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-[#FAF9F6] border-2 border-gray-900 p-3 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                        <div>
                          <span className="text-[9px] text-gray-500 font-bold uppercase block">Expertise</span>
                          <span className="font-black text-indigo-700 truncate block">{app.primary_expertise}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-500 font-bold uppercase block">Education / Role</span>
                          <span className="font-bold text-gray-800 truncate block">{app.degree || app.education_status || '—'}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-500 font-bold uppercase block">Email</span>
                          <span className="font-bold text-gray-700 truncate block">{app.email}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-500 font-bold uppercase block">Submitted</span>
                          <span className="font-bold text-gray-700 block">{new Date(app.submitted_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/admin/mentor-applications/${app.id}`)}
                        className="w-full py-3 min-h-[44px] bg-[#f39c12] hover:bg-[#e08e0b] border-2 border-gray-900 text-gray-900 text-xs font-black uppercase shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        View Application Details <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}

export default AdminMentorApplicationsPage;
