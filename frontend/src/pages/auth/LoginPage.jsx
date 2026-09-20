import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Shield, Mail, Lock, ArrowRight, ArrowLeft, AlertCircle, Wrench } from 'lucide-react';
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

  // Detect if arriving from the "Provider Sign In" button
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
    <div className="w-full max-w-md mx-auto space-y-6 animate-fade-in">
      <Link to="/" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={16} className="mr-1.5" /> Back to Home
      </Link>
      
      {/* Brand Logo Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary text-primary-foreground shadow-sm">
          {isProvider ? <Wrench size={22} /> : <Shield size={24} className="fill-current stroke-primary" />}
        </div>
        <span className="text-2xl font-extrabold text-foreground tracking-tight">ServiceHub</span>
      </div>

      {/* Provider context badge */}
      {isProvider && (
        <div className="inline-flex items-center gap-2 bg-muted text-foreground border border-border px-3 py-1 rounded-full text-[11px] font-bold">
          <Wrench size={12} /> Provider Portal
        </div>
      )}

      {/* Heading */}
      <div>
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
          {isProvider ? 'Provider Sign In' : 'Welcome back'}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isProvider
            ? 'Sign in to your provider account to manage bookings and services.'
            : 'Sign in with your verified account credentials.'}
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-shake">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          icon={Mail}
          required
        />

        <div>
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your account password"
            icon={Lock}
            required
          />
          <div className="flex justify-end mt-1.5">
            <Link
              to="/forgot-password"
              className="text-xs font-bold text-foreground hover:text-muted-foreground transition-colors"
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
          className="rounded-xl shadow-sm"
        >
          {isProvider ? 'Sign In as Provider' : 'Sign In'}
        </Button>
      </form>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground font-medium pt-4 border-t border-border">
        {isProvider ? (
          <>
            Not a provider yet?{' '}
            <Link to="/register?role=provider" className="font-bold text-foreground hover:text-muted-foreground transition-colors">
              Register as Provider
            </Link>
            {' · '}
            <Link to="/" className="font-bold text-muted-foreground hover:text-foreground transition-colors">
              Back to Home
            </Link>
          </>
        ) : (
          <>
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-foreground hover:text-muted-foreground transition-colors">
              Create an account
            </Link>
          </>
        )}
      </p>
    </div>
  );
};
