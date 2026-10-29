import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ArrowLeft, AlertCircle, Wrench, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isProvider = searchParams.get('role') === 'provider';

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const targetEmail = email.trim();
    const targetPass = password;

    if (!targetEmail || !targetPass) {
      setError('Please enter both email address and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login({ email: targetEmail, password: targetPass });
      const role = res.user?.role || 'CUSTOMER';

      if (role === 'ADMIN') {
        navigate('/admin');
      } else if (role === 'PROVIDER') {
        navigate('/provider/dashboard');
      } else {
        navigate('/services');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
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

      {isProvider && (
        <div className="inline-flex items-center gap-2 rounded-pill border border-primary/20 bg-primary/6 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-primary">
          <Wrench size={11} /> Provider portal
        </div>
      )}

      <div>
        <p className="sh-eyebrow">{isProvider ? 'Partner access' : 'Welcome back'}</p>
        <h1 className="mt-2 font-display text-[2.6rem] leading-[1.02] tracking-[-0.035em] text-ink">
          {isProvider ? 'Your work, in order.' : 'Good to see you again.'}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {isProvider
            ? 'Sign in to manage availability, job requests, and earnings.'
            : 'Sign in to book services, track visits, and manage your home.'}
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-md border border-destructive/20 bg-destructive/6 p-3.5 text-xs leading-relaxed text-destructive">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
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
          loading={loading}
          icon={ArrowRight}
          iconPosition="right"
          size="lg"
          className="mt-2"
        >
          {isProvider ? 'Sign in as provider' : 'Sign in'}
        </Button>
      </form>

      <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <ShieldCheck size={13} className="text-accent-teal" />
        Secure sign-in · Your details stay private
      </p>

      <div className="border-t border-hairline pt-5 text-center text-xs text-muted-foreground">
        {isProvider ? (
          <>
            Not a provider yet?{' '}
            <Link to="/register?role=provider" className="font-medium text-ink underline-offset-4 hover:text-primary hover:underline">
              Join the network
            </Link>
          </>
        ) : (
          <>
            New to ServiceHub?{' '}
            <Link to="/register" className="font-medium text-ink underline-offset-4 hover:text-primary hover:underline">
              Create an account
            </Link>
          </>
        )}
      </div>
    </div>
  );
};
