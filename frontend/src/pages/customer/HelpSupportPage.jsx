import React from 'react';
import { Headphones, Mail, Phone, HelpCircle } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const HelpSupportPage = () => {
  const faqs = [
    { q: 'How do I cancel or reschedule a booking?', a: 'You can cancel or reschedule any booking under "My Bookings" before the provider starts heading to your location.' },
    { q: 'What payment options are accepted?', a: 'ServiceHub supports Razorpay UPI, Debit/Credit Cards, NetBanking, and instant 1-click ServiceHub Wallet balance.' },
    { q: 'Are all service providers background checked?', a: 'Yes! Every professional undergoes rigorous identity verification, background check, and skill evaluation before joining ServiceHub.' },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl pb-16">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Help & Support</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">We are here to assist you 24/7 with any service queries.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="sh-card p-5 bg-white flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-700 rounded-2xl">
            <Phone size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">Toll-Free Helpline</span>
            <span className="text-base font-extrabold text-slate-900">1800-123-SERVICE</span>
          </div>
        </div>

        <div className="sh-card p-5 bg-white flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-700 rounded-2xl">
            <Mail size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">Email Support</span>
            <span className="text-base font-extrabold text-slate-900">support@servicehub.com</span>
          </div>
        </div>
      </div>

      <div className="sh-card p-6 bg-white space-y-4">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <HelpCircle size={18} className="text-purple-600" /> Frequently Asked Questions
        </h3>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50 rounded-xl space-y-1">
              <h4 className="text-xs font-bold text-slate-800">{faq.q}</h4>
              <p className="text-xs text-slate-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
