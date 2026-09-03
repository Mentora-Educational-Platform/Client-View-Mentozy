import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  ArrowRight, 
  Sparkles, 
  ChevronRight, 
  Loader2, 
  ExternalLink,
  Shield,
  Search,
  Filter
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { supabase } from '../../../lib/supabase';

interface ApplicationSummary {
  id: string;
  application_number: string;
  full_name: string;
  display_name?: string;
  email: string;
  primary_expertise: string;
  education_status?: string;
  degree?: string;
  status: string;
  submitted_at: string;
}

export function AdminDashboardPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    underReview: 0,
    needsInfo: 0,
    approved: 0,
    rejected: 0
  });
  const [recentApplications, setRecentApplications] = useState<ApplicationSummary[]>([]);

  useEffect(() => {
    async function fetchDashboardMetrics() {
      console.log("ADMIN DASHBOARD: fetchDashboardMetrics START");
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        // 1. Fetch real applications from Supabase
        console.log("ADMIN DASHBOARD: Querying mentor_applications...");
        const { data: apps, error } = await supabase
          .from('mentor_applications')
          .select('id, application_number, full_name, display_name, email, primary_expertise, education_status, degree, status, submitted_at')
          .order('submitted_at', { ascending: false });

        console.log("ADMIN DASHBOARD: mentor_applications result:", { count: apps?.length, error });

        if (!error && apps) {
          const total = apps.length;
          const underReview = apps.filter(a => a.status === 'under_review' || a.status === 'pending' || a.status === 'submitted').length;
          const needsInfo = apps.filter(a => a.status === 'needs_info').length;
          const approved = apps.filter(a => a.status === 'approved').length;
          const rejected = apps.filter(a => a.status === 'rejected').length;

          setStats({ total, underReview, needsInfo, approved, rejected });
          setRecentApplications(apps.slice(0, 8));
        }
      } catch (err) {
        console.warn('[Admin Dashboard] Metric fetch error:', err);
      } finally {
        console.log("ADMIN DASHBOARD: fetchDashboardMetrics FINALLY (setLoading false)");
        setLoading(false);
      }
    }

    fetchDashboardMetrics();
  }, []);

  return (
    <AdminLayout activeTab="dashboard">
      <div className="space-y-8 text-left">
        
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-4 border-gray-900">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 bg-[#eff3ff] border-2 border-gray-900 text-[10px] font-black uppercase">
                Admissions Control
              </span>
              <span className="text-xs font-bold text-gray-500 uppercase">Live Overview</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-gray-900">
              Mentor Applications Dashboard
            </h1>
          </div>

          <Link
            to="/admin/mentor-applications"
            className="px-5 py-2.5 bg-[#f39c12] hover:bg-[#e08e0b] text-gray-900 font-black text-xs uppercase border-2 border-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all inline-flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            Manage All Applications <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 2. Statistical Metric Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Total Applications */}
          <div className="bg-white border-4 border-gray-900 p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-2">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-[10px] font-black uppercase tracking-wider">Total Received</span>
              <FileText className="w-4 h-4 text-gray-900" />
            </div>
            <p className="text-3xl font-black text-gray-900">
              {loading ? '—' : stats.total}
            </p>
            <p className="text-[10px] font-bold text-gray-500 uppercase">All Time Submissions</p>
          </div>

          {/* Under Review */}
          <div className="bg-white border-4 border-gray-900 p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-2">
            <div className="flex items-center justify-between text-amber-600">
              <span className="text-[10px] font-black uppercase tracking-wider">Under Review</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-3xl font-black text-gray-900">
              {loading ? '—' : stats.underReview}
            </p>
            <p className="text-[10px] font-bold text-amber-700 uppercase">Awaiting Decision</p>
          </div>

          {/* Needs Info */}
          <div className="bg-white border-4 border-gray-900 p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-2">
            <div className="flex items-center justify-between text-purple-600">
              <span className="text-[10px] font-black uppercase tracking-wider">Needs Info</span>
              <AlertCircle className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-3xl font-black text-gray-900">
              {loading ? '—' : stats.needsInfo}
            </p>
            <p className="text-[10px] font-bold text-purple-700 uppercase">Applicant Action Req.</p>
          </div>

          {/* Approved */}
          <div className="bg-white border-4 border-gray-900 p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-2">
            <div className="flex items-center justify-between text-emerald-600">
              <span className="text-[10px] font-black uppercase tracking-wider">Approved</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-3xl font-black text-gray-900">
              {loading ? '—' : stats.approved}
            </p>
            <p className="text-[10px] font-bold text-emerald-700 uppercase">Active Mentors</p>
          </div>

          {/* Rejected */}
          <div className="bg-white border-4 border-gray-900 p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-2 col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-rose-600">
              <span className="text-[10px] font-black uppercase tracking-wider">Declined</span>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-3xl font-black text-gray-900">
              {loading ? '—' : stats.rejected}
            </p>
            <p className="text-[10px] font-bold text-rose-700 uppercase">Archived</p>
          </div>

        </div>

        {/* 3. Recent Mentor Applications Table */}
        <div className="bg-white border-4 border-gray-900 shadow-[6px_6px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="px-6 py-4 border-b-4 border-gray-900 bg-[#eff3ff] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-700" />
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-900">
                Recent Mentor Applications
              </h2>
            </div>
            <Link 
              to="/admin/mentor-applications"
              className="text-xs font-black text-indigo-700 hover:text-indigo-900 uppercase underline"
            >
              View All ({stats.total}) →
            </Link>
          </div>

          {loading ? (
            <div className="p-8 sm:p-12 text-center text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#f39c12] mb-2" />
              <p className="text-xs font-bold uppercase">Loading applications...</p>
            </div>
          ) : recentApplications.length === 0 ? (
            <div className="p-8 sm:p-12 text-center text-gray-500 space-y-2">
              <p className="font-black text-sm uppercase text-gray-900">No mentor applications yet</p>
              <p className="text-xs font-bold max-w-sm mx-auto">
                New applications will appear here when candidates apply to become Mentozy mentors.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View (>= 768px) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs font-bold">
                  <thead>
                    <tr className="border-b-2 border-gray-900 bg-gray-50 text-[11px] font-black uppercase text-gray-600">
                      <th className="p-4">Application ID</th>
                      <th className="p-4">Applicant</th>
                      <th className="p-4">Primary Expertise</th>
                      <th className="p-4">Education / Role</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-gray-100">
                    {recentApplications.map(app => {
                      const isUnderReview = app.status === 'under_review' || app.status === 'pending' || app.status === 'submitted';
                      const isNeedsInfo = app.status === 'needs_info';
                      const isApproved = app.status === 'approved';
                      const isRejected = app.status === 'rejected';

                      return (
                        <tr key={app.id} className="hover:bg-[#FAF9F6] transition-colors">
                          <td className="p-4 font-black text-gray-900">
                            {app.application_number || 'MNT-2026-APP'}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded bg-[#eff3ff] border border-gray-900 flex items-center justify-center font-black text-xs shrink-0">
                                {app.full_name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-black text-gray-900">{app.full_name}</p>
                                <p className="text-[10px] text-gray-500">{app.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-bold text-gray-800">
                            {app.primary_expertise || 'General'}
                          </td>
                          <td className="p-4 text-gray-600 text-[11px]">
                            {app.degree || app.education_status || '—'}
                          </td>
                          <td className="p-4 text-gray-500 text-[11px]">
                            {new Date(app.submitted_at).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <span className={`inline-block px-2.5 py-0.5 border-2 border-gray-900 text-[10px] font-black uppercase ${
                              isApproved ? 'bg-emerald-100 text-emerald-900' :
                              isNeedsInfo ? 'bg-purple-100 text-purple-900' :
                              isRejected ? 'bg-rose-100 text-rose-900' :
                              'bg-amber-100 text-amber-900'
                            }`}>
                              {isApproved ? 'Approved' : isNeedsInfo ? 'Needs Info' : isRejected ? 'Declined' : 'Under Review'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => navigate(`/admin/mentor-applications/${app.id}`)}
                              className="px-3 py-1.5 bg-[#FAF9F6] hover:bg-[#f39c12] border-2 border-gray-900 text-[11px] font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer transition-all"
                            >
                              Review →
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List (< 768px) */}
              <div className="md:hidden divide-y-2 divide-gray-900">
                {recentApplications.map(app => {
                  const isUnderReview = app.status === 'under_review' || app.status === 'pending' || app.status === 'submitted';
                  const isNeedsInfo = app.status === 'needs_info';
                  const isApproved = app.status === 'approved';
                  const isRejected = app.status === 'rejected';

                  return (
                    <div key={app.id} className="p-4 bg-white space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded bg-[#eff3ff] border-2 border-gray-900 flex items-center justify-center font-black text-xs shrink-0 shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                            {app.full_name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-xs text-gray-900 uppercase truncate">{app.full_name}</p>
                            <p className="text-[10px] text-gray-500 font-mono truncate">{app.application_number || 'MNT-2026-APP'}</p>
                          </div>
                        </div>
                        <span className={`inline-block px-2 py-0.5 border-2 border-gray-900 text-[9px] font-black uppercase shrink-0 ${
                          isApproved ? 'bg-emerald-100 text-emerald-900' :
                          isNeedsInfo ? 'bg-purple-100 text-purple-900' :
                          isRejected ? 'bg-rose-100 text-rose-900' :
                          'bg-amber-100 text-amber-900'
                        }`}>
                          {isApproved ? 'Approved' : isNeedsInfo ? 'Needs Info' : isRejected ? 'Declined' : 'Under Review'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#FAF9F6] border-2 border-gray-900 p-2.5 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                        <div>
                          <span className="text-[9px] text-gray-500 font-bold uppercase block">Expertise</span>
                          <span className="font-black text-indigo-700 truncate block">{app.primary_expertise || 'General'}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-500 font-bold uppercase block">Submitted</span>
                          <span className="font-bold text-gray-700 block">{new Date(app.submitted_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/admin/mentor-applications/${app.id}`)}
                        className="w-full py-2.5 min-h-[44px] bg-[#f39c12] hover:bg-[#e08e0b] border-2 border-gray-900 text-xs font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Review Application →
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

export default AdminDashboardPage;
