import React, { useState } from 'react';
import { Wallet, Plus, Calendar, Heart, History, Headphones, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AddMoneyModal } from '../wallet/AddMoneyModal';

export const RightWalletPanel = ({ balance = 2450.00, onAddMoneySuccess }) => {
  const navigate = useNavigate();
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(balance);

  const handleAddSuccess = (addedAmount) => {
    setCurrentBalance((prev) => prev + Number(addedAmount));
    if (onAddMoneySuccess) onAddMoneySuccess(addedAmount);
  };

  return (
    <aside className="w-80 p-6 flex flex-col gap-6 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto border-l border-slate-200/80 bg-white/50 backdrop-blur-xs">
      {/* Wallet Balance Card */}
      <div className="sh-card p-5 bg-gradient-to-br from-white to-purple-50/50 border border-purple-100/80 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center">
              <Wallet size={18} />
            </div>
            <span className="text-sm font-bold text-slate-800">Wallet Balance</span>
          </div>
          <button className="text-slate-400 hover:text-slate-600">
            <MoreHorizontal size={18} />
          </button>
        </div>

        <div className="mb-4">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            ₹{currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h2>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Active Balance
          </div>
        </div>

        <button
          onClick={() => setIsAddMoneyOpen(true)}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-purple-600/25 flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Add Money
        </button>
      </div>

      {/* Quick Actions List */}
      <div className="sh-card p-4 space-y-1">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 py-2">
          Quick Actions
        </h4>

        <button
          onClick={() => navigate('/bookings')}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-purple-700 transition-colors text-sm font-semibold group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-purple-100 group-hover:text-purple-700 transition-colors">
              <Calendar size={16} />
            </div>
            <span>My Bookings</span>
          </div>
          <ChevronRight size={16} className="text-slate-400 group-hover:text-purple-600" />
        </button>

        <button
          onClick={() => navigate('/favorites')}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-purple-700 transition-colors text-sm font-semibold group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-purple-100 group-hover:text-purple-700 transition-colors">
              <Heart size={16} />
            </div>
            <span>Saved Providers</span>
          </div>
          <ChevronRight size={16} className="text-slate-400 group-hover:text-purple-600" />
        </button>

        <button
          onClick={() => navigate('/wallet')}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-purple-700 transition-colors text-sm font-semibold group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-purple-100 group-hover:text-purple-700 transition-colors">
              <History size={16} />
            </div>
            <span>Transaction History</span>
          </div>
          <ChevronRight size={16} className="text-slate-400 group-hover:text-purple-600" />
        </button>
      </div>

      {/* Need Help Card */}
      <div className="sh-card p-5 border border-purple-100 text-center bg-gradient-to-b from-white to-purple-50/30">
        <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center mx-auto mb-3">
          <Headphones size={20} />
        </div>
        <h4 className="text-sm font-bold text-slate-800 mb-1">Need Help?</h4>
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          Get quick support for your bookings and more.
        </p>
        <button
          onClick={() => navigate('/help')}
          className="w-full py-2.5 bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 font-bold rounded-xl text-xs transition-colors shadow-2xs"
        >
          Contact Support
        </button>
      </div>

      <AddMoneyModal
        isOpen={isAddMoneyOpen}
        onClose={() => setIsAddMoneyOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </aside>
  );
};
