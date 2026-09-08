import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Shield, Lock, CheckCircle } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { resetPasswordApi } from '../../api/auth';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordApi({ token, newPassword });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Password reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
          <Shield size={24} className="fill-white stroke-purple-600" />
        </div>
        <span className="text-2xl font-black text-slate-900 tracking-tight">ServiceHub</span>
      </div>

      {success ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Password Reset Successful!</h2>
          <p className="text-sm text-slate-600">Your password has been updated. You can now login.</p>
          <Button onClick={() => navigate('/login')} fullWidth size="lg">
            Go to Login
          </Button>
        </div>
      ) : (
        <>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Reset Password</h2>
            <p className="text-sm text-slate-500 mt-1">Set a new strong password for your ServiceHub account.</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              icon={Lock}
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              icon={Lock}
              required
            />

            <Button type="submit" fullWidth loading={loading} size="lg">
              Reset Password
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500 font-medium">
            <Link to="/login" className="font-bold text-purple-600 hover:text-purple-800">
              ← Back to Login
            </Link>
          </p>
        </>
      )}
    </div>
  );
};
