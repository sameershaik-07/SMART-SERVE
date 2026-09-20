import React, { useState } from 'react';
import { Wallet, Plus, Calendar, Heart, History, Headphones, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AddMoneyModal } from '../wallet/AddMoneyModal';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const RightWalletPanel = ({ balance = 2450.00, onAddMoneySuccess }) => {
  const navigate = useNavigate();
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(balance);

  const handleAddSuccess = (addedAmount) => {
    setCurrentBalance((prev) => prev + Number(addedAmount));
    if (onAddMoneySuccess) onAddMoneySuccess(addedAmount);
  };

  return (
    <aside className="w-[340px] p-6 flex flex-col gap-5 sticky top-[76px] h-[calc(100vh-76px)] overflow-y-auto border-l border-border bg-background/70 transition-colors">
      {/* Wallet Balance Card */}
      <Card className="border-border shadow-none bg-card">
        <CardHeader className="p-5 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                <Wallet size={18} />
              </div>
              <CardTitle className="text-sm font-bold text-foreground">Wallet Balance</CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-1 space-y-4">
          <div>
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
              ₹{currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h2>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Active Balance
            </div>
          </div>

          <Button
            onClick={() => setIsAddMoneyOpen(true)}
            className="w-full gap-2 rounded-xl shadow-none"
          >
            <Plus size={16} /> Add Money
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions List */}
      <Card className="p-2 border-border shadow-xs">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-3 py-2">
          Quick Actions
        </div>

        <div className="space-y-1">
          <Button
            variant="ghost"
            onClick={() => navigate('/bookings')}
            className="w-full justify-between h-auto p-2.5 rounded-xl font-medium"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg text-foreground">
                <Calendar size={15} />
              </div>
              <span className="text-sm">My Bookings</span>
            </div>
            <ChevronRight size={15} className="text-muted-foreground" />
          </Button>

          <Button
            variant="ghost"
            onClick={() => navigate('/favorites')}
            className="w-full justify-between h-auto p-2.5 rounded-xl font-medium"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg text-foreground">
                <Heart size={15} />
              </div>
              <span className="text-sm">Saved Providers</span>
            </div>
            <ChevronRight size={15} className="text-muted-foreground" />
          </Button>

          <Button
            variant="ghost"
            onClick={() => navigate('/wallet')}
            className="w-full justify-between h-auto p-2.5 rounded-xl font-medium"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg text-foreground">
                <History size={15} />
              </div>
              <span className="text-sm">Transaction History</span>
            </div>
            <ChevronRight size={15} className="text-muted-foreground" />
          </Button>
        </div>
      </Card>

      {/* Need Help Card */}
      <Card className="p-5 border-border text-center bg-muted/30 shadow-xs">
        <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-3">
          <Headphones size={20} />
        </div>
        <h4 className="text-sm font-bold text-foreground mb-1">Need Help?</h4>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          Get quick assistance for your service requests and bookings.
        </p>
        <Button
          variant="outline"
          onClick={() => navigate('/help')}
          className="w-full text-xs font-semibold rounded-xl"
        >
          Contact Support
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
