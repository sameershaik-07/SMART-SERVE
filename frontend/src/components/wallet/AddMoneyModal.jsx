import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CreditCard, Wallet, CheckCircle2 } from 'lucide-react';

export const AddMoneyModal = ({ isOpen, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('1000');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const presets = ['500', '1000', '2000', '5000'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      if (onSuccess) onSuccess(Number(amount));
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    }, 1000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Money to Wallet">
      {success ? (
        <div className="text-center py-6">
          <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-3 animate-bounce" />
          <h3 className="text-lg font-bold text-foreground">Money Added Successfully!</h3>
          <p className="text-sm text-muted-foreground mt-1">₹{amount} added to your ServiceHub Wallet.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Enter Amount (₹)</Label>
            <div className="relative flex items-center">
              <div className="absolute left-3 text-muted-foreground pointer-events-none">
                <Wallet size={16} />
              </div>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 1000"
                className="pl-9 h-11 rounded-xl"
                required
              />
            </div>
            <div className="flex gap-2 pt-1">
              {presets.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={amount === preset ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAmount(preset)}
                  className="flex-1 rounded-lg text-xs"
                >
                  +₹{preset}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold block">Payment Method</Label>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/40 bg-primary/5 cursor-pointer">
              <input type="radio" name="payment" defaultChecked className="accent-primary" />
              <CreditCard size={18} className="text-primary" />
              <span className="text-sm font-medium text-foreground">UPI / Cards / NetBanking</span>
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full h-11 rounded-xl text-sm font-semibold">
            Proceed to Pay ₹{amount || 0}
          </Button>
        </form>
      )}
    </Modal>
  );
};
