import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { forgotPasswordApi } from '../../api/auth';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await forgotPasswordApi(email);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full space-y-7">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-accent-teal/25 bg-accent-teal/10 text-accent-teal">
          <CheckCircle2 size={26} strokeWidth={1.6} />
        </div>
        <div>
          <p className="sh-eyebrow">Reset link sent</p>
          <h1 className="mt-2 font-display text-[2.6rem] leading-[1.02] tracking-[-0.035em] text-ink">
            Check your inbox.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            We’ve sent password reset instructions to{' '}
            <strong className="font-medium text-ink">{email}</strong>. The link is valid for a
            short while, so use it soon.
          </p>
        </div>
        <div className="rounded-md border border-hairline bg-surface-soft/60 p-4 text-xs leading-relaxed text-muted-foreground">
          Didn’t get it? Check spam, or try again with a different address.
        </div>
        <Button onClick={() => setSubmitted(false)} variant="outline" className="w-full">
          Try another email
        </Button>
        <p className="border-t border-hairline pt-5 text-center text-xs text-muted-foreground">
          <Link to="/login" className="inline-flex items-center gap-1.5 font-medium text-ink hover:text-primary">
            <ArrowLeft size={13} /> Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <p className="sh-eyebrow">Account recovery</p>
        <h1 className="mt-2 font-display text-[2.6rem] leading-[1.02] tracking-[-0.035em] text-ink">
          Find your way back.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Enter the email address on your account and we’ll send you a secure reset link.
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
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          icon={Mail}
          autoComplete="email"
          required
        />
        <Button type="submit" fullWidth loading={loading} size="lg">
          Send reset link
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
