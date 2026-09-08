import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, MapPin, Search, Filter, ExternalLink } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { apiFetch } from '../../api/client';

export const AdminBookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Attempt loading real bookings if available
    apiFetch('/admin/dashboard')
      .then((res) => {
        if (res?.recentBookings && Array.isArray(res.recentBookings) && res.recentBookings.length > 0) {
          const mapped = res.recentBookings.map((b) => ({
            id: b.id,
            displayId: `#BK-${b.id}`,
            service: b.service?.title || 'Home Service',
            customer: b.customer?.user?.name || `Customer #${b.customerId}`,
            provider: b.provider?.user?.name || `Provider #${b.providerId}`,
            date: new Date(b.serviceDate || b.createdAt).toLocaleDateString(),
            status: b.status,
            amount: `₹${b.totalPrice || 799}`,
            location: b.location || 'Bengaluru'
          }));
          setBookings(mapped);
        }
      })
      .catch((e) => {
        console.warn('Using admin mock bookings fallback:', e.message);
      });
  }, []);

  const filtered = bookings.filter(b => 
    b.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Booking Management</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Real-time monitoring, customer & provider locations, and status oversight.
          </p>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 w-64 shadow-sm"
          />
        </div>
      </div>

      <div className="sh-card bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
              <th className="pb-3">Booking</th>
              <th className="pb-3">Service</th>
              <th className="pb-3">Customer</th>
              <th className="pb-3">Provider</th>
              <th className="pb-3">Status</th>
              <th className="pb-3 text-right">Amount</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 font-bold text-slate-900">{b.displayId}</td>
                <td className="py-3.5">{b.service}</td>
                <td className="py-3.5 text-slate-800">{b.customer}</td>
                <td className="py-3.5 text-indigo-700">{b.provider}</td>
                <td className="py-3.5">
                  <Badge variant={
                    b.status === 'COMPLETED' ? 'success' :
                    b.status === 'IN_PROGRESS' || b.status === 'ACCEPTED' ? 'primary' :
                    b.status === 'CANCELLED' ? 'danger' : 'warning'
                  }>
                    {b.status}
                  </Badge>
                </td>
                <td className="py-3.5 text-right font-bold text-slate-900">{b.amount}</td>
                <td className="py-3.5 text-right">
                  <button
                    onClick={() => navigate(`/bookings/${b.id}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    <Navigation size={12} className="text-emerald-600" />
                    Live Map
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
