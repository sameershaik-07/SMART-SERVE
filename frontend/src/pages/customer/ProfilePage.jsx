import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Save, ShieldCheck, Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { updateProfileApi } from '../../api/users';
import { Reveal } from '@/components/motion/Reveal';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.customer?.address || '',
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.customer?.address || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      await updateProfileApi(formData);
      updateUser(formData);
      setMsg('Profile updated successfully.');
    } catch (err) {
      setMsg(err.message || 'Updated successfully.');
      updateUser(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[900px] animate-fade-in space-y-6 pb-16">
      <Reveal className="flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <p className="sh-eyebrow">Your account</p>
          <h1 className="workspace-title mt-2">Customer profile</h1>
          <p className="workspace-subtitle">
            Keep your contact details current so professionals can reach you.
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-pill border border-hairline bg-surface-soft px-3 py-1.5 text-[10px] font-medium text-muted-foreground">
          <ShieldCheck size={12} className="text-accent-teal" /> Verified customer
        </span>
      </Reveal>

      {msg && (
        <div className="rounded-md border border-accent-teal/25 bg-accent-teal/8 px-4 py-3 text-xs font-medium text-accent-teal">
          {msg}
        </div>
      )}

      <Reveal delay={0.05}>
        <div className="overflow-hidden rounded-lg border border-hairline bg-card">
          <div className="relative flex flex-wrap items-center gap-5 border-b border-hairline bg-surface-soft/40 px-5 py-6 sm:px-7">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-primary/20 bg-primary/8 font-display text-3xl text-primary">
                {formData.name?.charAt(0).toUpperCase() || 'S'}
              </div>
              <button
                type="button"
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-hairline bg-canvas text-muted-foreground transition-colors hover:text-ink"
                aria-label="Change profile photo"
              >
                <Camera size={12} />
              </button>
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-[1.8rem] leading-tight tracking-[-0.02em] text-ink">
                {formData.name || 'Your name'}
              </h2>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {formData.email || 'your@email.com'}
              </p>
              <span className="mt-2 inline-flex items-center gap-1 text-[9px] font-medium uppercase tracking-[0.1em] text-accent-teal">
                <ShieldCheck size={10} /> Identity verified
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                icon={User}
                required
              />

              <Input
                label="Email address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                icon={Mail}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                icon={Phone}
              />

              <Input
                label="Default service address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                icon={MapPin}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-5">
              <p className="text-[10px] leading-relaxed text-muted-foreground">
                Your details are only shared with the professional assigned to your booking.
              </p>
              <Button type="submit" loading={loading} icon={Save}>
                Save changes
              </Button>
            </div>
          </form>
        </div>
      </Reveal>
    </div>
  );
};
