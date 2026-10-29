import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Phone, ArrowRight, AlertCircle, CheckCircle2, Wrench, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { cn } from '@/lib/utils';

const roles = [
  { value: 'CUSTOMER', label: 'I need help', icon: Home },
  { value: 'PROVIDER', label: 'I offer services', icon: Wrench },
];

export const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'provider' ? 'PROVIDER' : 'CUSTOMER';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: initialRole,
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
      });
      setSuccessMsg('Account created successfully. Taking you to sign in…');
      setTimeout(() => {
        navigate('/login');
      }, 1400);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const isProvider = formData.role === 'PROVIDER';

  return (
    <div className="w-full space-y-6">
      <div>
        <p className="sh-eyebrow">Create an account</p>
        <h1 className="mt-2 font-display text-[2.6rem] leading-[1.02] tracking-[-0.035em] text-ink">
          {isProvider ? 'Do work you’re proud of.' : 'Make home feel lighter.'}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {isProvider
            ? 'Join a verified network of professionals and receive work that fits your craft.'
            : 'Book verified local professionals and keep every visit in one calm place.'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-md border border-hairline bg-surface-soft p-1">
        {roles.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setFormData({ ...formData, role: value })}
            className={cn(
              'flex items-center justify-center gap-2 rounded-sm px-3 py-2 text-xs font-medium transition-all',
              formData.role === value
                ? 'bg-canvas text-ink shadow-xs'
                : 'text-muted-foreground hover:text-ink'
            )}
          >
            <Icon size={14} strokeWidth={1.8} />
            {label}
          </button>
        ))}
      </div>

      {successMsg && (
        <div className="flex items-start gap-2.5 rounded-md border border-accent-teal/25 bg-accent-teal/8 p-3.5 text-xs leading-relaxed text-accent-teal">
          <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2.5 rounded-md border border-destructive/20 bg-destructive/6 p-3.5 text-xs leading-relaxed text-destructive">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          label="Full name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Rahul Sharma"
          icon={User}
          autoComplete="name"
          required
        />

        <Input
          label="Email address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          icon={Mail}
          autoComplete="email"
          required
        />

        <Input
          label="Phone number"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+91 98765 43210"
          icon={Phone}
          autoComplete="tel"
        />

        <div className="grid gap-3.5 sm:grid-cols-2">
          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
            icon={Lock}
            autoComplete="new-password"
            required
          />
          <Input
            label="Confirm password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat password"
            icon={Lock}
            autoComplete="new-password"
            required
          />
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
          {isProvider ? 'Join as a professional' : 'Create my account'}
        </Button>
      </form>

      <p className="border-t border-hairline pt-5 text-center text-xs text-muted-foreground">
        Already have an account?{' '}
        <Link
          to={isProvider ? '/login?role=provider' : '/login'}
          className="font-medium text-ink underline-offset-4 hover:text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};
