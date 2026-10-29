import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
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

  if (success) {
    return (
      <div className="w-full space-y-7">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-accent-teal/25 bg-accent-teal/10 text-accent-teal">
          <CheckCircle2 size={26} strokeWidth={1.6} />
        </div>
        <div>
          <p className="sh-eyebrow">All set</p>
          <h1 className="mt-2 font-display text-[2.6rem] leading-[1.02] tracking-[-0.035em] text-ink">
            Password updated.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Your new password is active. Sign in to pick up where you left off.
          </p>
        </div>
        <Button onClick={() => navigate('/login')} fullWidth size="lg">
          Go to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <p className="sh-eyebrow">Set a new password</p>
        <h1 className="mt-2 font-display text-[2.6rem] leading-[1.02] tracking-[-0.035em] text-ink">
          A fresh start.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Choose a strong password you don’t use anywhere else.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-md border border-destructive/20 bg-destructive/6 p-3.5 text-xs leading-relaxed text-destructive">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="New password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="At least 8 characters"
          icon={Lock}
          autoComplete="new-password"
          required
        />
        <Input
          label="Confirm new password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat your new password"
          icon={Lock}
          autoComplete="new-password"
          required
        />
        <Button type="submit" fullWidth loading={loading} size="lg">
          Update password
        </Button>
      </form>

      <p className="border-t border-hairline pt-5 text-center text-xs text-muted-foreground">
        <Link to="/login" className="inline-flex items-center gap-1.5 font-medium text-ink hover:text-primary">
          <ArrowLeft size={13} /> Back to sign in
        </Link>
      </p>
    </div>
  );
};
