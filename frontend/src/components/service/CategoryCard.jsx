import React from 'react';
import { ChevronRight } from 'lucide-react';

export const CategoryCard = ({ title, count, icon: Icon, colorBg, colorText, onClick, active }) => {
  return (
    <div
      onClick={onClick}
      className={`sh-card p-4 flex items-center justify-between cursor-pointer transition-all duration-200 hover:-translate-y-1 ${
        active ? 'border-purple-600 ring-2 ring-purple-100 bg-purple-50/30' : 'hover:border-purple-200'
      }`}
    >
      <div className="flex items-center gap-3.5">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
          style={{ backgroundColor: colorBg, color: colorText }}
        >
          <Icon size={22} />
        </div>
        <div className="flex flex-col">
          <h4 className="text-sm font-bold text-slate-800 tracking-tight">{title}</h4>
          <span className="text-xs text-slate-400 font-medium">{count} services</span>
        </div>
      </div>
      <ChevronRight size={16} className="text-slate-300 group-hover:text-purple-600 transition-colors" />
    </div>
  );
};
