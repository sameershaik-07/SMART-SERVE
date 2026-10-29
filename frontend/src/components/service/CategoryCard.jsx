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
        'group flex w-full items-center justify-between gap-3 rounded-lg border p-4 text-left transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)]',
        active
          ? 'border-primary/30 bg-primary/5'
          : 'border-hairline bg-card hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-[var(--shadow-soft)]'
      )}
    >
      <div className="flex min-w-0 items-center gap-3.5">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-md border transition-colors',
            active
              ? 'border-primary/25 bg-primary/10 text-primary'
              : 'border-hairline bg-surface-soft text-body group-hover:text-primary'
          )}
        >
          <Icon size={18} strokeWidth={1.7} />
        </div>
        <div className="flex min-w-0 flex-col">
          <h4 className="truncate text-[13px] font-medium tracking-[-0.01em] text-ink">{title}</h4>
          <span className="mt-0.5 text-[11px] text-muted-foreground">{countLabel}</span>
        </div>
      </div>
      <ArrowUpRight
        size={14}
        className={cn(
          'shrink-0 transition-all duration-300',
          active
            ? 'text-primary'
            : 'text-muted-foreground/60 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary'
        )}
      />
    </button>
  );
};
