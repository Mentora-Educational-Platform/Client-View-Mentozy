import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Award, 
  UserPlus, 
  RefreshCw, 
  Loader2, 
  X, 
  Send,
  Mail,
  Phone,
  User,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../../context/AuthContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { 
  KrishnaiteCourseApplication, 
  getAllKrishnaiteApplications, 
  createAIvantageWinnerInvitation 
} from '../../../lib/api';
import { sendAdminNotification, buildKrishnaiteAIvantageWinnerInvitationEmail } from '../../../lib/adminNotifications';

export function AdminKrishnaiteApplicationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [applications, setApplications] = useState<KrishnaiteCourseApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'under_review' | 'needs_info' | 'accepted' | 'invited' | 'declined'>('ALL');
  const [scholarshipFilter, setScholarshipFilter] = useState<'ALL' | '50' | '75' | '100'>('ALL');

  // AIvantage Winner Invitation Modal State
  const [winnerModalOpen, setWinnerModalOpen] = useState(false);
  const [winnerName, setWinnerName] = useState('');
  const [winnerEmail, setWinnerEmail] = useState('');
  const [winnerPhone, setWinnerPhone] = useState('');
  const [winnerNotes, setWinnerNotes] = useState('AIvantage Quiz Winner — 100% Scholarship');
  const [isInvitingWinner, setIsInvitingWinner] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await getAllKrishnaiteApplications();
      setApplications(data || []);
    } catch (err) {
      console.warn('[Admin KGA] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Filtered applications
  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      // 1. Search Query
      const q = searchQuery.toLowerCase();
      const matchSearch = 
        (app.full_name || '').toLowerCase().includes(q) ||
        (app.email || '').toLowerCase().includes(q) ||
        (app.application_id || '').toLowerCase().includes(q) ||
        (app.education_data?.institution || '').toLowerCase().includes(q);

      if (!matchSearch) return false;

      // 2. Status Filter
      if (statusFilter !== 'ALL') {
        if (app.status !== statusFilter) return false;
      }

      // 3. Scholarship Filter
      if (scholarshipFilter !== 'ALL') {
        if (app.scholarship_percentage.toString() !== scholarshipFilter) return false;
      }

      return true;
    });
  }, [applications, searchQuery, statusFilter, scholarshipFilter]);

  // Statistics KPIs
  const stats = useMemo(() => {
    return {
      total: applications.length,
      underReview: applications.filter(a => a.status === 'under_review' || a.status === 'submitted').length,
      needsInfo: applications.filter(a => a.status === 'needs_info').length,
      accepted: applications.filter(a => a.status === 'accepted').length,
      aivantageWinners: applications.filter(a => a.status === 'invited' || a.scholarship_percentage === 100).length,
      declined: applications.filter(a => a.status === 'declined').length
    };
  }, [applications]);

  // Handle Direct AIvantage Winner Designation
  const handleCreateAIvantageWinner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!winnerName.trim() || !winnerEmail.trim()) {
      toast.error('Please enter the winner full name and email address.');
      return;
    }

    setIsInvitingWinner(true);
    try {
      const created = await createAIvantageWinnerInvitation({
        fullName: winnerName.trim(),
        email: winnerEmail.trim(),
        phone: winnerPhone.trim() || undefined,
        notes: winnerNotes.trim(),
        adminUserId: user?.id
      });

      // Dispatch 100% Scholarship Invitation Email
      sendAdminNotification({
        to: created.email,
        subject: `🏆 You are Invited! AIvantage Quiz Winner — Krishnaite 18-Day AI Course (100% Free)`,
        html: buildKrishnaiteAIvantageWinnerInvitationEmail({
          fullName: created.full_name,
          applicationId: created.application_id,
          email: created.email
        })
      }).catch(err => console.warn('[Notifications] Winner email dispatch skipped:', err));

      toast.success(`AIvantage Winner ${created.full_name} designated with 100% scholarship (${created.application_id}).`);
      setWinnerModalOpen(false);
      setWinnerName('');
      setWinnerEmail('');
      setWinnerPhone('');
      fetchApplications();
    } catch (err) {
      console.error('[Admin] Winner invite error:', err);
      toast.error('Failed to create winner invitation.');
    } finally {
      setIsInvitingWinner(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 border border-gray-900 text-[10px] font-black uppercase">ACCEPTED</span>;
      case 'invited':
        return <span className="px-2.5 py-0.5 bg-purple-100 text-purple-900 border border-gray-900 text-[10px] font-black uppercase">🏆 AIVANTAGE WINNER</span>;
      case 'needs_info':
        return <span className="px-2.5 py-0.5 bg-amber-200 text-amber-950 border border-gray-900 text-[10px] font-black uppercase">NEEDS INFO</span>;
      case 'declined':
        return <span className="px-2.5 py-0.5 bg-red-100 text-red-900 border border-gray-900 text-[10px] font-black uppercase">DECLINED</span>;
      case 'waitlisted':
        return <span className="px-2.5 py-0.5 bg-blue-100 text-blue-900 border border-gray-900 text-[10px] font-black uppercase">WAITLISTED</span>;
      case 'under_review':
      case 'submitted':
      default:
        return <span className="px-2.5 py-0.5 bg-amber-50 text-amber-900 border border-gray-900 text-[10px] font-black uppercase">UNDER REVIEW</span>;
    }
  };

  return (
    <AdminLayout activeTab="krishnaite" pendingCount={stats.underReview + stats.needsInfo}>
      <div className="space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-4 border-gray-900 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#f39c12] text-gray-900 border-2 border-gray-900 text-[10px] font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              <Sparkles className="w-3.5 h-3.5" /> KRISHNAITE ACADEMY ADMISSIONS
            </div>
            <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-gray-900 mt-1">
              18-DAY AI COURSE APPLICATIONS
            </h1>
            <p className="text-xs font-bold text-gray-600">
              Review applicant dossiers, assign scholarships, request information, and invite AIvantage Quiz winners.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchApplications}
              className="p-2.5 bg-white hover:bg-gray-100 border-2 border-gray-900 text-xs font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] min-h-[44px]"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setWinnerModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#f39c12] hover:bg-[#e67e22] text-gray-900 border-2 sm:border-3 border-gray-900 font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all min-h-[44px]"
            >
              <UserPlus className="w-4 h-4" />
              + DESIGNATE AIvantage WINNER
            </button>
          </div>
        </div>

        {/* Statistical KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 bg-white border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            <p className="text-[10px] font-black uppercase text-gray-500">Total Applicants</p>
            <p className="text-xl font-black text-gray-900">{stats.total}</p>
          </div>

          <div className="p-3.5 bg-amber-50 border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            <p className="text-[10px] font-black uppercase text-amber-800">Under Review</p>
            <p className="text-xl font-black text-amber-900">{stats.underReview}</p>
          </div>

          <div className="p-3.5 bg-yellow-100 border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            <p className="text-[10px] font-black uppercase text-yellow-800">Needs Info</p>
            <p className="text-xl font-black text-yellow-950">{stats.needsInfo}</p>
          </div>

          <div className="p-3.5 bg-emerald-50 border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            <p className="text-[10px] font-black uppercase text-emerald-800">Accepted (50%/75%)</p>
            <p className="text-xl font-black text-emerald-900">{stats.accepted}</p>
          </div>

          <div className="p-3.5 bg-purple-50 border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            <p className="text-[10px] font-black uppercase text-purple-800">AIvantage 100% Free</p>
            <p className="text-xl font-black text-purple-900">{stats.aivantageWinners}</p>
          </div>

          <div className="p-3.5 bg-red-50 border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            <p className="text-[10px] font-black uppercase text-red-800">Declined</p>
            <p className="text-xl font-black text-red-900">{stats.declined}</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white border-2 sm:border-4 border-gray-900 p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, application ID, institution..."
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none focus:bg-white"
              />
            </div>

            {/* Scholarship Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-gray-700 hidden sm:inline">Scholarship:</span>
              <select
                value={scholarshipFilter}
                onChange={e => setScholarshipFilter(e.target.value as any)}
                className="p-2.5 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none"
              >
                <option value="ALL">All Scholarships</option>
                <option value="50">50% Scholarship (₹5,000)</option>
                <option value="75">75% Scholarship (₹2,500)</option>
                <option value="100">100% Free (AIvantage Winner)</option>
              </select>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
            {[
              { id: 'ALL', label: `All (${applications.length})` },
              { id: 'under_review', label: `Under Review (${stats.underReview})` },
              { id: 'needs_info', label: `Needs Info (${stats.needsInfo})` },
              { id: 'accepted', label: `Accepted (${stats.accepted})` },
              { id: 'invited', label: `AIvantage Winners (${stats.aivantageWinners})` },
              { id: 'declined', label: `Declined (${stats.declined})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-black uppercase border-2 border-gray-900 transition-all ${
                  statusFilter === tab.id
                    ? 'bg-gray-900 text-white shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                    : 'bg-white hover:bg-gray-100 text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="p-12 text-center bg-white border-2 border-gray-900">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-700" />
            <p className="text-xs font-bold uppercase mt-2 text-gray-600">Loading Applications...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="p-12 text-center bg-white border-2 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-black uppercase text-gray-900">No applications match your filter.</p>
            <p className="text-xs font-bold text-gray-500 mt-1">Try adjusting the search query or status filter.</p>
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white border-4 border-gray-900 shadow-[6px_6px_0px_rgba(0,0,0,1)] overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-900 text-gray-900 uppercase font-black">
                    <th className="p-3.5 border-r-2 border-gray-900">Application ID</th>
                    <th className="p-3.5 border-r-2 border-gray-900">Applicant</th>
                    <th className="p-3.5 border-r-2 border-gray-900">Education / Role</th>
                    <th className="p-3.5 border-r-2 border-gray-900">Scholarship Tier</th>
                    <th className="p-3.5 border-r-2 border-gray-900">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-gray-900 font-bold">
                  {filteredApps.map(app => (
                    <tr key={app.id} className="hover:bg-amber-50/50 transition-colors">
                      <td className="p-3.5 border-r-2 border-gray-900">
                        <span className="font-black text-gray-900">{app.application_id}</span>
                        <span className="block text-[10px] text-gray-500">
                          {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : 'Draft'}
                        </span>
                      </td>

                      <td className="p-3.5 border-r-2 border-gray-900">
                        <span className="font-black text-gray-900">{app.full_name}</span>
                        <span className="block text-[11px] text-gray-600">{app.email}</span>
                      </td>

                      <td className="p-3.5 border-r-2 border-gray-900">
                        <span>{app.education_data?.education_status || '—'}</span>
                        <span className="block text-[10px] text-gray-500 truncate max-w-[200px]">
                          {app.education_data?.institution || app.professional_data?.occupation || '—'}
                        </span>
                      </td>

                      <td className="p-3.5 border-r-2 border-gray-900">
                        <span className="font-black text-indigo-700">{app.scholarship_percentage}%</span>
                        <span className="block text-[10px] text-gray-600 font-black">
                          {app.payable_amount === 0 ? '₹0 (100% Free)' : `₹${app.payable_amount.toLocaleString()}`}
                        </span>
                      </td>

                      <td className="p-3.5 border-r-2 border-gray-900">
                        {getStatusBadge(app.status)}
                      </td>

                      <td className="p-3.5 text-right">
                        <Link
                          to={`/admin/krishnaite-applications/${app.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f39c12] hover:bg-[#e67e22] text-gray-900 border-2 border-gray-900 text-xs font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" /> REVIEW
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (< 768px) */}
            <div className="md:hidden space-y-3">
              {filteredApps.map(app => (
                <div 
                  key={app.id}
                  className="bg-white border-2 border-gray-900 p-4 shadow-[3px_3px_0px_rgba(0,0,0,1)] space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase text-gray-500 block">
                        {app.application_id} • {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : 'Draft'}
                      </span>
                      <h3 className="text-base font-black text-gray-900 uppercase">
                        {app.full_name}
                      </h3>
                      <p className="text-xs text-gray-600 break-all">{app.email}</p>
                    </div>

                    <div className="shrink-0">
                      {getStatusBadge(app.status)}
                    </div>
                  </div>

                  <div className="p-2.5 bg-gray-50 border border-gray-900 text-xs font-bold text-gray-700 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase block">Scholarship</span>
                      <span className="font-black text-indigo-700">{app.scholarship_percentage}%</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-500 uppercase block">Payable</span>
                      <span className="font-black text-gray-900">
                        {app.payable_amount === 0 ? '₹0 Free' : `₹${app.payable_amount.toLocaleString()}`}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/admin/krishnaite-applications/${app.id}`}
                    className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-[#f39c12] hover:bg-[#e67e22] text-gray-900 border-2 border-gray-900 font-black text-xs uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                  >
                    <Eye className="w-4 h-4" /> REVIEW DOSSIER <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* DIRECT AIVANTAGE WINNER INVITATION MODAL */}
      {winnerModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white border-4 border-gray-900 p-6 sm:p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] space-y-6">
            
            <div className="flex items-center justify-between border-b-2 border-gray-900 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-700" />
                <h3 className="text-base sm:text-lg font-black uppercase text-gray-900">
                  DESIGNATE AIvantage QUIZ WINNER
                </h3>
              </div>
              <button
                onClick={() => setWinnerModalOpen(false)}
                className="p-1 hover:bg-gray-100 border border-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-purple-50 border-2 border-gray-900 text-xs font-bold text-purple-950 space-y-1">
              <p className="font-black uppercase">🏆 100% Scholarship Direct Invitation</p>
              <p className="leading-relaxed">
                Designated AIvantage Quiz winners automatically receive a 100% Scholarship (₹10,000 → ₹0, Completely Free) and an invitation link. They are not required to fill out the standard application.
              </p>
            </div>

            <form onSubmit={handleCreateAIvantageWinner} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-gray-900">Winner Full Name *</label>
                <input
                  type="text"
                  required
                  value={winnerName}
                  onChange={e => setWinnerName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full p-2.5 bg-gray-50 border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-gray-900">Winner Email Address *</label>
                <input
                  type="email"
                  required
                  value={winnerEmail}
                  onChange={e => setWinnerEmail(e.target.value)}
                  placeholder="e.g. sarah@example.com"
                  className="w-full p-2.5 bg-gray-50 border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-gray-900">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={winnerPhone}
                  onChange={e => setWinnerPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full p-2.5 bg-gray-50 border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-gray-900">Internal Admin Notes</label>
                <textarea
                  rows={2}
                  value={winnerNotes}
                  onChange={e => setWinnerNotes(e.target.value)}
                  placeholder="Notes regarding quiz rank, cohort assignment, etc."
                  className="w-full p-2.5 bg-gray-50 border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-gray-900">
                <button
                  type="button"
                  onClick={() => setWinnerModalOpen(false)}
                  className="px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-900 border-2 border-gray-900 font-black text-xs uppercase min-h-[44px]"
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  disabled={isInvitingWinner}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white border-2 border-gray-900 font-black text-xs uppercase shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all min-h-[44px]"
                >
                  {isInvitingWinner ? <Loader2 className="w-4 h-4 animate-spin" /> : 'CONFIRM & SEND INVITATION →'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminKrishnaiteApplicationsPage;
