import React, { useState } from 'react';
import { Plus, ArrowUpRight, ArrowDownLeft, History, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { AddMoneyModal } from '../../components/wallet/AddMoneyModal';
import { Reveal } from '@/components/motion/Reveal';
import { AnimatedNumber } from '@/components/motion/AnimatedNumber';

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

  const totalIn = transactions
    .filter((t) => t.type === 'CREDIT')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalOut = transactions
    .filter((t) => t.type === 'DEBIT')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="mx-auto max-w-[1000px] animate-fade-in space-y-6 pb-16">
      <Reveal className="flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <p className="sh-eyebrow">Your money, in one place</p>
          <h1 className="workspace-title mt-2">ServiceHub wallet</h1>
          <p className="workspace-subtitle">
            Keep a balance ready for one-click checkout, and see every credit and payment.
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-pill border border-hairline bg-surface-soft px-3 py-1.5 text-[10px] font-medium text-muted-foreground">
          <ShieldCheck size={12} className="text-accent-teal" /> Secured by ServiceHub
        </span>
      </Reveal>

      {/* Balance panel */}
      <Reveal delay={0.05}>
        <div className="sh-dark-panel relative overflow-hidden rounded-xl">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-coral/22 blur-[100px]" />
          <div className="sh-ruled-grid pointer-events-none absolute inset-0 opacity-[0.12]" />
          <div className="relative flex flex-wrap items-end justify-between gap-8 px-6 py-8 sm:px-9 sm:py-10">
            <div>
              <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-coral">
                <Sparkles size={12} /> Available balance
              </span>
              <p className="mt-3 font-display text-[clamp(3rem,7vw,4.2rem)] leading-none tracking-[-0.045em] text-on-dark">
                ₹<AnimatedNumber value={balance} decimals={2} />
              </p>
              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-on-dark-soft">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-teal" />
                Instant checkout across every service
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <div className="space-y-2 border-l border-white/10 pl-6 text-[11px]">
                <p className="flex items-center gap-1.5 text-on-dark-soft">
                  <ArrowDownLeft size={12} className="text-accent-teal" /> In
                  <span className="font-medium tabular-nums text-on-dark">
                    ₹{totalIn.toLocaleString('en-IN')}
                  </span>
                </p>
                <p className="flex items-center gap-1.5 text-on-dark-soft">
                  <ArrowUpRight size={12} className="text-coral" /> Out
                  <span className="font-medium tabular-nums text-on-dark">
                    ₹{totalOut.toLocaleString('en-IN')}
                  </span>
                </p>
              </div>
              <Button
                onClick={() => setIsAddOpen(true)}
                variant="coral"
                size="lg"
                icon={Plus}
              >
                Add funds
              </Button>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Transactions */}
      <Reveal delay={0.1} className="overflow-hidden rounded-lg border border-hairline bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-display text-[1.5rem] leading-tight text-ink">Transactions</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Everything that has moved in and out of your wallet.
            </p>
          </div>
          <span className="flex items-center gap-1.5 rounded-pill border border-hairline bg-surface-soft px-2.5 py-1 text-[10px] text-muted-foreground">
            <History size={11} /> {transactions.length} records
          </span>
        </div>

        <div className="divide-y divide-hairline-soft">
          {transactions.map((txn) => {
            const credit = txn.type === 'CREDIT';
            return (
              <div
                key={txn.id}
                className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-surface-soft/40 sm:px-6"
              >
                <div className="flex min-w-0 items-center gap-3.5">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border ${
                      credit
                        ? 'border-accent-teal/20 bg-accent-teal/8 text-accent-teal'
                        : 'border-hairline bg-surface-soft text-body'
                    }`}
                  >
                    {credit ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-[13px] font-medium text-ink">{txn.title}</h3>
                    <p className="mt-0.5 text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                      {txn.id} · {txn.date}
                    </p>
                  </div>
                </div>

                <span
                  className={`shrink-0 text-sm font-medium tabular-nums ${
                    credit ? 'text-accent-teal' : 'text-ink'
                  }`}
                >
                  {credit ? '+' : '−'}₹{Number(txn.amount).toLocaleString('en-IN')}
                </span>
              </div>
            );
          })}
        </div>
      </Reveal>

      <p className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
        <ShieldCheck size={12} className="text-accent-teal" />
        Wallet payments are protected and refunded automatically if a booking is cancelled.
      </p>

      <AddMoneyModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={handleAddFundsSuccess}
      />
    </div>
  );
};
