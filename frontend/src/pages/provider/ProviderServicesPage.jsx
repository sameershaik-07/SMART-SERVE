import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  X,
  AlertCircle,
  TrendingUp,
  Tag,
  ToggleLeft,
  ToggleRight,
  RefreshCw
} from 'lucide-react';
import {
  getMyServicesApi,
  createServiceApi,
  updateServiceApi,
  deleteServiceApi,
} from '../../api/services';

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
  });

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
  }, []);

  const openCreateModal = () => {
    setEditingService(null);
    setFormData({
      title: '',
      description: '',
      price: '',
      durationMinutes: 60,
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
    return (
      s.title?.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q)
    );
  });

  const activeCount = services.filter((s) => s.isActive !== false).length;
  const avgPrice =
    services.length > 0
      ? Math.round(services.reduce((sum, s) => sum + (s.price || 0), 0) / services.length)
      : 0;

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Service Catalog & Pricing
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Configure your professional services, set fixed or hourly pricing, and manage availability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchServices}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
          >
            <Plus size={16} /> Add New Service
          </button>
        </div>
      </div>

      {/* Inline Feedback Banner */}
      {feedback.msg && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between animate-fade-in ${
            feedback.type === 'error'
              ? 'bg-rose-950/80 border border-rose-500/50 text-rose-300'
              : 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
          }`}
        >
          <span>{feedback.msg}</span>
          <button onClick={() => setFeedback({ type: '', msg: '' })}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Briefcase size={18} />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase">Total Offerings</div>
            <div className="text-xl font-black text-white">{services.length} Listed</div>
          </div>
        </div>

        <div className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase">Active & Bookable</div>
            <div className="text-xl font-black text-emerald-400">{activeCount} Online</div>
          </div>
        </div>

        <div className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <TrendingUp size={18} />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase">Average Service Rate</div>
            <div className="text-xl font-black text-white">₹{avgPrice}</div>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by service title or keyword..."
          className="w-full bg-slate-800/80 border border-slate-700/80 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-all"
        />
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-semibold">Loading services...</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="py-20 text-center bg-slate-800/30 border border-slate-800 rounded-3xl space-y-4">
          <Briefcase size={44} className="mx-auto text-slate-600" />
          <div>
            <h3 className="text-base font-bold text-white">No Services Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              {searchQuery
                ? `No service matches "${searchQuery}".`
                : "You haven't added any services to your catalog yet."}
            </p>
          </div>
          {!searchQuery && (
            <button
              onClick={openCreateModal}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Plus size={16} /> Add Your First Service
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((service) => {
            const isActive = service.isActive !== false;
            return (
              <div
                key={service.id}
                className={`bg-slate-800/60 border rounded-3xl p-6 flex flex-col justify-between transition-all group ${
                  isActive
                    ? 'border-slate-700/80 hover:border-slate-600'
                    : 'border-slate-800 opacity-60 bg-slate-900/60'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar: Active Badge & Price */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-700/50 text-slate-400 border-slate-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isActive ? 'bg-emerald-400' : 'bg-slate-500'
                        }`}
                      ></span>
                      {isActive ? 'Bookable' : 'Paused'}
                    </span>

                    <div className="text-lg font-black text-emerald-400">
                      ₹{service.price}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-black text-white group-hover:text-emerald-300 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                      {service.description || 'Standard professional home inspection and service.'}
                    </p>
                  </div>

                  {/* Estimated Duration */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                    <Clock size={12} className="text-indigo-400" />
                    <span>Est. Duration: {service.durationMinutes || 60} mins</span>
                  </div>
                </div>

                {/* Bottom Action Controls */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-700/60">
                  <button
                    onClick={() => handleToggleActive(service)}
                    className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {isActive ? (
                      <>
                        <ToggleRight size={18} className="text-emerald-400" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft size={18} className="text-slate-500" />
                        <span>Paused</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(service)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                      title="Edit Service"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                      title="Deactivate Service"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Service Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Briefcase size={18} className="text-emerald-400" />
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Service Title */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Service Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AC Deep Jet Cleaning & Gas Refill"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Price & Duration Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Price (₹ INR) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    placeholder="e.g. 799"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Est. Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    step="15"
                    min="15"
                    placeholder="60"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Scope of Service & Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe what is included, materials used, inspection checklist, and guarantees..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-950/40 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Saving...' : editingService ? 'Update Service' : 'Publish Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

