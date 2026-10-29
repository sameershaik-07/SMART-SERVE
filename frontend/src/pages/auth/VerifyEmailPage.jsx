import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { MailCheck, CheckCircle2, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { verifyEmailApi } from '../../api/auth';

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyEmailApi({ email, otp });
      setVerified(true);
    } catch (err) {
      setError(err.message || 'Verification failed. Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <div className="w-full space-y-7">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-accent-teal/25 bg-accent-teal/10 text-accent-teal">
          <CheckCircle2 size={26} strokeWidth={1.6} />
        </div>
        <div>
          <p className="sh-eyebrow">Email confirmed</p>
          <h1 className="mt-2 font-display text-[2.6rem] leading-[1.02] tracking-[-0.035em] text-ink">
            You’re verified.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            That’s the last step. Sign in and your account is ready to use.
          </p>
        </div>
        <Button onClick={() => navigate('/login')} fullWidth size="lg">
          Proceed to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <p className="sh-eyebrow">One last step</p>
        <h1 className="mt-2 font-display text-[2.6rem] leading-[1.02] tracking-[-0.035em] text-ink">
          Verify your email.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Enter the 6-digit code we sent to your email address.
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
          icon={MailCheck}
          autoComplete="email"
          required
        />
        <Input
          label="Verification code"
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          placeholder="123456"
          icon={KeyRound}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          className="[&_input]:font-mono [&_input]:tracking-[0.28em]"
          required
        />
        <Button type="submit" fullWidth loading={loading} size="lg">
          Verify email
        </Button>
      </form>

      <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <MailCheck size={13} className="text-primary" />
        Can’t find it? Check your spam folder.
      </p>

      <p className="border-t border-hairline pt-5 text-center text-xs text-muted-foreground">
        <Link to="/login" className="inline-flex items-center gap-1.5 font-medium text-ink hover:text-primary">
          <ArrowLeft size={13} /> Back to sign in
        </Link>
      </p>
    </div>
  );
};
