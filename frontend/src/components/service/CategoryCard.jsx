import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export const CategoryCard = ({ title, count, icon: Icon, onClick, active }) => {
  const countLabel =
    typeof count === 'number' || (typeof count === 'string' && count.trim() !== '')
      ? `${count} services`
      : 'Browse services';

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex w-full items-center justify-between gap-2 rounded-lg border p-3 text-left transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] sm:gap-3 sm:p-4',
        active
          ? 'border-primary/30 bg-primary/5'
          : 'border-hairline bg-card hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-[var(--shadow-soft)]'
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5 sm:gap-3.5">
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition-colors sm:h-10 sm:w-10',
            active
              ? 'border-primary/25 bg-primary/10 text-primary'
              : 'border-hairline bg-surface-soft text-body group-hover:text-primary'
          )}
        >
          <Icon size={18} strokeWidth={1.7} />
        </div>
        <div className="flex min-w-0 flex-col">
          <h4 className="truncate text-[12px] font-medium tracking-[-0.01em] text-ink sm:text-[13px]">{title}</h4>
          <span className="mt-0.5 truncate text-[10px] text-body sm:text-[11px]">{countLabel}</span>
        </div>
      </div>
      <ArrowUpRight
        size={14}
        className={cn(
          'hidden shrink-0 transition-all duration-300 sm:block',
          active
            ? 'text-primary'
            : 'text-muted-foreground/60 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary'
        )}
      />
    </button>
  );
};
