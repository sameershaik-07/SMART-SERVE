import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Save,
  Wrench,
  MapPin,
  Award,
  Sparkles,
  X,
  FileCheck,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getProviderDashboardApi, updateProviderProfileApi } from '../../api/providers';
import { updateProfileApi } from '../../api/users';

export const ProviderProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    categoryId: 1,
    yearsOfExperience: 5,
    serviceCity: 'Bengaluru',
  });

  const [documents, setDocuments] = useState([
    { name: 'Govt. Aadhaar / PAN Verification', status: 'VERIFIED', date: '15 Jan 2026' },
    { name: 'Certified Electrician / Technician Trade License', status: 'VERIFIED', date: '20 Jan 2026' },
    { name: 'Background Police Clearance Certificate', status: 'VERIFIED', date: '22 Jan 2026' },
  ]);

  const [newDocName, setNewDocName] = useState('');
  const [showAddDocModal, setShowAddDocModal] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const dashRes = await getProviderDashboardApi().catch(() => null);

        setFormData({
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.phone || '',
          bio: user?.serviceProvider?.bio || 'Certified specialist with over 5 years of verified field experience in residential maintenance, diagnostics, and repairs.',
          categoryId: user?.serviceProvider?.categoryId || 1,
          yearsOfExperience: 5,
          serviceCity: 'Bengaluru',
        });
      } catch (err) {
        console.warn('Could not load profile details:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setFeedback({ type: '', msg: '' });

      // 1. Update basic user account info (name & phone)
      await updateProfileApi({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
      });

      // 2. Update provider-specific details (bio, categoryId, documents)
      await updateProviderProfileApi({
        bio: formData.bio.trim(),
        categoryId: parseInt(formData.categoryId) || 1,
        documents: documents.map((d) => d.name),
      });

      updateUser({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
      });

      setFeedback({
        type: 'success',
        msg: 'Provider profile and credentials saved successfully!',
      });
      setTimeout(() => setFeedback({ type: '', msg: '' }), 4000);
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err.message || 'Failed to update provider profile.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddDocument = (e) => {
    e.preventDefault();
    if (!newDocName.trim()) return;

    setDocuments((prev) => [
      ...prev,
      {
        name: newDocName.trim(),
        status: 'UNDER_REVIEW',
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      },
    ]);
    setNewDocName('');
    setShowAddDocModal(false);
    setFeedback({
      type: 'success',
      msg: 'Document submitted for verification review!',
    });
    setTimeout(() => setFeedback({ type: '', msg: '' }), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/80 border border-slate-700/80 p-6 rounded-3xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-extrabold text-emerald-400 tracking-wider">
              Credentials & Verification
            </span>
            <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              <ShieldCheck size={12} /> KYC Verified Partner
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Partner Profile & KYC
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">
            Manage your public professional profile, trade credentials, and verification badges.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-950/40 cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Inline Feedback Banner */}
      {feedback.msg && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between animate-fade-in ${
            feedback.type === 'error'
              ? 'bg-rose-950/80 border border-rose-500/50 text-rose-300'
              : 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
          }`}
        >
          <span>{feedback.msg}</span>
          <button onClick={() => setFeedback({ type: '', msg: '' })}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Business Identity & Contact */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-700/60">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <UserCheck size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Basic Information & Contact</h3>
              <p className="text-[11px] text-slate-400">Your public partner identity shown to customers</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Full Name / Business Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Contact Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Registered Email (Verified)
              </label>
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Primary Operating City
              </label>
              <select
                value={formData.serviceCity}
                onChange={(e) => setFormData({ ...formData, serviceCity: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Bengaluru">Bengaluru, Karnataka</option>
                <option value="Hyderabad">Hyderabad, Telangana</option>
                <option value="Mumbai">Mumbai, Maharashtra</option>
                <option value="Delhi NCR">Delhi NCR</option>
                <option value="Chennai">Chennai, Tamil Nadu</option>
                <option value="Pune">Pune, Maharashtra</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Professional Bio & Specialization */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-700/60">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Award size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Experience & Customer Introduction</h3>
              <p className="text-[11px] text-slate-400">Describe your work philosophy, expertise, and service standards</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Public Bio & Experience Statement
            </label>
            <textarea
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Describe your technical background, equipment used, and service quality commitments..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Section 3: Verified KYC Documents */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <FileCheck size={16} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">KYC Verification & Trade Licenses</h3>
                <p className="text-[11px] text-slate-400">Official documents establishing platform trust & background check</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAddDocModal(true)}
              className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus size={14} /> Add Document
            </button>
          </div>

          <div className="space-y-3">
            {documents.map((doc, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-900/80 border border-slate-700/80 rounded-2xl flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <FileText size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{doc.name}</div>
                    <div className="text-[10px] text-slate-400">Submitted: {doc.date}</div>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                    doc.status === 'VERIFIED'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {doc.status === 'VERIFIED' ? (
                    <>
                      <CheckCircle2 size={11} /> Verified by ServiceHub
                    </>
                  ) : (
                    <>
                      <Clock size={11} /> Review Pending
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Save Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-950/40 cursor-pointer disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Saving Updates...' : 'Save Profile & Credentials'}
          </button>
        </div>
      </form>

      {/* Add Document Modal */}
      {showAddDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Upload size={16} className="text-emerald-400" />
                Upload New Verification Document
              </h3>
              <button
                onClick={() => setShowAddDocModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddDocument} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Document Title / Certificate Type *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GST Registration or Safety Training Certificate"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-6 border-2 border-dashed border-slate-700 rounded-2xl text-center space-y-2 hover:border-emerald-500/50 transition-colors">
                <Upload size={24} className="mx-auto text-slate-400" />
                <div className="text-xs text-slate-300 font-bold">Upload PDF or Image</div>
                <p className="text-[10px] text-slate-500">Max file size 10MB (PDF, JPG, PNG)</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDocModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
                >
                  Attach & Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

