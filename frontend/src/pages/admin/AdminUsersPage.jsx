import React, { useEffect, useState } from 'react';
import { Badge } from '../../components/common/Badge';
import { getAdminUsersApi } from '../../api/admin';

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminUsersApi()
      .then((response) => setUsers(Array.isArray(response?.data) ? response.data : (response || [])))
      .catch((err) => setError(err.message || 'Unable to load users.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div>
        <h1 className="workspace-title text-3xl">Admin User Management</h1>
        <p className="workspace-subtitle mt-1">Manage actual platform accounts, roles, and status.</p>
      </div>

      <div className="sh-card bg-card p-6 overflow-x-auto">
        <table className="w-full min-w-[660px] text-left border-collapse">
          <thead>
            <tr className="border-b border-border text-xs font-bold text-muted-foreground uppercase">
              <th className="pb-3">User ID</th>
              <th className="pb-3">Name</th>
              <th className="pb-3">Email</th>
              <th className="pb-3">Role</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs font-semibold text-foreground">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-muted/60 transition-colors">
                <td className="py-3.5 font-bold text-foreground">#{u.id}</td>
                <td className="py-3.5">{u.name}</td>
                <td className="py-3.5 text-muted-foreground">{u.email}</td>
                <td className="py-3.5"><Badge>{u.role}</Badge></td>
                <td className="py-3.5">
                  <Badge variant={u.isEmailVerified ? 'success' : 'neutral'}>
                    {u.isEmailVerified ? 'EMAIL VERIFIED' : 'EMAIL PENDING'}
                  </Badge>
                </td>
              </tr>
            ))}
            {loading && <tr><td colSpan="5" className="py-12 text-center text-muted-foreground">Loading users…</td></tr>}
            {!loading && (error || users.length === 0) && (
              <tr><td colSpan="5" className="py-12 text-center text-muted-foreground">{error || 'No user accounts found.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
