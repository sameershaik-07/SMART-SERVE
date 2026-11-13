import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { BrandLockup } from '@/components/brand/BrandMark';

export const AdminLoginPage = () => {
  const { user, loading, login, clearSession } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-dark">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await login({ email: email.trim(), password });

      if (res.user?.role !== 'ADMIN') {
        clearSession();
        setError('This account does not have administrator access. Please use an admin account.');
        return;
      }

      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-dark px-5 py-10">
      <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-accent-teal/10 blur-[110px]" />
      <div className="sh-ruled-grid pointer-events-none absolute inset-0 opacity-[0.12]" />

      <div className="relative w-full max-w-[440px]">
        <div className="rounded-2xl border border-white/10 bg-canvas p-7 shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-9">
          <div className="flex items-center justify-between gap-3">
            <BrandLockup size={30} />
            <span className="inline-flex items-center gap-1.5 rounded-pill border border-primary/20 bg-primary/6 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-primary">
              <ShieldCheck size={11} /> Admin
            </span>
          </div>

          <div className="mt-7">
            <p className="sh-eyebrow">Restricted access</p>
            <h1 className="mt-2 font-display text-[2.4rem] leading-[1.02] tracking-[-0.035em] text-ink">
              Administrator sign in.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Use your SmartServ administrator credentials to open the operations console.
            </p>
          </div>

          {error && (
            <div className="mt-5 flex items-start gap-2.5 rounded-md border border-destructive/20 bg-destructive/6 p-3.5 text-xs leading-relaxed text-destructive">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <Input
              label="Admin email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@smartserve.com"
              icon={Mail}
              autoComplete="email"
              required
            />

            <div>
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                icon={Lock}
                autoComplete="current-password"
                required
              />
              <div className="mt-2.5 flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-medium text-body underline-offset-4 transition-colors hover:text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              loading={submitting}
              icon={ArrowRight}
              iconPosition="right"
              size="lg"
              className="mt-2"
            >
              Enter admin console
            </Button>
          </form>

          <div className="mt-5 flex items-center justify-between border-t border-hairline pt-4 text-[11px] text-muted-foreground">
            <Link to="/" className="inline-flex items-center gap-1.5 font-medium text-ink hover:text-primary">
              <ArrowLeft size={13} /> Back to SmartServ
            </Link>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-accent-teal" /> Protected portal
            </span>
          </div>
        </div>

        <p className="mt-5 text-center text-[10px] uppercase tracking-[0.16em] text-on-dark-soft">
          SmartServ operations · Authorized personnel only
        </p>
      </div>
    </div>
  );
};
