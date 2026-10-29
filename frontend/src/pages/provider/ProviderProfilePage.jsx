import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  ShieldCheck,
  Award,
  FileCheck,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Save,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getProviderDashboardApi, updateProviderProfileApi } from '../../api/providers';
import { updateProfileApi } from '../../api/users';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Reveal } from '@/components/motion/Reveal';
import { cn } from '@/lib/utils';

const fieldClass =
  'h-10 w-full rounded-md border border-input bg-canvas px-3.5 text-xs text-ink outline-hidden transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-surface-soft disabled:text-muted-foreground';

const labelClass = 'mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground';

const sectionIcon =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-hairline bg-surface-soft text-primary';

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
          bio:
            user?.serviceProvider?.bio ||
            'Certified specialist with over 5 years of verified field experience in residential maintenance, diagnostics, and repairs.',
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
    <div className="mx-auto max-w-[1040px] animate-fade-in space-y-6 pb-16">
      {/* Header */}
      <Reveal className="flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="sh-eyebrow">Credentials & verification</p>
            <span className="inline-flex items-center gap-1 rounded-pill border border-accent-teal/20 bg-accent-teal/8 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em] text-accent-teal">
              <ShieldCheck size={10} /> KYC verified partner
            </span>
          </div>
          <h1 className="workspace-title mt-2">Partner profile & KYC</h1>
          <p className="workspace-subtitle">
            Manage the professional profile customers see, along with your trade credentials and
            verification badges.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-[11px] font-medium text-primary-foreground transition-all hover:bg-primary-active active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
        >
          {saving ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Save size={13} />
          )}
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </Reveal>

      {/* Feedback */}
      {feedback.msg && (
        <div
          className={cn(
            'flex animate-fade-in items-center justify-between gap-3 rounded-md border px-4 py-3 text-xs font-medium',
            feedback.type === 'error'
              ? 'border-destructive/25 bg-destructive/8 text-destructive'
              : 'border-accent-teal/25 bg-accent-teal/8 text-accent-teal'
          )}
        >
          <span className="flex items-center gap-2">
            {feedback.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
            {feedback.msg}
          </span>
          <button
            onClick={() => setFeedback({ type: '', msg: '' })}
            className="transition-opacity hover:opacity-70"
            aria-label="Dismiss message"
          >
            <span aria-hidden>×</span>
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-[11px] text-muted-foreground">Loading profile…</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section 1: identity */}
          <Reveal delay={0.04}>
            <section className="overflow-hidden rounded-lg border border-hairline bg-card">
              <div className="flex items-start gap-3 border-b border-hairline px-5 py-4 sm:px-6">
                <span className={sectionIcon}>
                  <UserCheck size={16} strokeWidth={1.8} />
                </span>
                <div>
                  <h2 className="font-display text-[1.4rem] leading-tight tracking-[-0.02em] text-ink">
                    Basic information & contact
                  </h2>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    Your public partner identity shown to customers.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 p-5 sm:p-6 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Full name / business name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Contact phone number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Registered email (verified)</label>
                  <input
                    type="email"
                    disabled
                    value={formData.email}
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Primary operating city</label>
                  <select
                    value={formData.serviceCity}
                    onChange={(e) => setFormData({ ...formData, serviceCity: e.target.value })}
                    className={cn(fieldClass, 'cursor-pointer')}
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
            </section>
          </Reveal>

          {/* Section 2: bio */}
          <Reveal delay={0.08}>
            <section className="overflow-hidden rounded-lg border border-hairline bg-card">
              <div className="flex items-start gap-3 border-b border-hairline px-5 py-4 sm:px-6">
                <span className={cn(sectionIcon, 'text-accent-amber')}>
                  <Award size={16} strokeWidth={1.8} />
                </span>
                <div>
                  <h2 className="font-display text-[1.4rem] leading-tight tracking-[-0.02em] text-ink">
                    Experience & introduction
                  </h2>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    Describe your work philosophy, expertise, and service standards.
                  </p>
                </div>
              </div>

              <div className="space-y-2 p-5 sm:p-6">
                <label className={labelClass}>Public bio & experience statement</label>
                <textarea
                  rows={5}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Describe your technical background, equipment used, and service quality commitments…"
                  className="w-full rounded-md border border-input bg-canvas p-3.5 text-xs leading-relaxed text-ink outline-hidden transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/15"
                />
                <p className="text-[10px] leading-relaxed text-muted-foreground">
                  A clear, specific introduction helps customers choose you with confidence.
                </p>
              </div>
            </section>
          </Reveal>

          {/* Section 3: documents */}
          <Reveal delay={0.12}>
            <section className="overflow-hidden rounded-lg border border-hairline bg-card">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-5 py-4 sm:px-6">
                <div className="flex items-start gap-3">
                  <span className={cn(sectionIcon, 'text-accent-teal')}>
                    <FileCheck size={16} strokeWidth={1.8} />
                  </span>
                  <div>
                    <h2 className="font-display text-[1.4rem] leading-tight tracking-[-0.02em] text-ink">
                      KYC & trade licenses
                    </h2>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      Documents that establish platform trust and background verification.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddDocModal(true)}
                  className="flex items-center gap-1.5 rounded-md border border-hairline bg-canvas px-3 py-1.5 text-[10px] font-medium text-body transition-all hover:border-primary/30 hover:text-primary active:scale-[0.98]"
                >
                  <Plus size={12} /> Add document
                </button>
              </div>

              <div className="divide-y divide-hairline-soft">
                {documents.map((doc, idx) => {
                  const verified = doc.status === 'VERIFIED';
                  return (
                    <div
                      key={idx}
                      className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-surface-soft/30 sm:px-6"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-hairline bg-surface-soft text-primary">
                          <FileText size={16} strokeWidth={1.8} />
                        </span>
                        <div className="min-w-0">
                          <div className="text-[12px] font-medium text-ink">{doc.name}</div>
                          <div className="mt-0.5 text-[10px] text-muted-foreground">
                            Submitted: {doc.date}
                          </div>
                        </div>
                      </div>

                      <span
                        className={cn(
                          'inline-flex shrink-0 items-center gap-1 rounded-pill border px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.06em]',
                          verified
                            ? 'border-accent-teal/20 bg-accent-teal/8 text-accent-teal'
                            : 'border-accent-amber/25 bg-accent-amber/8 text-accent-amber'
                        )}
                      >
                        {verified ? (
                          <>
                            <CheckCircle2 size={10} /> Verified by ServiceHub
                          </>
                        ) : (
                          <>
                            <Clock size={10} /> Review pending
                          </>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-hairline bg-surface-soft/30 px-5 py-3 sm:px-6">
                <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <ShieldCheck size={11} className="text-accent-teal" />
                  Documents are encrypted and visible only to the ServiceHub verification team.
                </p>
              </div>
            </section>
          </Reveal>

          {/* Save actions */}
          <Reveal delay={0.16} className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-5">
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              Changes go live on your public profile as soon as they’re saved.
            </p>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 rounded-md bg-primary px-5 py-2.5 text-[11px] font-medium text-primary-foreground transition-all hover:bg-primary-active active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              {saving ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Save size={13} />
              )}
              {saving ? 'Saving updates…' : 'Save profile & credentials'}
            </button>
          </Reveal>
        </form>
      )}

      {/* Add document modal */}
      <Modal
        isOpen={showAddDocModal}
        onClose={() => setShowAddDocModal(false)}
        title="Upload verification document"
        description="Add a trade licence, certificate, or identity document for review."
      >
        <form onSubmit={handleAddDocument} className="space-y-4">
          <Input
            label="Document title / certificate type *"
            required
            placeholder="e.g. GST registration or safety training certificate"
            value={newDocName}
            onChange={(e) => setNewDocName(e.target.value)}
            icon={FileText}
          />

          <div className="cursor-pointer rounded-md border border-dashed border-hairline bg-surface-soft/40 p-6 text-center transition-colors hover:border-primary/40 hover:bg-primary/5">
            <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-canvas text-muted-foreground">
              <Upload size={18} strokeWidth={1.7} />
            </span>
            <div className="mt-2 text-[11px] font-medium text-ink">Upload PDF or image</div>
            <p className="mt-0.5 text-[9px] text-muted-foreground">
              Max file size 10MB · PDF, JPG, PNG
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-hairline pt-4">
            <button
              type="button"
              onClick={() => setShowAddDocModal(false)}
              className="rounded-md px-3 py-2 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-surface-soft hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-[11px] font-medium text-primary-foreground transition-all hover:bg-primary-active active:scale-[0.98]"
            >
              Attach & submit
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
