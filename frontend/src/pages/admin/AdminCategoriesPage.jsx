import React, { useEffect, useState } from 'react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { createCategoryApi, getCategoriesApi } from '../../api/admin';
import { marketplaceCategories } from '../../constants/marketplaceCategories';

const categoryKey = (name = '') => name.toLowerCase().replace('beauty & wellness', 'beauty').trim();

const mergeCategories = (apiCategories = []) => {
  const byName = new Map(apiCategories.map((category) => [categoryKey(category.categoryName), category]));
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
    .map((category) => ({ id: category.id, name: category.categoryName, description: category.description || 'Marketplace service category', isCatalog: false }));
  return [...catalog, ...custom];
};

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
      const list = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
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
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="workspace-title text-3xl">Service Categories</h1>
          <p className="workspace-subtitle mt-1">Customer Browse Services categories and any categories created for the marketplace.</p>
        </div>
        <Button onClick={() => setIsOpen(true)}>Add Category</Button>
      </div>

      {error && <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm font-medium text-destructive">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading && <p className="col-span-full py-8 text-center text-sm font-medium text-muted-foreground">Loading categories…</p>}
        {categories.map((c) => (
          <div key={c.id} className="sh-card p-5 bg-card space-y-2">
            <h3 className="font-bold text-base text-foreground">{c.name}</h3>
            <p className="text-xs text-muted-foreground">{c.description}</p>
          </div>
        ))}
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create New Category">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Category Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Description" value={desc} onChange={(e) => setDesc(e.target.value)} required />
          <Button type="submit" fullWidth>Save Category</Button>
        </form>
      </Modal>
    </div>
  );
};
