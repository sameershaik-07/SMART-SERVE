import React, { useState } from 'react';
import { Lock, Bell, Shield, KeyRound } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { changePasswordApi } from '../../api/users';

export const SettingsPage = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      await changePasswordApi({ oldPassword, newPassword });
      setMsg('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setMsg(err.message || 'Password update failed. Please verify old password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl pb-16">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Manage security, password, and notification preferences.</p>
      </div>

      {msg && (
        <div className="p-3 bg-purple-50 border border-purple-200 text-purple-700 rounded-xl text-xs font-semibold">
          {msg}
        </div>
      )}

      {/* Change Password Card */}
      <form onSubmit={handlePasswordChange} className="sh-card p-6 bg-white space-y-4">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <KeyRound size={18} className="text-purple-600" /> Change Password
        </h3>

        <Input
          label="Current Password"
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          placeholder="Enter current password"
          icon={Lock}
          required
        />

        <Input
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter new password"
          icon={Lock}
          required
        />

        <Button type="submit" loading={loading}>
          Update Password
        </Button>
      </form>

      {/* Notification Preferences */}
      <div className="sh-card p-6 bg-white space-y-4">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Bell size={18} className="text-purple-600" /> Notification Preferences
        </h3>

        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs font-semibold text-slate-700">Email Notifications for Booking Updates</span>
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-purple-600" />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs font-semibold text-slate-700">SMS / WhatsApp Reminders</span>
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-purple-600" />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs font-semibold text-slate-700">Promotions and Festive Offers</span>
            <input type="checkbox" className="w-4 h-4 accent-purple-600" />
          </label>
        </div>
      </div>
    </div>
  );
};
