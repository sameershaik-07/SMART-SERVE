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
    <Modal isOpen={isOpen} onClose={onClose} title="Add money to wallet">
      {success ? (
        <div className="py-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-accent-teal/25 bg-accent-teal/10 text-accent-teal">
            <CheckCircle2 size={26} strokeWidth={1.7} className="animate-bounce" />
          </div>
          <h3 className="font-display text-[1.6rem] leading-tight text-ink">Money added</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            ₹{Number(amount).toLocaleString('en-IN')} is now available in your ServiceHub wallet.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Amount (₹)
            </Label>
            <div className="relative flex items-center">
              <div className="pointer-events-none absolute left-3.5 text-muted-foreground">
                <Wallet size={15} />
              </div>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 1000"
                className="h-11 pl-10"
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
                  className="flex-1 text-[11px]"
                >
                  +₹{preset}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Payment method
            </Label>
            <div className="flex cursor-pointer items-center gap-3 rounded-md border border-primary/35 bg-primary/5 p-3.5">
              <input
                type="radio"
                name="payment"
                defaultChecked
                className="h-3.5 w-3.5 accent-primary"
              />
              <CreditCard size={17} className="text-primary" />
              <span className="text-xs font-medium text-ink">UPI / Cards / Net banking</span>
            </div>
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              Payments are processed securely. Wallet balance never expires.
            </p>
          </div>

          <Button type="submit" loading={loading} className="h-11 w-full text-xs">
            Proceed to pay ₹{amount ? Number(amount).toLocaleString('en-IN') : 0}
          </Button>
        </form>
      )}
    </Modal>
  );
};
