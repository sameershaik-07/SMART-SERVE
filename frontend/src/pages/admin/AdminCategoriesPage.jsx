import React, { useEffect, useState } from 'react';
import { Plus, LayoutGrid, AlertCircle, Tag } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { createCategoryApi, getCategoriesApi } from '../../api/admin';
import { marketplaceCategories } from '../../constants/marketplaceCategories';
import { Reveal } from '@/components/motion/Reveal';
import { cn } from '@/lib/utils';

const categoryKey = (name = '') => name.toLowerCase().replace('beauty & wellness', 'beauty').trim();

const mergeCategories = (apiCategories = []) => {
  const byName = new Map(
    apiCategories.map((category) => [categoryKey(category.categoryName), category])
  );
  const catalog = marketplaceCategories.map((category) => {
    const databaseCategory = byName.get(categoryKey(category.title));
    return {
      id: databaseCategory?.id || `catalog-${category.title}`,
      name: category.title,
      description: databaseCategory?.description || category.description,
      isCatalog: !databaseCategory,
    };
  });
  const catalogKeys = new Set(marketplaceCategories.map((category) => categoryKey(category.title)));
  const custom = apiCategories
    .filter((category) => !catalogKeys.has(categoryKey(category.categoryName)))
    .map((category) => ({
      id: category.id,
      name: category.categoryName,
      description: category.description || 'Marketplace service category',
      isCatalog: false,
    }));
  return [...catalog, ...custom];
};

const accents = [
  { tile: 'border-primary/20 bg-primary/8 text-primary', num: 'text-primary/25' },
  { tile: 'border-accent-teal/20 bg-accent-teal/8 text-accent-teal', num: 'text-accent-teal/25' },
  { tile: 'border-accent-amber/25 bg-accent-amber/8 text-accent-amber', num: 'text-accent-amber/30' },
];

export const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState(() => mergeCategories());

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await getCategoriesApi();
      const list = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      setCategories(mergeCategories(list));
      setError('');
    } catch (err) {
      setError(err.message || 'Unable to load database categories.');
      setCategories(mergeCategories());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createCategoryApi({ categoryName: name, description: desc });
      await loadCategories();
      setIsOpen(false);
      setName('');
      setDesc('');
    } catch (err) {
      setError(err.message || 'Unable to create category.');
    }
  };

  return (
    <div className="mx-auto max-w-[1240px] animate-fade-in space-y-6 pb-16">
      {/* Header */}
      <Reveal className="flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <p className="sh-eyebrow">Marketplace taxonomy</p>
          <h1 className="workspace-title mt-2">Service categories</h1>
          <p className="workspace-subtitle">
            The shelves customers browse. Core categories come from the marketplace catalogue, plus
            anything you create here.
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)} icon={Plus}>
          Add category
        </Button>
      </Reveal>

      {error && !isOpen && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/25 bg-destructive/8 px-4 py-3 text-xs font-medium text-destructive">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <Reveal delay={0.04} className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {categories.length} categories available
        </p>
        <span className="rounded-pill border border-hairline bg-surface-soft px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          Live in browse services
        </span>
      </Reveal>

      {loading && categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-[11px] text-muted-foreground">Loading categories…</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {categories.map((c, index) => {
            const accent = accents[index % accents.length];
            return (
              <Reveal key={c.id} delay={Math.min(index * 0.03, 0.2)}>
                <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-hairline bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-[var(--shadow-soft)]">
                  <span
                    className={cn(
                      'pointer-events-none absolute -right-1 -top-3 font-display text-[4.25rem] leading-none tracking-[-0.05em]',
                      accent.num
                    )}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <div className="relative flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-md border',
                        accent.tile
                      )}
                    >
                      <Tag size={15} strokeWidth={1.8} />
                    </span>
                    <span className="rounded-pill border border-hairline bg-surface-soft px-2 py-0.5 text-[8px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
                      {c.isCatalog ? 'Core catalogue' : 'Custom'}
                    </span>
                  </div>

                  <h2 className="relative mt-5 font-display text-[1.4rem] leading-tight tracking-[-0.02em] text-ink transition-colors group-hover:text-primary">
                    {c.name}
                  </h2>
                  <p className="relative mt-1.5 line-clamp-3 text-[11px] leading-relaxed text-muted-foreground">
                    {c.description}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>
      )}

      <Reveal delay={0.12}>
        <div className="flex items-center gap-3 rounded-lg border border-dashed border-hairline px-5 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-hairline bg-surface-soft text-muted-foreground">
            <LayoutGrid size={15} strokeWidth={1.8} />
          </span>
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            New categories become available to customers immediately after creation. Existing core
            categories can’t be removed.
          </p>
        </div>
      </Reveal>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create new category"
        description="Add a new shelf to the marketplace. Customers will see it when browsing services."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/25 bg-destructive/8 p-3 text-[11px] font-medium text-destructive">
              <AlertCircle size={13} className="shrink-0" />
              {error}
            </div>
          )}

          <Input
            label="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            icon={Tag}
            placeholder="e.g. Appliance repair"
          />

          <div>
            <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Description
            </label>
            <textarea
              rows={4}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="A short description of the services customers will find here…"
              className="w-full rounded-md border border-input bg-canvas p-3.5 text-xs leading-relaxed text-ink outline-hidden transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/15"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-hairline pt-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md px-3 py-2 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-surface-soft hover:text-ink"
            >
              Cancel
            </button>
            <Button type="submit">Save category</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
