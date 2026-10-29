import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Search,
  X,
  AlertCircle,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import {
  getMyServicesApi,
  createServiceApi,
  updateServiceApi,
  deleteServiceApi,
} from '../../api/services';
import { getCategoriesApi } from '../../api/admin';
import { marketplaceCategories } from '../../constants/marketplaceCategories';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Reveal } from '@/components/motion/Reveal';
import { AnimatedNumber } from '@/components/motion/AnimatedNumber';
import { cn } from '@/lib/utils';

const fieldClass =
  'h-10 w-full rounded-md border border-input bg-canvas px-3.5 text-xs text-ink outline-hidden transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/15';

const labelClass =
  'mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground';

export const ProviderServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    durationMinutes: 60,
    categoryId: '',
  });
  const [categories, setCategories] = useState([]);
  const allowedCategoryNames = marketplaceCategories.map((category) => category.title);
  const visibleCategories = categories.filter((category) =>
    allowedCategoryNames.includes(category.categoryName)
  );

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await getMyServicesApi();
      const list = Array.isArray(res) ? res : res.services || [];
      setServices(list);
    } catch (err) {
      console.warn('Could not load services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    // load categories for provider to choose from
    (async () => {
      try {
        const cats = await getCategoriesApi();
        setCategories(Array.isArray(cats) ? cats : []);
      } catch (err) {
        // fallback: do nothing, categories may be empty
      }
    })();
  }, []);

  const openCreateModal = () => {
    setEditingService(null);
    setFormData({
      title: '',
      description: '',
      price: '',
      durationMinutes: 60,
      categoryId: '',
    });
    setFeedback({ type: '', msg: '' });
    setModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setFormData({
      title: service.title || '',
      description: service.description || '',
      price: service.price || '',
      durationMinutes: service.durationMinutes || 60,
      categoryId: service.categoryId || '',
    });
    setFeedback({ type: '', msg: '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price) {
      setFeedback({ type: 'error', msg: 'Title and Price are required.' });
      return;
    }

    try {
      setSubmitting(true);
      setFeedback({ type: '', msg: '' });

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        durationMinutes: parseInt(formData.durationMinutes) || 60,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
      };

      if (editingService) {
        await updateServiceApi(editingService.id, payload);
        setServices((prev) =>
          prev.map((s) => (s.id === editingService.id ? { ...s, ...payload } : s))
        );
        setFeedback({ type: 'success', msg: 'Service updated successfully!' });
      } else {
        const created = await createServiceApi(payload);
        const newService = created.service || created;
        setServices((prev) => [newService, ...prev]);
        setFeedback({ type: 'success', msg: 'New service created and published!' });
      }

      setModalOpen(false);
      setTimeout(() => setFeedback({ type: '', msg: '' }), 4000);
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message || 'Failed to save service.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (service) => {
    try {
      const nextActive = !service.isActive;
      await updateServiceApi(service.id, { isActive: nextActive });
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, isActive: nextActive } : s))
      );
      setFeedback({
        type: 'success',
        msg: `"${service.title}" is now ${nextActive ? 'Active' : 'Paused'}.`,
      });
      setTimeout(() => setFeedback({ type: '', msg: '' }), 3000);
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Failed to change service status.' });
    }
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Are you sure you want to deactivate this service?')) return;
    try {
      await deleteServiceApi(serviceId);
      setServices((prev) =>
        prev.map((s) => (s.id === serviceId ? { ...s, isActive: false } : s))
      );
      setFeedback({ type: 'success', msg: 'Service deactivated successfully.' });
      setTimeout(() => setFeedback({ type: '', msg: '' }), 3000);
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message || 'Failed to remove service.' });
    }
  };

  const filteredServices = services.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return s.title?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q);
  });

  const activeCount = services.filter((s) => s.isActive !== false).length;
  const avgPrice =
    services.length > 0
      ? Math.round(services.reduce((sum, s) => sum + (s.price || 0), 0) / services.length)
      : 0;

  return (
    <div className="mx-auto max-w-[1240px] animate-fade-in space-y-6 pb-16">
      {/* Header */}
      <Reveal className="flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <p className="sh-eyebrow">Your catalogue</p>
          <h1 className="workspace-title mt-2">Services & pricing</h1>
          <p className="workspace-subtitle">
            Shape what you offer, set clear prices, and pause anything that isn’t available.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchServices}
            title="Refresh services"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-hairline bg-canvas text-muted-foreground transition-all hover:border-ink/25 hover:text-ink active:scale-[0.98]"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[11px] font-medium text-primary-foreground transition-all hover:bg-primary-active active:scale-[0.98]"
          >
            <Plus size={13} /> Add new service
          </button>
        </div>
      </Reveal>

      {/* Feedback */}
      {feedback.msg && (
        <div
          className={cn(
            'flex animate-fade-in items-center justify-between gap-3 rounded-md border px-4 py-3 text-xs font-medium',
            feedback.type === 'error'
              ? 'border-destructive/25 bg-destructive/8 text-destructive'
              : 'border-accent-teal/25 bg-accent-teal/8 text-accent-teal'
          )}
        >
          <span className="flex items-center gap-2">
            {feedback.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
            {feedback.msg}
          </span>
          <button
            onClick={() => setFeedback({ type: '', msg: '' })}
            className="transition-opacity hover:opacity-70"
            aria-label="Dismiss message"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            label: 'Total offerings',
            value: services.length,
            suffix: 'listed',
            icon: Briefcase,
            tone: 'border-primary/20 bg-primary/8 text-primary',
          },
          {
            label: 'Active & bookable',
            value: activeCount,
            suffix: 'online',
            icon: CheckCircle2,
            tone: 'border-accent-teal/20 bg-accent-teal/8 text-accent-teal',
          },
          {
            label: 'Average service rate',
            value: avgPrice,
            prefix: '₹',
            icon: TrendingUp,
            tone: 'border-accent-amber/25 bg-accent-amber/8 text-accent-amber',
          },
        ].map(({ label, value, suffix, prefix, icon: Icon, tone }, index) => (
          <Reveal key={label} delay={0.04 + Math.min(index * 0.04, 0.1)}>
            <div className="flex h-full items-center gap-3.5 rounded-lg border border-hairline bg-card p-4">
              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-md border',
                  tone
                )}
              >
                <Icon size={17} strokeWidth={1.8} />
              </span>
              <div>
                <div className="text-[9px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {label}
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="font-display text-[1.5rem] leading-none tracking-[-0.02em] text-ink">
                    {prefix}
                    <AnimatedNumber value={value} />
                  </span>
                  {suffix && (
                    <span className="text-[10px] text-muted-foreground">{suffix}</span>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Search */}
      <Reveal delay={0.08} className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-md flex-1">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by service title or keyword…"
            className="h-10 w-full rounded-md border border-hairline bg-canvas pl-10 pr-4 text-xs text-ink outline-hidden transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/15"
          />
        </div>
        <span className="rounded-pill border border-hairline bg-surface-soft px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          {filteredServices.length} of {services.length} services
        </span>
      </Reveal>

      {/* Services grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-[11px] text-muted-foreground">Loading services…</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="rounded-lg border border-dashed border-hairline bg-card/50 px-6 py-16 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-hairline bg-surface-soft text-muted-foreground">
            <Briefcase size={22} strokeWidth={1.7} />
          </span>
          <h3 className="mt-3 text-[13px] font-medium text-ink">No services found</h3>
          <p className="mx-auto mt-1 max-w-sm text-[11px] leading-relaxed text-muted-foreground">
            {searchQuery
              ? `No service matches “${searchQuery}”.`
              : 'You haven’t added any services to your catalogue yet.'}
          </p>
          {!searchQuery && (
            <button
              onClick={openCreateModal}
              className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[11px] font-medium text-primary-foreground transition-all hover:bg-primary-active active:scale-[0.98]"
            >
              <Plus size={13} /> Add your first service
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service, index) => {
            const isActive = service.isActive !== false;
            return (
              <Reveal key={service.id} delay={Math.min(index * 0.03, 0.15)}>
                <article
                  className={cn(
                    'group flex h-full flex-col overflow-hidden rounded-lg border border-hairline bg-card transition-all duration-300 hover:border-ink/15 hover:shadow-[var(--shadow-soft)]',
                    !isActive && 'bg-card/60'
                  )}
                >
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-pill border px-2 py-0.5 text-[8px] font-medium uppercase tracking-[0.08em]',
                          isActive
                            ? 'border-accent-teal/20 bg-accent-teal/8 text-accent-teal'
                            : 'border-hairline bg-surface-soft text-muted-foreground'
                        )}
                      >
                        <span
                          className={cn(
                            'h-1 w-1 rounded-full',
                            isActive ? 'bg-accent-teal' : 'bg-muted-foreground'
                          )}
                        />
                        {isActive ? 'Bookable' : 'Paused'}
                      </span>

                      <div className="text-right">
                        <div className="font-display text-[1.7rem] leading-none tracking-[-0.03em] text-ink">
                          ₹<AnimatedNumber value={Number(service.price) || 0} />
                        </div>
                        <span className="text-[8px] uppercase tracking-[0.1em] text-muted-foreground">
                          Fixed rate
                        </span>
                      </div>
                    </div>

                    <h3 className="mt-4 font-display text-[1.4rem] leading-tight tracking-[-0.02em] text-ink transition-colors group-hover:text-primary">
                      {service.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-3 text-[11px] leading-relaxed text-muted-foreground">
                      {service.description || 'Standard professional home inspection and service.'}
                    </p>

                    <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Clock size={11} className="text-accent-teal" />
                      <span>Estimated duration · {service.durationMinutes || 60} mins</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-hairline-soft bg-surface-soft/30 px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(service)}
                      className="flex items-center gap-2 text-[10px] font-medium text-body transition-colors hover:text-ink"
                      title={isActive ? 'Pause service' : 'Activate service'}
                    >
                      <span
                        className={cn(
                          'relative h-4 w-7 rounded-full transition-colors duration-300',
                          isActive ? 'bg-accent-teal' : 'bg-surface-cream-strong'
                        )}
                      >
                        <span
                          className={cn(
                            'absolute top-0.5 block h-3 w-3 rounded-full bg-canvas shadow-xs transition-transform duration-300',
                            isActive ? 'translate-x-3.5' : 'translate-x-0.5'
                          )}
                        />
                      </span>
                      {isActive ? 'Active' : 'Paused'}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(service)}
                        className="rounded-sm p-1.5 text-muted-foreground transition-colors hover:bg-canvas hover:text-ink"
                        title="Edit service"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="rounded-sm p-1.5 text-muted-foreground transition-colors hover:bg-destructive/8 hover:text-destructive"
                        title="Deactivate service"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      )}

      {/* Create / edit modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingService ? 'Edit service' : 'Add a new service'}
        description={
          editingService
            ? 'Update the details customers see when browsing your catalogue.'
            : 'Publish a new offering with clear scope and pricing.'
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {feedback.msg && feedback.type === 'error' && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/25 bg-destructive/8 p-3 text-[11px] font-medium text-destructive">
              <AlertCircle size={13} className="shrink-0" />
              {feedback.msg}
            </div>
          )}

          <Input
            label="Service title *"
            required
            placeholder="e.g. AC deep jet cleaning & gas refill"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            icon={Briefcase}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (₹ INR) *"
              type="number"
              step="1"
              min="1"
              required
              placeholder="e.g. 799"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
            <Input
              label="Duration (minutes)"
              type="number"
              step="15"
              min="15"
              placeholder="60"
              value={formData.durationMinutes}
              onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
              icon={Clock}
            />
          </div>

          <div>
            <label className={labelClass}>Scope of service & description</label>
            <textarea
              rows={4}
              placeholder="Describe what’s included, materials used, inspection checklist, and guarantees…"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-md border border-input bg-canvas p-3.5 text-xs leading-relaxed text-ink outline-hidden transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/15"
            />
          </div>

          <div>
            <label className={labelClass}>Category *</label>
            <select
              required
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className={cn(fieldClass, 'cursor-pointer')}
            >
              <option value="">Select category</option>
              {visibleCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-hairline pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-md px-3 py-2 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-surface-soft hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[11px] font-medium text-primary-foreground transition-all hover:bg-primary-active active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              {submitting ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : null}
              {submitting ? 'Saving…' : editingService ? 'Update service' : 'Publish service'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
