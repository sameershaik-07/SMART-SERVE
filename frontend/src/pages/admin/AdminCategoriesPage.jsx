import React, { useState } from 'react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { createCategoryApi } from '../../api/admin';

export const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([
    { id: 1, name: 'Home Services', description: 'Deep cleaning, plumbing, painting & home maintenance' },
    { id: 2, name: 'Repairs', description: 'AC, refrigerator, washing machine & appliance repair' },
    { id: 3, name: 'Beauty & Wellness', description: 'Salon at home, spa massage & grooming' },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createCategoryApi({ categoryName: name, description: desc });
    } catch (e) {
      console.warn('API fallback:', e);
    }
    setCategories([...categories, { id: Date.now(), name, description: desc }]);
    setIsOpen(false);
    setName('');
    setDesc('');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Service Categories</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage marketplace service categories.</p>
        </div>
        <Button onClick={() => setIsOpen(true)}>Add Category</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((c) => (
          <div key={c.id} className="sh-card p-5 bg-white space-y-2">
            <h3 className="font-bold text-base text-slate-900">{c.name}</h3>
            <p className="text-xs text-slate-500">{c.description}</p>
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
