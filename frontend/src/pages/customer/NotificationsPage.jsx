import React from 'react';
import { Bell, CheckCircle2, Calendar, ShieldAlert } from 'lucide-react';

export const NotificationsPage = () => {
  const notifications = [
    {
      id: 1,
      title: 'Booking Confirmed!',
      message: 'Your AC Repair & Service booking with CoolTech Services has been accepted for 10:30 AM.',
      time: '10 mins ago',
      type: 'success',
    },
    {
      id: 2,
      title: 'Technician En Route',
      message: 'Cleanify Experts technician Ramesh is on the way to your address.',
      time: '2 hours ago',
      type: 'info',
    },
    {
      id: 3,
      title: 'Festive Discount Available!',
      message: 'Get 20% off on all Beauty & Home Cleaning services this weekend.',
      time: '1 day ago',
      type: 'promo',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl pb-16">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Notifications</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Stay updated on your booking status and exclusive offers.</p>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div key={n.id} className="sh-card p-4 bg-white flex items-start gap-3.5 border-l-4 border-l-purple-600">
            <div className="p-2 bg-purple-50 text-purple-700 rounded-xl shrink-0 mt-0.5">
              <Bell size={18} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs font-bold text-slate-800">{n.title}</h4>
                <span className="text-[10px] text-slate-400 font-medium">{n.time}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
