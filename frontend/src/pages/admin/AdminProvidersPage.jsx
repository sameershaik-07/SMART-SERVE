import React, { useEffect, useState } from 'react';
import { Button } from '../../components/common/Button';
import { getAdminProvidersApi, verifyProviderApi, rejectProviderApi } from '../../api/admin';

export const AdminProvidersPage = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    getAdminProvidersApi()
      .then((response) => setProviders(Array.isArray(response?.data) ? response.data : (response || [])))
      .catch((err) => setError(err.message || 'Unable to load providers.'))
      .finally(() => setLoading(false));
  }, []);

  const handleVerify = async (id) => {
    setUpdatingId(id);
    try {
      await verifyProviderApi(id);
      setProviders((prev) => prev.map((p) => (p.id === id ? { ...p, verified: true } : p)));
    } catch (e) {
      setError(e.message || 'Unable to verify this provider.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReject = async (id) => {
    setUpdatingId(id);
    try {
      await rejectProviderApi(id);
      setProviders((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      setError(e.message || 'Unable to reject this provider.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div>
        <h1 className="workspace-title text-3xl">Provider Verification Queue</h1>
        <p className="workspace-subtitle mt-1">Review real service provider accounts and verify pending applications.</p>
      </div>

      <div className="sh-card bg-card p-6 space-y-3">
        {loading && <p className="py-8 text-center text-sm font-medium text-muted-foreground">Loading providers…</p>}
        {!loading && error && <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm font-medium text-destructive">{error}</p>}
        {!loading && !error && providers.length === 0 && (
          <p className="py-8 text-center text-sm font-medium text-muted-foreground">No provider accounts have been created yet.</p>
        )}
        {providers.map((p) => {
          const status = p.verified ? 'VERIFIED' : 'PENDING';
          const joined = p.user?.createdAt ? new Date(p.user.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown date';
          return (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-4 p-4 bg-muted rounded-xl border border-border">
            <div className="min-w-0">
              <h4 className="font-bold text-sm text-foreground truncate">{p.user?.name || 'Unnamed provider'}</h4>
              <span className="text-xs text-muted-foreground">{p.category?.categoryName || 'Uncategorized'} • Joined {joined}</span>
              <p className="mt-1 text-[11px] text-muted-foreground">{p.services?.length || 0} service{p.services?.length === 1 ? '' : 's'} listed</p>
            </div>

            <div className="flex items-center gap-2">
              {status === 'PENDING' ? (
                <>
                  <Button size="sm" disabled={updatingId === p.id} onClick={() => handleVerify(p.id)}>
                    {updatingId === p.id ? 'Saving…' : 'Verify'}
                  </Button>
                  <Button size="sm" variant="danger" disabled={updatingId === p.id} onClick={() => handleReject(p.id)}>Reject</Button>
                </>
              ) : (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  {status}
                </span>
              )}
            </div>
          </div>
        )})}
      </div>
    </div>
  );
};
