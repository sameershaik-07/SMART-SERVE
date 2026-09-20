import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, LogIn, UserPlus, CheckCircle2, Star, Sparkles, User, Wrench } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Top Navbar: Brand + Login / Signup Only */}
      <header className="h-[76px] bg-card/95 backdrop-blur border-b border-border px-5 md:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-sm">
            <Shield size={24} className="fill-current stroke-primary" />
          </div>
          <span className="text-xl font-extrabold text-foreground tracking-tight">ServiceHub</span>
        </div>

        {/* Options for Login or Sign Up ONLY */}
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => navigate('/login')} 
            variant="ghost" 
            size="default"
            icon={LogIn}
            className="h-10 px-4"
          >
            Sign In
          </Button>
          <Button 
            onClick={() => navigate('/register')} 
            variant="primary" 
            size="default"
            icon={UserPlus}
            className="h-10 min-w-[108px] px-4"
          >
            Sign Up
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-20 px-5 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 bg-muted text-foreground border border-border px-4 py-1.5 rounded-full text-xs font-bold">
          <Sparkles size={14} /> Premier On-Demand Home & Professional Services
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-foreground tracking-[-.055em] leading-[1.07] max-w-4xl mx-auto">
          Expert Local Services.<br />
          <span className="text-muted-foreground">Booked with Confidence.</span>
        </h1>

        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
          Sign in or create an account to access 10,000+ certified specialists for home maintenance, electrical repairs, deep cleaning, and appliance services.
        </p>

        {/* Hero CTA: Login & Sign Up Options ONLY */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
          <Button 
            onClick={() => navigate('/login')} 
            size="lg" 
            icon={LogIn} 
            className="rounded-xl px-8 shadow-sm text-sm"
          >
            Sign In to Continue
          </Button>
          <Button 
            onClick={() => navigate('/register')} 
            variant="outline" 
            size="lg" 
            icon={UserPlus} 
            className="rounded-xl px-8 text-sm"
          >
            Create New Account
          </Button>
        </div>
      </section>

      {/* Account Type Selection Section */}
      <section className="py-8 px-5 max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Customer Portal Option */}
        <div className="sh-card p-7 rounded-2xl space-y-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-muted text-foreground flex items-center justify-center">
            <User size={24} />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-foreground">Looking for Services?</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Book certified specialists, track technicians via live GPS map, and pay securely.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => navigate('/login')}
              className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-bold transition-all text-center shadow-sm"
            >
              Customer Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="flex-1 py-2.5 bg-muted hover:bg-accent text-foreground rounded-xl text-xs font-bold transition-all text-center border border-border"
            >
              Sign Up Free
            </button>
          </div>
        </div>

        {/* Provider Portal Option */}
        <div className="sh-card p-7 rounded-2xl space-y-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-muted text-foreground flex items-center justify-center">
            <Wrench size={24} />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-foreground">Are You a Service Provider?</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Join our verified professional network, accept service orders, and scale your business.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => navigate('/login?role=provider')}
            className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-bold transition-all text-center shadow-sm"
            >
              Provider Sign In
            </button>
            <button
              onClick={() => navigate('/register?role=provider')}
            className="flex-1 py-2.5 bg-muted hover:bg-accent text-foreground rounded-xl text-xs font-bold transition-all text-center border border-border"
            >
              Provider Sign Up
            </button>
          </div>
        </div>
      </section>

      {/* Highlights Grid */}
      <section className="py-10 px-5 max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="sh-card p-6 space-y-3 rounded-2xl">
          <div className="w-10 h-10 bg-muted text-foreground rounded-xl flex items-center justify-center">
            <Shield size={20} />
          </div>
          <h4 className="text-sm font-bold text-foreground">100% Verified Professionals</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">Every professional undergoes identity authentication and background checks.</p>
        </div>

        <div className="sh-card p-6 space-y-3 rounded-2xl">
          <div className="w-10 h-10 bg-muted text-foreground rounded-xl flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
          <h4 className="text-sm font-bold text-foreground">Transparent Standard Rates</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">Standard standardized pricing with upfront quotes and zero hidden charges.</p>
        </div>

        <div className="sh-card p-6 space-y-3 rounded-2xl">
          <div className="w-10 h-10 bg-muted text-foreground rounded-xl flex items-center justify-center">
            <Star size={20} />
          </div>
          <h4 className="text-sm font-bold text-foreground">Service Guarantee</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">Complete satisfaction assurance and re-work guarantee for every service.</p>
        </div>
      </section>
    </div>
  );
};
