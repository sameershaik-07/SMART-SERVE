import React, { useState } from 'react';
import { Button } from '../../components/common/Button';
import { verifyProviderApi, rejectProviderApi } from '../../api/admin';

export const AdminProvidersPage = () => {
  const [providers, setProviders] = useState([
    { id: 1, name: 'Vikram Singh', category: 'Electrician', status: 'PENDING', date: 'Applied 2h ago' },
    { id: 2, name: 'Pooja Nair', category: 'Home Cleaning', status: 'PENDING', date: 'Applied 4h ago' },
    { id: 3, name: 'CoolTech Services', category: 'AC Repair', status: 'VERIFIED', date: 'May 10, 2024' },
  ]);

  const handleVerify = async (id) => {
    try {
      await verifyProviderApi(id);
    } catch (e) {
      console.warn('API fallback:', e);
    }
    setProviders((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'VERIFIED' } : p)));
  };

  const handleReject = async (id) => {
    try {
      await rejectProviderApi(id);
    } catch (e) {
      console.warn('API fallback:', e);
    }
    setProviders((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'REJECTED' } : p)));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Provider Verification Queue</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Review documents and verify service provider accounts.</p>
      </div>

      <div className="sh-card bg-white p-6 space-y-4">
        {providers.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <h4 className="font-bold text-sm text-slate-900">{p.name}</h4>
              <span className="text-xs text-slate-500">{p.category} • {p.date}</span>
            </div>

            <div className="flex items-center gap-2">
              {p.status === 'PENDING' ? (
                <>
                  <Button size="sm" onClick={() => handleVerify(p.id)}>Verify</Button>
                  <Button size="sm" variant="danger" onClick={() => handleReject(p.id)}>Reject</Button>
                </>
              ) : (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  {p.status}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
