import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
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
          <h3 className="text-lg font-bold text-slate-800">Money Added Successfully!</h3>
          <p className="text-sm text-slate-500 mt-1">₹{amount} added to your ServiceHub Wallet.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Input
              label="Enter Amount (₹)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 1000"
              icon={Wallet}
              required
            />
            <div className="flex gap-2 mt-3">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    amount === preset
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  +₹{preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">Select Payment Method</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-purple-600 bg-purple-50/50 cursor-pointer">
                <input type="radio" name="payment" defaultChecked className="accent-purple-600" />
                <CreditCard size={18} className="text-purple-600" />
                <span className="text-sm font-semibold text-slate-800">UPI / Debit Card / NetBanking</span>
              </label>
            </div>
          </div>

          <Button type="submit" fullWidth loading={loading}>
            Proceed to Pay ₹{amount || 0}
          </Button>
        </form>
      )}
    </Modal>
  );
};
