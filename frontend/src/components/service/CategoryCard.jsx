import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export const CategoryCard = ({ title, count, icon: Icon, image, onClick, active }) => {
  const countLabel =
    typeof count === 'number' || (typeof count === 'string' && count.trim() !== '')
      ? `${count} services`
      : 'Browse services';

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex w-full items-center justify-between gap-1.5 rounded-lg border p-3 text-left transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] sm:gap-1',
        active
          ? 'border-primary/30 bg-primary/5'
          : 'border-hairline bg-card hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-[var(--shadow-soft)]'
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <div
          className={cn(
            'relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border transition-all sm:h-14 sm:w-14',
            active
              ? 'border-primary/40 bg-primary/10 text-primary ring-2 ring-primary/15'
              : 'border-hairline bg-surface-soft text-body group-hover:border-ink/15 group-hover:text-primary'
          )}
        >
          {image ? (
            <img
              src={image}
              alt=""
              width="56"
              height="56"
              loading="lazy"
              decoding="async"
              draggable="false"
              className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-105"
            />
          ) : (
            <Icon size={20} strokeWidth={1.7} />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <h4 className="line-clamp-2 text-[12px] font-medium leading-[1.3] tracking-[-0.01em] text-ink sm:text-[12.5px]">
            {title}
          </h4>
          <span className="mt-0.5 truncate text-[10px] text-body">{countLabel}</span>
        </div>
      </div>
      <ArrowUpRight
        size={12}
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
