import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Users,
  GraduationCap,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  Clock,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  getAllOrganizations,
  provisionOrganization,
  updateOrganizationStatus,
  MentozyOrganization
} from '../../../lib/api';
import {
  sendAdminNotification,
  buildOrganizationProvisionedEmail
} from '../../../lib/adminNotifications';
import { useAuth } from '../../../context/AuthContext';

export const AdminOrganizationsPage: React.FC = () => {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<MentozyOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');

  // Provisioning Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    orgType: 'Academy / Tech Institute',
    founderName: '',
    description: '',
    notes: '',
    sendEmail: true
  });

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const data = await getAllOrganizations();
      setOrganizations(data);
    } catch (err) {
      console.error('[AdminOrgs] Failed to load organizations:', err);
      toast.error('Failed to load organizations list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleProvisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Organization Name and Admin Email are required');
      return;
    }

    try {
      setIsProvisioning(true);
      const tempPassword = formData.password.trim() || 'OrgMentozy2026!';
      
      const newOrg = await provisionOrganization({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: tempPassword,
        orgType: formData.orgType,
        founderName: formData.founderName.trim(),
        description: formData.description.trim(),
        notes: formData.notes.trim(),
        adminUserId: user?.id
      });

      // Dispatch Provisioning Email if requested
      if (formData.sendEmail) {
        const loginUrl = `${window.location.origin}/org-login`;
        const emailHtml = buildOrganizationProvisionedEmail({
          orgName: newOrg.name,
          email: formData.email.trim(),
          temporaryPassword: tempPassword,
          loginUrl,
          contactPerson: formData.founderName.trim()
        });

        await sendAdminNotification({
          to: formData.email.trim(),
          subject: `Your Mentozy Organization Account is Ready: ${newOrg.name}`,
          html: emailHtml
        });
      }

      toast.success(`Organization "${newOrg.name}" successfully provisioned!`);
      setIsModalOpen(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        orgType: 'Academy / Tech Institute',
        founderName: '',
        description: '',
        notes: '',
        sendEmail: true
      });
      await fetchOrganizations();
    } catch (err: any) {
      console.error('[AdminOrgs] Provisioning failed:', err);
      toast.error(err?.message || 'Failed to provision organization');
    } finally {
      setIsProvisioning(false);
    }
  };

  const filteredOrgs = organizations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.owner_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.slug.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || org.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalActive = organizations.filter((o) => o.status === 'active').length;
  const totalTeachers = organizations.reduce((sum, o) => sum + (o.teacher_count || 0), 0);
  const totalStudents = organizations.reduce((sum, o) => sum + (o.student_count || 0), 0);

  return (
    <AdminLayout activeTab="organizations">
      <div className="space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-gray-900 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 bg-black text-[#FFE600] text-[10px] font-black uppercase tracking-wider">
                PARTNERSHIP MANAGEMENT
              </span>
              <span className="text-xs font-bold text-gray-500">• Strict Admin Provisioning</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-gray-900">
              ORGANIZATIONS & PARTNERS
            </h1>
            <p className="text-xs sm:text-sm font-bold text-gray-600 mt-1">
              Review approved institutional partners and provision dedicated workspaces.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-[#FFE600] hover:bg-[#ffe100] active:translate-x-0.5 active:translate-y-0.5 border-3 border-gray-900 shadow-[4px_4px_0px_0px_#000] active:shadow-none font-black text-xs uppercase tracking-wider py-3.5 px-6 transition-all cursor-pointer min-h-[48px]"
          >
            <Plus className="w-4 h-4" /> PROVISION ORGANIZATION
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white border-3 border-gray-900 p-5 shadow-[4px_4px_0px_0px_#000]">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-[11px] font-black uppercase">Total Orgs</span>
              <Building2 className="w-4 h-4 text-gray-900" />
            </div>
            <div className="text-3xl font-black text-gray-900">{organizations.length}</div>
            <div className="text-[10px] font-bold text-gray-500 mt-1">Institutions onboarded</div>
          </div>

          <div className="bg-white border-3 border-gray-900 p-5 shadow-[4px_4px_0px_0px_#000]">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-[11px] font-black uppercase">Active Partners</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-emerald-600">{totalActive}</div>
            <div className="text-[10px] font-bold text-gray-500 mt-1">Live workspaces</div>
          </div>

          <div className="bg-white border-3 border-gray-900 p-5 shadow-[4px_4px_0px_0px_#000]">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-[11px] font-black uppercase">Org Teachers</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-black text-blue-600">{totalTeachers}</div>
            <div className="text-[10px] font-bold text-gray-500 mt-1">Across all academies</div>
          </div>

          <div className="bg-white border-3 border-gray-900 p-5 shadow-[4px_4px_0px_0px_#000]">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-[11px] font-black uppercase">Org Learners</span>
              <GraduationCap className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-3xl font-black text-purple-600">{totalStudents}</div>
            <div className="text-[10px] font-bold text-gray-500 mt-1">Enrolled students</div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white border-3 border-gray-900 p-4 shadow-[4px_4px_0px_0px_#000] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border-2 border-gray-900 text-xs font-mono focus:outline-none focus:bg-[#FFFDF0]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {(['all', 'active', 'pending', 'suspended'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 border-2 border-gray-900 text-[11px] font-black uppercase transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-black text-[#FFE600] shadow-[2px_2px_0px_0px_#000]'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Organizations List / Table */}
        <div className="bg-white border-4 border-gray-900 shadow-[6px_6px_0px_0px_#000] overflow-hidden">
          {loading ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-black uppercase text-gray-600">Loading Organizations...</p>
            </div>
          ) : filteredOrgs.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 border-3 border-gray-900 flex items-center justify-center mx-auto">
                <Building2 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-black uppercase text-gray-900">No Organizations Found</h3>
              <p className="text-xs text-gray-600 max-w-sm mx-auto">
                No organizations matched your search filter. Click "+ Provision Organization" to onboard a new institutional partner.
              </p>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 bg-[#FFE600] border-2 border-gray-900 px-4 py-2 text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000]"
              >
                <Plus className="w-3.5 h-3.5" /> Provision First Org
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="bg-gray-900 text-white uppercase text-[10px] tracking-wider border-b-2 border-gray-900">
                    <th className="py-3 px-4">Organization</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Admin Email</th>
                    <th className="py-3 px-4 text-center">Faculty</th>
                    <th className="py-3 px-4 text-center">Learners</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-gray-200">
                  {filteredOrgs.map((org) => (
                    <tr key={org.id} className="hover:bg-[#FFFDF0] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-[#FFE600] border-2 border-gray-900 flex items-center justify-center font-black text-sm flex-shrink-0">
                            {org.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-black text-sm text-gray-900">{org.name}</div>
                            <div className="text-[10px] text-gray-500">slug: {org.slug}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-gray-100 border border-gray-900 font-bold text-[10px]">
                          {org.org_type || 'Educational'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-gray-800">
                        {org.owner_email || '—'}
                      </td>

                      <td className="py-3.5 px-4 text-center font-black">
                        <span className="text-blue-700 bg-blue-50 px-2 py-0.5 border border-blue-300">
                          {org.teacher_count || 0}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-black">
                        <span className="text-purple-700 bg-purple-50 px-2 py-0.5 border border-purple-300">
                          {org.student_count || 0}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-black uppercase border ${
                            org.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-800'
                              : org.status === 'pending'
                              ? 'bg-amber-100 text-amber-800 border-amber-800'
                              : 'bg-rose-100 text-rose-800 border-rose-800'
                          }`}
                        >
                          {org.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/admin/organizations/${org.id}`}
                          className="inline-flex items-center gap-1 bg-white hover:bg-gray-100 text-gray-900 border-2 border-gray-900 px-3 py-1 text-[11px] font-black uppercase shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
                        >
                          Dossier <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* PROVISIONING MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border-4 border-gray-900 shadow-[10px_10px_0px_0px_#000] max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b-3 border-gray-900 pb-4 mb-6">
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 border border-amber-400">
                    ADMIN ACTION
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-gray-900 mt-1">
                    Provision Organization Account
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 border-2 border-gray-900 flex items-center justify-center hover:bg-gray-100 font-bold"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleProvisionSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase text-gray-900 mb-1">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Delhi Public School / Horizon Academy"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF8F5] border-2 border-gray-900 font-mono text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-900 mb-1">
                      Organization Type
                    </label>
                    <select
                      value={formData.orgType}
                      onChange={(e) => setFormData({ ...formData, orgType: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF8F5] border-2 border-gray-900 font-mono text-xs focus:bg-white focus:outline-none"
                    >
                      <option value="Academy / Tech Institute">Academy / Tech Institute</option>
                      <option value="School (K-12)">School (K-12)</option>
                      <option value="College / University">College / University</option>
                      <option value="Coaching / Institute">Coaching / Institute</option>
                      <option value="Community / Non-Profit">Community / Non-Profit</option>
                      <option value="Corporate / Enterprise">Corporate / Enterprise</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-gray-900 mb-1">
                      Founder / Lead Contact
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Dr. Ananya Sen"
                      value={formData.founderName}
                      onChange={(e) => setFormData({ ...formData, founderName: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF8F5] border-2 border-gray-900 font-mono text-xs focus:bg-white focus:outline-none"
                    >
                    </input>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-gray-900 mb-1">
                    Official Admin Login Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="admin@institution.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF8F5] border-2 border-gray-900 font-mono text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-gray-900 mb-1">
                    Initial Provisioning Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Leave blank for auto-generated temporary password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full p-2.5 pr-10 bg-[#FAF8F5] border-2 border-gray-900 font-mono text-xs focus:bg-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 font-bold">
                    The partner will use this password to log in at <code>/org-login</code>.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-gray-900 mb-1">
                    Description / Scope of Partnership
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief details about the cohort size, curriculum, or arrangement..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF8F5] border-2 border-gray-900 font-mono text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="p-3 bg-[#EFF6FF] border-2 border-gray-900 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="sendEmailCheck"
                    checked={formData.sendEmail}
                    onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                    className="mt-1 w-4 h-4 accent-blue-600 border-2 border-black"
                  />
                  <label htmlFor="sendEmailCheck" className="text-xs font-bold text-blue-950 cursor-pointer">
                    Dispatch Welcome Credentials Email
                    <span className="block text-[10px] text-blue-800 font-normal mt-0.5">
                      Sends an official provisioning email with login credentials and direct portal link to the organization.
                    </span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 border-2 border-gray-900 text-xs font-black uppercase hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProvisioning}
                    className="px-6 py-2.5 bg-[#FFE600] hover:bg-[#ffe100] border-3 border-gray-900 shadow-[3px_3px_0px_0px_#000] active:shadow-none font-black text-xs uppercase tracking-wider text-black flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProvisioning ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Provisioning...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" /> Provision Account
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
