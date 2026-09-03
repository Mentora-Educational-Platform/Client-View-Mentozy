import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  ArrowLeft,
  Mail,
  Users,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Save,
  Key,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  getOrganizationById,
  updateOrganizationStatus,
  MentozyOrganization
} from '../../../lib/api';
import {
  sendAdminNotification,
  buildOrganizationProvisionedEmail
} from '../../../lib/adminNotifications';

export const AdminOrganizationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [org, setOrg] = useState<MentozyOrganization | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'active' | 'pending' | 'suspended'>('active');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const fetchOrg = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getOrganizationById(id);
      if (data) {
        setOrg(data);
        setStatus(data.status);
        setNotes(data.notes || '');
      } else {
        toast.error('Organization not found');
      }
    } catch (err) {
      console.error('[AdminOrgDetail] Failed to load organization:', err);
      toast.error('Failed to load organization');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrg();
  }, [id]);

  const handleStatusSave = async () => {
    if (!org) return;
    try {
      setIsSaving(true);
      const updated = await updateOrganizationStatus(org.id, status, notes);
      if (updated) {
        setOrg(updated);
        toast.success(`Organization status updated to "${status}"`);
      }
    } catch (err) {
      console.error('[AdminOrgDetail] Status update failed:', err);
      toast.error('Failed to update status');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResendCredentials = async () => {
    if (!org || !org.owner_email) {
      toast.error('No admin email found for this organization');
      return;
    }

    try {
      setIsResending(true);
      const loginUrl = `${window.location.origin}/org-login`;
      const emailHtml = buildOrganizationProvisionedEmail({
        orgName: org.name,
        email: org.owner_email,
        loginUrl,
        contactPerson: org.founder_name
      });

      await sendAdminNotification({
        to: org.owner_email,
        subject: `Mentozy Organization Portal Access: ${org.name}`,
        html: emailHtml
      });

      toast.success(`Credentials reminder dispatched to ${org.owner_email}`);
    } catch (err) {
      console.error('[AdminOrgDetail] Email dispatch failed:', err);
      toast.error('Failed to dispatch credentials email');
    } finally {
      setIsResending(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout activeTab="organizations">
        <div className="p-16 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-black uppercase text-gray-600">Loading Organization Dossier...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!org) {
    return (
      <AdminLayout activeTab="organizations">
        <div className="bg-white border-4 border-gray-900 p-8 text-center space-y-4 shadow-[6px_6px_0px_0px_#000]">
          <h2 className="text-xl font-black uppercase text-gray-900">Organization Not Found</h2>
          <p className="text-xs text-gray-600">
            The requested organization identifier could not be located in our records.
          </p>
          <Link
            to="/admin/organizations"
            className="inline-flex items-center gap-2 bg-[#FFE600] border-2 border-gray-900 px-4 py-2 text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000]"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Organizations
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="organizations">
      <div className="space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-gray-500">
          <Link to="/admin" className="hover:text-black underline">Admin</Link>
          <span>/</span>
          <Link to="/admin/organizations" className="hover:text-black underline">Organizations</Link>
          <span>/</span>
          <span className="text-black font-black bg-[#FFE600] px-2 py-0.5 border border-black">
            {org.name}
          </span>
        </div>

        {/* Dossier Header */}
        <div className="bg-white border-4 border-gray-900 shadow-[8px_8px_0px_0px_#000] p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-[#FFE600] border-3 border-gray-900 shadow-[3px_3px_0px_0px_#000] flex items-center justify-center font-black text-2xl flex-shrink-0">
                {org.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase bg-gray-100 border border-gray-900 px-2 py-0.5">
                    {org.org_type || 'Educational Partner'}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 border ${
                      org.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-800'
                        : org.status === 'pending'
                        ? 'bg-amber-100 text-amber-800 border-amber-800'
                        : 'bg-rose-100 text-rose-800 border-rose-800'
                    }`}
                  >
                    {org.status}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-gray-900">
                  {org.name}
                </h1>
                <p className="text-xs font-mono text-gray-500 mt-1">
                  Slug: <strong>{org.slug}</strong> • ID: <code>{org.id}</code>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleResendCredentials}
                disabled={isResending}
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-900 px-4 py-2.5 text-xs font-black uppercase shadow-[3px_3px_0px_0px_#000] active:shadow-none transition-all cursor-pointer disabled:opacity-50"
              >
                <Key className="w-3.5 h-3.5" />
                {isResending ? 'Sending...' : 'Resend Credentials'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-[#FAF9F6] border-3 border-gray-900 p-5 shadow-[4px_4px_0px_0px_#000]">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-[11px] font-black uppercase">Faculty Teachers</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-black text-gray-900">{org.teacher_count || 0}</div>
            <div className="text-[10px] text-gray-500 font-bold mt-1">Authorized instructors</div>
          </div>

          <div className="bg-[#FAF9F6] border-3 border-gray-900 p-5 shadow-[4px_4px_0px_0px_#000]">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-[11px] font-black uppercase">Enrolled Students</span>
              <GraduationCap className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-3xl font-black text-gray-900">{org.student_count || 0}</div>
            <div className="text-[10px] text-gray-500 font-bold mt-1">Active learners</div>
          </div>

          <div className="bg-[#FAF9F6] border-3 border-gray-900 p-5 shadow-[4px_4px_0px_0px_#000]">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-[11px] font-black uppercase">Active Cohorts</span>
              <BookOpen className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-gray-900">{org.course_count || 1}</div>
            <div className="text-[10px] text-gray-500 font-bold mt-1">Deployed curricula</div>
          </div>
        </div>

        {/* Two-Column Details & Management Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Organization Metadata */}
          <div className="bg-white border-4 border-gray-900 p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000] space-y-5">
            <h2 className="text-lg font-black uppercase tracking-tight text-gray-900 border-b-2 border-gray-900 pb-3">
              Partner Metadata
            </h2>

            <div className="space-y-4 text-xs font-mono">
              <div className="p-3 bg-gray-50 border-2 border-gray-900">
                <span className="text-[10px] font-bold text-gray-500 uppercase block">Official Admin Email</span>
                <span className="text-sm font-black text-gray-900">{org.owner_email || 'Not configured'}</span>
              </div>

              <div className="p-3 bg-gray-50 border-2 border-gray-900">
                <span className="text-[10px] font-bold text-gray-500 uppercase block">Founder / Lead Contact</span>
                <span className="text-sm font-black text-gray-900">{org.founder_name || 'Administrator'}</span>
              </div>

              <div className="p-3 bg-gray-50 border-2 border-gray-900">
                <span className="text-[10px] font-bold text-gray-500 uppercase block">Partner Scope / Description</span>
                <p className="text-xs text-gray-700 font-sans mt-1">
                  {org.description || 'No description provided.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 border-2 border-gray-900">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">Provisioned Date</span>
                  <span className="font-bold text-gray-900">
                    {org.created_at ? new Date(org.created_at).toLocaleDateString() : '—'}
                  </span>
                </div>

                <div className="p-3 bg-gray-50 border-2 border-gray-900">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">Dedicated Login Portal</span>
                  <Link to="/org-login" target="_blank" className="font-bold text-blue-600 underline flex items-center gap-1">
                    /org-login <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Administrative Controls & Status */}
          <div className="bg-white border-4 border-gray-900 p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000] space-y-5">
            <h2 className="text-lg font-black uppercase tracking-tight text-gray-900 border-b-2 border-gray-900 pb-3">
              Administrative Control
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-gray-900 mb-1.5">
                  Partner Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full p-3 bg-[#FAF8F5] border-2 border-gray-900 font-mono text-xs font-bold focus:bg-white focus:outline-none"
                >
                  <option value="active">Active (Access Granted to /org-dashboard)</option>
                  <option value="pending">Pending Review (Setup in Progress)</option>
                  <option value="suspended">Suspended (Access Temporarily Blocked)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-900 mb-1.5">
                  Internal Administrative Notes
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record agreement terms, custom pricing, or internal coordination details..."
                  className="w-full p-3 bg-[#FAF8F5] border-2 border-gray-900 font-mono text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStatusSave}
                  disabled={isSaving}
                  className="w-full py-3.5 bg-[#FFE600] hover:bg-[#ffe100] active:translate-x-0.5 active:translate-y-0.5 border-3 border-gray-900 shadow-[4px_4px_0px_0px_#000] active:shadow-none font-black text-xs uppercase tracking-wider text-gray-900 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving Changes...' : 'Save Status & Notes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
