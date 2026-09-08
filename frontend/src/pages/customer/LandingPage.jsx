import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, LogIn, UserPlus, CheckCircle2, Star, Sparkles, User, Wrench } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar: Brand + Login / Signup Only */}
      <header className="h-20 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <Shield size={24} className="fill-white stroke-purple-600" />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">ServiceHub</span>
        </div>

        {/* Options for Login or Sign Up ONLY */}
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => navigate('/login')} 
            variant="ghost" 
            size="md"
            icon={LogIn}
          >
            Sign In
          </Button>
          <Button 
            onClick={() => navigate('/register')} 
            variant="primary" 
            size="md"
            icon={UserPlus}
          >
            Sign Up
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-8 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 border border-purple-200 px-4 py-1.5 rounded-full text-xs font-bold shadow-2xs">
          <Sparkles size={14} /> Premier On-Demand Home & Professional Services
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
          Expert Local Services.<br />
          <span className="text-purple-700">Booked with Confidence.</span>
        </h1>

        <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto font-medium">
          Sign in or create an account to access 10,000+ certified specialists for home maintenance, electrical repairs, deep cleaning, and appliance services.
        </p>

        {/* Hero CTA: Login & Sign Up Options ONLY */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
          <Button 
            onClick={() => navigate('/login')} 
            size="lg" 
            icon={LogIn} 
            className="rounded-2xl px-8 shadow-lg shadow-purple-600/25 text-sm"
          >
            Sign In to Continue
          </Button>
          <Button 
            onClick={() => navigate('/register')} 
            variant="outline" 
            size="lg" 
            icon={UserPlus} 
            className="rounded-2xl px-8 text-sm"
          >
            Create New Account
          </Button>
        </div>
      </section>

      {/* Account Type Selection Section */}
      <section className="py-12 px-8 max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Portal Option */}
        <div className="sh-card p-8 bg-white border border-slate-200/90 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <User size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Looking for Services?</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Book certified specialists, track technicians via live GPS map, and pay securely.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => navigate('/login')}
              className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all text-center shadow-sm shadow-purple-600/20"
            >
              Customer Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="flex-1 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold transition-all text-center border border-purple-200"
            >
              Sign Up Free
            </button>
          </div>
        </div>

        {/* Provider Portal Option */}
        <div className="sh-card p-8 bg-white border border-slate-200/90 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Wrench size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Are You a Service Provider?</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Join our verified professional network, accept service orders, and scale your business.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => navigate('/login?role=provider')}
              className="flex-1 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all text-center shadow-sm"
            >
              Provider Sign In
            </button>
            <button
              onClick={() => navigate('/register?role=provider')}
              className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all text-center border border-slate-200"
            >
              Provider Sign Up
            </button>
          </div>
        </div>
      </section>

      {/* Highlights Grid */}
      <section className="py-12 px-8 max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="sh-card p-6 bg-white space-y-3 rounded-2xl border border-slate-100">
          <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center">
            <Shield size={20} />
          </div>
          <h4 className="text-sm font-bold text-slate-900">100% Verified Professionals</h4>
          <p className="text-xs text-slate-500 leading-relaxed">Every professional undergoes identity authentication and background checks.</p>
        </div>

        <div className="sh-card p-6 bg-white space-y-3 rounded-2xl border border-slate-100">
          <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
          <h4 className="text-sm font-bold text-slate-900">Transparent Standard Rates</h4>
          <p className="text-xs text-slate-500 leading-relaxed">Standard standardized pricing with upfront quotes and zero hidden charges.</p>
        </div>

        <div className="sh-card p-6 bg-white space-y-3 rounded-2xl border border-slate-100">
          <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center">
            <Star size={20} />
          </div>
          <h4 className="text-sm font-bold text-slate-900">Service Guarantee</h4>
          <p className="text-xs text-slate-500 leading-relaxed">Complete satisfaction assurance and re-work guarantee for every service.</p>
        </div>
      </section>
    </div>
  );
};
