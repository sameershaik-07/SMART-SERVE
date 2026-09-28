import React from 'react';
import { ChevronRight } from 'lucide-react';

export const CategoryCard = ({ title, count, icon: Icon, colorBg, colorText, onClick, active }) => {
  const countLabel = typeof count === 'number' || (typeof count === 'string' && count.trim() !== '') ? `${count} services` : 'services';

  return (
    <div
      onClick={onClick}
      className={`sh-card p-4 flex items-center justify-between cursor-pointer transition-all duration-200 hover:-translate-y-0.5 ${
        active ? 'border-foreground/70 ring-2 ring-foreground/10 bg-muted/40' : 'hover:border-foreground/25'
      }`}
    >
      <div className="flex min-w-0 items-center gap-3.5">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
          style={{ backgroundColor: colorBg, color: colorText }}
        >
          <Icon size={22} />
        </div>
        <div className="flex min-w-0 flex-col">
          <h4 className="truncate text-sm font-bold text-foreground tracking-tight">{title}</h4>
          <span className="text-xs text-muted-foreground font-medium">{countLabel}</span>
        </div>
      </div>
      <ChevronRight size={16} className="shrink-0 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
    </div>
  );
};
