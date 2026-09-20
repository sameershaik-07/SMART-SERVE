import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { getAdminAnalyticsTrendsApi } from '../../api/admin';

export const AdminAnalyticsPage = () => {
  const [trends, setTrends] = useState({ series: [], totalBookings: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminAnalyticsTrendsApi(7)
      .then((response) => setTrends(response?.data || response || { series: [], totalBookings: 0, totalRevenue: 0 }))
      .catch((err) => setError(err.message || 'Unable to load analytics.'))
      .finally(() => setLoading(false));
  }, []);

  const chartData = trends.series || [];
  const hasActivity = chartData.some((item) => item.bookings > 0 || item.revenue > 0);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div>
        <h1 className="workspace-title text-3xl">Platform Analytics</h1>
        <p className="workspace-subtitle mt-1">Actual booking and successful-payment performance for the last seven days.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sh-card bg-card p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Bookings, last 7 days</p>
          <p className="mt-2 text-3xl font-black text-foreground">{trends.totalBookings || 0}</p>
        </div>
        <div className="sh-card bg-card p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Successful payment revenue</p>
          <p className="mt-2 text-3xl font-black text-foreground">₹{Number(trends.totalRevenue || 0).toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="sh-card p-6 bg-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-bold text-foreground">Revenue & Booking Trends (7 Days)</h3>
          <span className="text-xs text-muted-foreground">Revenue is based on successful payments only.</span>
        </div>
        <div className="h-72 w-full">
          {loading ? (
            <div className="h-full grid place-items-center text-sm font-medium text-muted-foreground">Loading actual analytics…</div>
          ) : error ? (
            <div className="h-full grid place-items-center text-sm font-medium text-destructive">{error}</div>
          ) : !hasActivity ? (
            <div className="h-full grid place-items-center text-center text-sm font-medium text-muted-foreground">No bookings or successful payments were recorded in the last seven days.</div>
          ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#18181b" stopOpacity={0.26} />
                  <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="day" stroke="#71717a" fontSize={12} />
              <YAxis yAxisId="revenue" stroke="#71717a" fontSize={12} tickFormatter={(value) => `₹${value}`} />
              <YAxis yAxisId="bookings" orientation="right" stroke="#71717a" fontSize={12} allowDecimals={false} />
              <Tooltip formatter={(value, name) => [name === 'revenue' ? `₹${Number(value).toLocaleString('en-IN')}` : value, name === 'revenue' ? 'Revenue' : 'Bookings']} />
              <Legend formatter={(value) => value === 'revenue' ? 'Revenue' : 'Bookings'} />
              <Area yAxisId="revenue" type="monotone" dataKey="revenue" stroke="#18181b" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              <Area yAxisId="bookings" type="monotone" dataKey="bookings" stroke="#71717a" strokeWidth={2} fill="none" />
            </AreaChart>
          </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
