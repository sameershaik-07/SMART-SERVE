import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const AdminLoginPage = () => {
  const { user, loading, login, clearSession } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
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
    <div className="w-full space-y-7">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-ink"
      >
        <ArrowLeft size={13} /> Back to home
      </Link>

      <div className="inline-flex items-center gap-2 rounded-pill border border-primary/20 bg-primary/6 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-primary">
        <ShieldCheck size={11} /> Admin portal
      </div>

      <div>
        <p className="sh-eyebrow">Restricted access</p>
        <h1 className="mt-2 font-display text-[2.6rem] leading-[1.02] tracking-[-0.035em] text-ink">
          Administrator sign in.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Use your SmartServ administrator credentials to open the operations console.
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

      <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <ShieldCheck size={13} className="text-accent-teal" />
        Authorized personnel only · Admin sessions are monitored
      </p>

      <div className="border-t border-hairline pt-5 text-center text-xs text-muted-foreground">
        Not an administrator?{' '}
        <Link
          to="/login"
          className="font-medium text-ink underline-offset-4 hover:text-primary hover:underline"
        >
          Go to the main sign-in
        </Link>
      </div>
    </div>
  );
};
