import React, { useState } from 'react';
import { Wallet, Plus, Calendar, Heart, History, Headphones, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AddMoneyModal } from '../wallet/AddMoneyModal';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const RightWalletPanel = ({ balance = 2450.0, onAddMoneySuccess }) => {
  const navigate = useNavigate();
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(balance);

  const handleAddSuccess = (addedAmount) => {
    setCurrentBalance((prev) => prev + Number(addedAmount));
    if (onAddMoneySuccess) onAddMoneySuccess(addedAmount);
  };

  const quickActions = [
    { label: 'My bookings', icon: Calendar, path: '/bookings' },
    { label: 'Saved providers', icon: Heart, path: '/favorites' },
    { label: 'Transaction history', icon: History, path: '/wallet' },
  ];

  return (
    <aside className="sticky top-[76px] flex h-[calc(100vh-76px)] w-[320px] flex-col gap-4 overflow-y-auto border-l border-hairline bg-canvas/65 p-5">
      <div className="sh-dark-panel relative overflow-hidden rounded-lg p-5">
        <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-coral/20 blur-3xl" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-on-dark-soft">
              <Wallet size={15} strokeWidth={1.8} />
              <span className="text-[10px] font-medium uppercase tracking-[0.16em]">Wallet balance</span>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] text-accent-teal">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-teal" />
              Active
            </span>
          </div>
          <p className="mt-4 font-display text-[2.35rem] leading-none tracking-[-0.03em] text-on-dark">
            ₹{currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-2 text-xs text-on-dark-soft">Ready for your next booking</p>
          <Button
            onClick={() => setIsAddMoneyOpen(true)}
            className="mt-5 w-full gap-2"
            variant="coral"
          >
            <Plus size={15} /> Add money
          </Button>
        </div>
      </div>

      <Card className="border-hairline bg-card p-2 shadow-none">
        <div className="px-3 py-2 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Quick actions
        </div>
        <div className="space-y-0.5">
          {quickActions.map(({ label, icon: Icon, path }) => (
            <Button
              key={label}
              variant="ghost"
              onClick={() => navigate(path)}
              className="h-auto w-full justify-between rounded-sm p-2.5 font-normal"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-surface-soft text-ink">
                  <Icon size={14} strokeWidth={1.8} />
                </span>
                <span className="text-[13px] text-body">{label}</span>
              </span>
              <ChevronRight size={14} className="text-muted-foreground" />
            </Button>
          ))}
        </div>
      </Card>

      <Card className="border-hairline bg-surface-soft p-5 text-center shadow-none">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Headphones size={19} strokeWidth={1.8} />
        </div>
        <h4 className="font-sans text-sm font-medium text-ink">Need a hand?</h4>
        <p className="mb-4 mt-1 text-xs leading-relaxed text-muted-foreground">
          Quick help for bookings, payments, and service requests.
        </p>
        <Button variant="outline" onClick={() => navigate('/help')} className="w-full text-xs">
          Contact support
        </Button>
      </Card>

      <AddMoneyModal
        isOpen={isAddMoneyOpen}
        onClose={() => setIsAddMoneyOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </aside>
  );
};
