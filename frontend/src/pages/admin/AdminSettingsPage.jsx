import React from 'react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const AdminSettingsPage = () => {
  return (
    <div className="space-y-6 animate-fade-in max-w-2xl pb-16">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Platform Settings</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Configure global platform commission, policies, and system parameters.</p>
      </div>

      <div className="sh-card p-6 bg-white space-y-4">
        <h3 className="text-base font-bold text-slate-800">Commission & Payouts</h3>
        <Input label="Platform Commission Rate (%)" defaultValue="15" />
        <Input label="Minimum Payout Threshold (₹)" defaultValue="500" />
        <Button>Save Platform Settings</Button>
      </div>
    </div>
  );
};
