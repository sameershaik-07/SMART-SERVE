import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Shield, MailCheck, CheckCircle } from 'lucide-react';
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

  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
          <Shield size={24} className="fill-white stroke-purple-600" />
        </div>
        <span className="text-2xl font-black text-slate-900 tracking-tight">ServiceHub</span>
      </div>

      {verified ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Email Verified!</h2>
          <p className="text-sm text-slate-600">Your email has been verified. You can now login.</p>
          <Button onClick={() => navigate('/login')} fullWidth size="lg">
            Proceed to Login
          </Button>
        </div>
      ) : (
        <>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Verify Your Email</h2>
            <p className="text-sm text-slate-500 mt-1">Enter the 6-digit OTP code sent to your email address.</p>
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
              icon={MailCheck}
              required
            />

            <Input
              label="OTP Code"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              maxLength={6}
              required
            />

            <Button type="submit" fullWidth loading={loading} size="lg">
              Verify Email
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500 font-medium">
            <Link to="/login" className="font-bold text-purple-600 hover:text-purple-800">
              ← Back to Login
            </Link>
          </p>
        </>
      )}
    </div>
  );
};
