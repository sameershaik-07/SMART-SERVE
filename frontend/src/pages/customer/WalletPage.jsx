import React, { useState } from 'react';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, CreditCard, History } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { AddMoneyModal } from '../../components/wallet/AddMoneyModal';

export const WalletPage = () => {
  const [balance, setBalance] = useState(2450.0);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [transactions, setTransactions] = useState([
    { id: 'TXN1089', type: 'DEBIT', title: 'Payment for AC Repair & Service', date: 'May 21, 2024', amount: 799 },
    { id: 'TXN1088', type: 'CREDIT', title: 'Wallet Top-up via UPI', date: 'May 19, 2024', amount: 2000 },
    { id: 'TXN1087', type: 'DEBIT', title: 'Payment for Deep Cleaning', date: 'May 15, 2024', amount: 999 },
    { id: 'TXN1086', type: 'CREDIT', title: 'Referral Cashback Reward', date: 'May 10, 2024', amount: 250 },
  ]);

  const handleAddFundsSuccess = (amt) => {
    const num = Number(amt);
    setBalance((prev) => prev + num);
    const newTxn = {
      id: `TXN${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'CREDIT',
      title: 'Wallet Top-up via Instant Pay',
      date: 'Just now',
      amount: num,
    };
    setTransactions((prev) => [newTxn, ...prev]);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl pb-16">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">ServiceHub Wallet</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Manage your funds, view credits, and track transactions.</p>
      </div>

      {/* Balance Card */}
      <div className="sh-card p-8 bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-200 block mb-1">
              Available Balance
            </span>
            <h2 className="text-4xl font-black tracking-tight">
              ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h2>
            <span className="text-xs text-purple-200 mt-2 block font-medium">
              🔒 Instant 1-click checkout for all services
            </span>
          </div>

          <Button
            onClick={() => setIsAddOpen(true)}
            variant="secondary"
            size="lg"
            icon={Plus}
          >
            Add Funds
          </Button>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="sh-card p-6 bg-white space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <History size={18} className="text-purple-600" /> Transaction History
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {transactions.map((txn) => (
            <div key={txn.id} className="py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    txn.type === 'CREDIT' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}
                >
                  {txn.type === 'CREDIT' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{txn.title}</h4>
                  <span className="text-[11px] text-slate-400 font-medium">{txn.id} • {txn.date}</span>
                </div>
              </div>

              <span
                className={`text-sm font-extrabold ${
                  txn.type === 'CREDIT' ? 'text-emerald-600' : 'text-slate-900'
                }`}
              >
                {txn.type === 'CREDIT' ? '+' : '-'}₹{txn.amount}
              </span>
            </div>
          ))}
        </div>
      </div>

      <AddMoneyModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={handleAddFundsSuccess}
      />
    </div>
  );
};
