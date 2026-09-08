import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const AdminAnalyticsPage = () => {
  const chartData = [
    { day: 'Mon', revenue: 24000, bookings: 45 },
    { day: 'Tue', revenue: 32000, bookings: 62 },
    { day: 'Wed', revenue: 28000, bookings: 54 },
    { day: 'Thu', revenue: 45000, bookings: 88 },
    { day: 'Fri', revenue: 52000, bookings: 95 },
    { day: 'Sat', revenue: 68000, bookings: 120 },
    { day: 'Sun', revenue: 61000, bookings: 110 },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Platform Analytics</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Growth metrics, revenue trends, and booking performance.</p>
      </div>

      <div className="sh-card p-6 bg-white space-y-4">
        <h3 className="text-base font-bold text-slate-800">Revenue & Booking Trends (7 Days)</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
