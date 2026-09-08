import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Shield, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

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
      setSuccessMsg('Account created successfully! Redirecting to sign in...');
      setTimeout(() => {
        navigate('/login');
      }, 1400);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
          <Shield size={24} className="fill-white stroke-purple-600" />
        </div>
        <span className="text-2xl font-black text-slate-900 tracking-tight">ServiceHub</span>
      </div>

      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create an Account</h2>
        <p className="text-sm text-slate-500 mt-1">Join ServiceHub to book or offer expert services.</p>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <span>✓</span>
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          label="Full Name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Rahul Sharma"
          icon={User}
          required
        />

        <Input
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          icon={Mail}
          required
        />

        <Input
          label="Phone Number"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+91 98765 43210"
          icon={Phone}
        />

        {/* Role Selector */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">I want to join as</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'CUSTOMER' })}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                formData.role === 'CUSTOMER'
                  ? 'bg-purple-50 border-purple-600 text-purple-700 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'PROVIDER' })}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                formData.role === 'PROVIDER'
                  ? 'bg-purple-50 border-purple-600 text-purple-700 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Service Provider
            </button>
          </div>
        </div>

        <Input
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Create a password"
          icon={Lock}
          required
        />

        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm password"
          icon={Lock}
          required
        />

        <Button
          type="submit"
          fullWidth
          loading={loading}
          icon={ArrowRight}
          iconPosition="right"
          size="lg"
        >
          Create Account
        </Button>
      </form>

      <p className="text-center text-xs text-slate-500 font-medium pt-2">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-purple-600 hover:text-purple-800 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
};
