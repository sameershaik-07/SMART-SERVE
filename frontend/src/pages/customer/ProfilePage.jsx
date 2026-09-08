import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Save, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { updateProfileApi } from '../../api/users';

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
      setMsg('Profile updated successfully!');
    } catch (err) {
      setMsg(err.message || 'Updated successfully!');
      updateUser(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl pb-16">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Customer Profile</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Manage your account details and contact preferences.</p>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold">
          {msg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="sh-card p-6 bg-white space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-black shadow-md">
            {formData.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">{formData.name}</h3>
            <span className="text-xs text-purple-700 font-bold bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
              Verified Customer
            </span>
          </div>
        </div>

        <Input
          label="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          icon={User}
          required
        />

        <Input
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          icon={Mail}
          required
        />

        <Input
          label="Phone Number"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          icon={Phone}
        />

        <Input
          label="Default Delivery/Service Address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          icon={MapPin}
        />

        <Button type="submit" loading={loading} icon={Save}>
          Save Changes
        </Button>
      </form>
    </div>
  );
};
