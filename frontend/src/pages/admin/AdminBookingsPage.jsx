import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, Search } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { getAdminBookingsApi } from '../../api/admin';

export const AdminBookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getAdminBookingsApi()
      .then((res) => {
        const rows = Array.isArray(res?.data) ? res.data : res;
        if (Array.isArray(rows)) {
          const mapped = rows.map((b) => ({
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
        setError(e.message || 'Unable to load bookings.');
      })
      .finally(() => setLoading(false));
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
          <h1 className="workspace-title text-3xl">Admin Booking Management</h1>
          <p className="workspace-subtitle mt-1">
            Real-time monitoring, customer & provider locations, and status oversight.
          </p>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:border-foreground w-64 shadow-sm"
          />
        </div>
      </div>

      <div className="sh-card bg-card p-6 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-border text-xs font-bold text-muted-foreground uppercase">
              <th className="pb-3">Booking</th>
              <th className="pb-3">Service</th>
              <th className="pb-3">Customer</th>
              <th className="pb-3">Provider</th>
              <th className="pb-3">Status</th>
              <th className="pb-3 text-right">Amount</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs font-semibold text-foreground">
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-muted/60 transition-colors">
                <td className="py-3.5 font-bold text-foreground">{b.displayId}</td>
                <td className="py-3.5">{b.service}</td>
                <td className="py-3.5">{b.customer}</td>
                <td className="py-3.5">{b.provider}</td>
                <td className="py-3.5">
                  <Badge variant={
                    b.status === 'COMPLETED' ? 'success' :
                    b.status === 'IN_PROGRESS' || b.status === 'ACCEPTED' ? 'primary' :
                    b.status === 'CANCELLED' ? 'danger' : 'warning'
                  }>
                    {b.status}
                  </Badge>
                </td>
                <td className="py-3.5 text-right font-bold text-foreground">{b.amount}</td>
                <td className="py-3.5 text-right">
                  <button
                    onClick={() => navigate(`/bookings/${b.id}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted text-foreground hover:bg-accent border border-border rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    <Navigation size={12} />
                    Live Map
                  </button>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan="7" className="py-12 text-center text-muted-foreground font-medium">
                  {error || 'No bookings found.'}
                </td>
              </tr>
            )}
            {loading && (
              <tr><td colSpan="7" className="py-12 text-center text-muted-foreground font-medium">Loading bookings…</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
