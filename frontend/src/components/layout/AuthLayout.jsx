import React from 'react';
import { Shield, MapPin, ChevronDown, Wrench, Sparkles, Calendar } from 'lucide-react';
import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-slate-50 to-indigo-50 flex flex-col p-6 md:p-10 relative overflow-hidden">
      {/* Background Decorative Circles */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header Bar matching Reference Image 1 */}
      <header className="flex items-center justify-between max-w-6xl w-full mx-auto mb-8 z-10">
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-purple-100 shadow-2xs text-xs font-semibold text-slate-700">
          <MapPin size={14} className="text-purple-600" />
          <span>Hyderabad, India</span>
          <ChevronDown size={14} className="text-slate-400" />
        </div>

        <div className="flex items-center gap-6 text-xs font-semibold text-slate-600">
          <button className="hover:text-purple-700 transition-colors">Help</button>
          <div className="flex items-center gap-1 cursor-pointer hover:text-purple-700">
            <span>🌐 English</span>
            <ChevronDown size={12} className="text-slate-400" />
          </div>
        </div>
      </header>

      {/* Main Split Card Container */}
      <main className="max-w-5xl w-full mx-auto bg-white/70 backdrop-blur-xl rounded-3xl border border-white/80 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 flex-1 my-auto z-10">
        {/* Left Visual Banner Side */}
        <div className="lg:col-span-6 bg-gradient-to-br from-purple-100/80 to-indigo-100/60 p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Floating Icon Badges */}
          <div className="absolute top-12 left-12 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-purple-600 shadow-lg shadow-purple-500/10 animate-bounce">
            <Wrench size={20} />
          </div>
          <div className="absolute top-16 right-16 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-purple-600 shadow-lg shadow-purple-500/10">
            <Sparkles size={20} />
          </div>
          <div className="absolute bottom-28 right-12 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-purple-600 shadow-lg shadow-purple-500/10">
            <Calendar size={20} />
          </div>

          {/* Center Mascot / Graphic Placeholder */}
          <div className="my-auto text-center relative py-8">
            <div className="w-48 h-48 lg:w-60 lg:h-60 mx-auto bg-purple-600 rounded-full flex items-center justify-center shadow-2xl shadow-purple-600/30 text-white relative">
              <Shield size={96} className="fill-white stroke-purple-600 animate-pulse" />
              <div className="absolute -bottom-2 bg-white text-purple-900 px-4 py-1 rounded-full text-xs font-black shadow-md uppercase tracking-wider">
                ServiceHub Professional
              </div>
            </div>
          </div>

          {/* Bottom Headline Text */}
          <div className="mt-6 z-10">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-purple-950 tracking-tight leading-tight mb-2">
              Reliable Services.<br />
              <span className="text-purple-700">Right When You Need Them.</span>
            </h1>
            <p className="text-xs lg:text-sm text-purple-800/80 font-medium max-w-sm">
              Book trusted professionals for home, beauty, cleaning, repairs and more.
            </p>
          </div>
        </div>

        {/* Right Form Card Side */}
        <div className="lg:col-span-6 bg-white p-8 lg:p-12 flex flex-col justify-center">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
