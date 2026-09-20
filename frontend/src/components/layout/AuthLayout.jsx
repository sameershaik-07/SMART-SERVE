import React from 'react';
import { Shield, Wrench, Sparkles, Calendar } from 'lucide-react';
import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col p-6 md:p-10 relative overflow-hidden">
      {/* Background Decorative Circles */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-foreground/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-foreground/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Split Card Container */}
      <main className="max-w-5xl w-full mx-auto bg-card/80 backdrop-blur-xl rounded-3xl border border-border shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 flex-1 my-auto z-10">
        {/* Left Visual Banner Side */}
        <div className="lg:col-span-6 bg-primary text-primary-foreground p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Floating Icon Badges */}
          <div className="absolute top-12 left-12 w-12 h-12 bg-primary-foreground/10 backdrop-blur-sm rounded-full flex items-center justify-center text-primary-foreground shadow-lg animate-bounce">
            <Wrench size={20} />
          </div>
          <div className="absolute top-16 right-16 w-12 h-12 bg-primary-foreground/10 backdrop-blur-sm rounded-full flex items-center justify-center text-primary-foreground shadow-lg">
            <Sparkles size={20} />
          </div>
          <div className="absolute bottom-28 right-12 w-12 h-12 bg-primary-foreground/10 backdrop-blur-sm rounded-full flex items-center justify-center text-primary-foreground shadow-lg">
            <Calendar size={20} />
          </div>

          {/* Center Mascot / Graphic Placeholder */}
          <div className="my-auto text-center relative py-8">
            <div className="w-48 h-48 lg:w-60 lg:h-60 mx-auto bg-primary-foreground rounded-full flex items-center justify-center shadow-2xl text-primary relative">
              <Shield size={96} className="fill-current stroke-primary-foreground animate-pulse" />
              <div className="absolute -bottom-2 bg-card text-foreground px-4 py-1 rounded-full text-xs font-black shadow-md uppercase tracking-wider">
                ServiceHub Professional
              </div>
            </div>
          </div>

          {/* Bottom Headline Text */}
          <div className="mt-6 z-10">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-primary-foreground tracking-tight leading-tight mb-2">
              Reliable Services.<br />
              <span className="text-primary-foreground/70">Right When You Need Them.</span>
            </h1>
            <p className="text-xs lg:text-sm text-primary-foreground/70 font-medium max-w-sm">
              Book trusted professionals for home, beauty, cleaning, repairs and more.
            </p>
          </div>
        </div>

        {/* Right Form Card Side */}
        <div className="lg:col-span-6 bg-card p-8 lg:p-12 flex flex-col justify-center">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
