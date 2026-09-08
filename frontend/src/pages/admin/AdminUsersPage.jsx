import React from 'react';
import { Badge } from '../../components/common/Badge';

export const AdminUsersPage = () => {
  const users = [
    { id: 1, name: 'Arjun Mehta', email: 'arjun@example.com', role: 'CUSTOMER', status: 'ACTIVE' },
    { id: 2, name: 'CoolTech Services', email: 'contact@cooltech.com', role: 'PROVIDER', status: 'ACTIVE' },
    { id: 3, name: 'Super Admin', email: 'admin@servicehub.com', role: 'ADMIN', status: 'ACTIVE' },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin User Management</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Manage platform accounts, roles, and status.</p>
      </div>

      <div className="sh-card bg-white p-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
              <th className="pb-3">User ID</th>
              <th className="pb-3">Name</th>
              <th className="pb-3">Email</th>
              <th className="pb-3">Role</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="py-3.5 font-bold text-slate-900">#{u.id}</td>
                <td className="py-3.5">{u.name}</td>
                <td className="py-3.5 text-slate-500">{u.email}</td>
                <td className="py-3.5"><Badge>{u.role}</Badge></td>
                <td className="py-3.5"><Badge variant="success">{u.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
