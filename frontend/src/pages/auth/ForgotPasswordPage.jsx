import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
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

  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
          <Shield size={24} className="fill-white stroke-purple-600" />
        </div>
        <span className="text-2xl font-black text-slate-900 tracking-tight">ServiceHub</span>
      </div>

      {submitted ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-16 h-16 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Check Your Email</h2>
          <p className="text-sm text-slate-600 max-w-sm mx-auto">
            We have sent password reset instructions to <strong>{email}</strong>.
          </p>
          <Link to="/login" className="inline-block mt-4 text-sm font-bold text-purple-600 hover:text-purple-800">
            ← Back to Login
          </Link>
        </div>
      ) : (
        <>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Forgot Password?</h2>
            <p className="text-sm text-slate-500 mt-1">Enter your registered email address to receive reset instructions.</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              icon={Mail}
              required
            />

            <Button type="submit" fullWidth loading={loading} size="lg">
              Send Reset Link
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500 font-medium">
            <Link to="/login" className="inline-flex items-center gap-1 font-bold text-purple-600 hover:text-purple-800">
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </p>
        </>
      )}
    </div>
  );
};
