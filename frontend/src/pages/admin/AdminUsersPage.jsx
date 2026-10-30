import React, { useEffect, useMemo, useState } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  UserCheck,
  Mail,
  Calendar,
  AlertCircle,
  RefreshCw,
  ShieldAlert,
  Wrench,
} from 'lucide-react';
import { getAdminUsersApi } from '../../api/admin';
import { Reveal } from '@/components/motion/Reveal';
import { AnimatedNumber } from '@/components/motion/AnimatedNumber';
import { cn } from '@/lib/utils';

const roleStyles = {
  ADMIN: 'border-primary/20 bg-primary/8 text-primary',
  PROVIDER: 'border-accent-teal/20 bg-accent-teal/8 text-accent-teal',
  CUSTOMER: 'border-hairline bg-surface-soft text-body',
};

const roleIcons = {
  ADMIN: ShieldAlert,
  PROVIDER: Wrench,
  CUSTOMER: Users,
};

const avatarTones = [
  'border-primary/20 bg-primary/8 text-primary',
  'border-accent-teal/20 bg-accent-teal/8 text-accent-teal',
  'border-accent-amber/25 bg-accent-amber/8 text-accent-amber',
  'border-hairline bg-surface-soft text-body',
];

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const loadUsers = () => {
    setLoading(true);
    setError('');
    getAdminUsersApi()
      .then((response) => setUsers(Array.isArray(response?.data) ? response.data : response || []))
      .catch((err) => setError(err.message || 'Unable to load users.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const stats = useMemo(() => {
    const total = users.length;
    const providers = users.filter((u) => u.role === 'PROVIDER').length;
    const customers = users.filter((u) => u.role === 'CUSTOMER').length;
    const verified = users.filter((u) => u.isEmailVerified).length;
    return { total, providers, customers, verified };
  }, [users]);

  const roles = useMemo(() => {
    const found = new Set(users.map((u) => u.role).filter(Boolean));
    return ['ALL', ...Array.from(found)];
  }, [users]);

  const filtered = users.filter((u) => {
    const query = searchTerm.toLowerCase().trim();
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    if (!query) return matchesRole;
    return (
      matchesRole &&
      ((u.name || '').toLowerCase().includes(query) ||
        (u.email || '').toLowerCase().includes(query) ||
        String(u.id).includes(query))
    );
  });

  const metrics = [
    {
      label: 'Total accounts',
      value: stats.total,
      icon: Users,
      tone: 'border-primary/20 bg-primary/8 text-primary',
    },
    {
      label: 'Customers',
      value: stats.customers,
      icon: UserCheck,
      tone: 'border-accent-amber/25 bg-accent-amber/8 text-accent-amber',
    },
    {
      label: 'Service providers',
      value: stats.providers,
      icon: Wrench,
      tone: 'border-accent-teal/20 bg-accent-teal/8 text-accent-teal',
    },
    {
      label: 'Email verified',
      value: stats.verified,
      icon: ShieldCheck,
      tone: 'border-accent-teal/20 bg-accent-teal/8 text-accent-teal',
    },
  ];

  return (
    <div className="mx-auto max-w-[1240px] animate-fade-in space-y-6 pb-16">
      {/* Header */}
      <Reveal className="flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="sh-eyebrow">Account directory</p>
            <span className="inline-flex items-center gap-1 rounded-pill border border-hairline bg-surface-soft px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              <Users size={10} /> {stats.total} registered
            </span>
          </div>
          <h1 className="workspace-title mt-2">Users & roles</h1>
          <p className="workspace-subtitle">
            Every account on ServiceHub, with its role, verification state, and join date.
          </p>
        </div>

        <button
          onClick={loadUsers}
          className="flex items-center gap-1.5 rounded-md border border-hairline bg-canvas px-3.5 py-2 text-[11px] font-medium text-body transition-all hover:border-ink/25 hover:text-ink active:scale-[0.98]"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh directory
        </button>
      </Reveal>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/25 bg-destructive/8 px-4 py-3 text-xs font-medium text-destructive">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, tone }, index) => (
          <Reveal key={label} delay={Math.min(index * 0.04, 0.16)}>
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
                <div className="mt-1 font-display text-[1.5rem] leading-none tracking-[-0.02em] text-ink">
                  <AnimatedNumber value={value} />
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Search + role filter */}
      <Reveal delay={0.08} className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-md flex-1">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or user ID…"
            className="h-10 w-full rounded-md border border-hairline bg-canvas pl-10 pr-4 text-xs text-ink outline-hidden transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/15"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {roles.map((role) => {
            const active = roleFilter === role;
            return (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={cn(
                  'shrink-0 rounded-pill border px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.06em] transition-all',
                  active
                    ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                    : 'border-hairline bg-card text-muted-foreground hover:border-ink/20 hover:text-ink'
                )}
              >
                {role === 'ALL' ? 'All roles' : role.toLowerCase()}
              </button>
            );
          })}
        </div>
      </Reveal>

      {/* Table */}
      <Reveal delay={0.12}>
        <section className="overflow-hidden rounded-lg border border-hairline bg-card">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-display text-[1.5rem] leading-tight tracking-[-0.02em] text-ink">
                Account directory
              </h2>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {filtered.length} of {users.length} accounts shown.
              </p>
            </div>
            <span className="rounded-pill border border-hairline bg-surface-soft px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              Admin view
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-full border-collapse text-left sm:min-w-[760px]">
              <thead>
                <tr className="border-b border-hairline text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                  <th className="px-5 py-3 font-medium sm:px-6">Account</th>
                  <th className="hidden px-3 py-3 font-medium md:table-cell">Email</th>
                  <th className="px-3 py-3 font-medium">Role</th>
                  <th className="hidden px-3 py-3 font-medium sm:table-cell">Joined</th>
                  <th className="px-5 py-3 text-right font-medium sm:px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline-soft text-[11px]">
                {filtered.map((u, index) => {
                  const RoleIcon = roleIcons[u.role] || Users;
                  const initial = (u.name || 'U').charAt(0).toUpperCase();
                  const joined = u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '—';

                  return (
                    <tr key={u.id} className="transition-colors hover:bg-surface-soft/30">
                      <td className="whitespace-nowrap px-5 py-3.5 sm:px-6">
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              'flex h-9 w-9 shrink-0 items-center justify-center rounded-md border font-display text-[15px]',
                              avatarTones[index % avatarTones.length]
                            )}
                          >
                            {initial}
                          </span>
                          <div className="min-w-0">
                            <div className="truncate font-medium text-ink">
                              {u.name || 'Unnamed account'}
                            </div>
                            <div className="mt-0.5 font-mono text-[9px] text-muted-foreground">
                              #{u.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-3 py-3.5 text-muted-foreground md:table-cell">
                        <span className="flex items-center gap-1.5">
                          <Mail size={11} className="shrink-0 text-muted-foreground/70" />
                          <span className="truncate">{u.email || 'No email on file'}</span>
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-pill border px-2 py-0.5 text-[8px] font-medium uppercase tracking-[0.06em]',
                            roleStyles[u.role] || 'border-hairline bg-surface-soft text-body'
                          )}
                        >
                          <RoleIcon size={9} />
                          {u.role || 'USER'}
                        </span>
                      </td>
                      <td className="hidden whitespace-nowrap px-3 py-3.5 text-muted-foreground sm:table-cell">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={11} className="text-muted-foreground/70" />
                          {joined}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right sm:px-6">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-pill border px-2 py-0.5 text-[8px] font-medium uppercase tracking-[0.06em]',
                            u.isEmailVerified
                              ? 'border-accent-teal/20 bg-accent-teal/8 text-accent-teal'
                              : 'border-accent-amber/25 bg-accent-amber/8 text-accent-amber'
                          )}
                        >
                          {u.isEmailVerified ? (
                            <>
                              <ShieldCheck size={9} /> Verified
                            </>
                          ) : (
                            <>
                              <AlertCircle size={9} /> Pending
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-hairline bg-surface-soft text-muted-foreground">
                        <Users size={20} strokeWidth={1.7} />
                      </span>
                      <p className="mt-2.5 text-[12px] font-medium text-ink">
                        {error ? 'Directory unavailable' : 'No accounts found'}
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {searchTerm || roleFilter !== 'ALL'
                          ? 'Try a different search term or role filter.'
                          : 'Registered accounts will appear here.'}
                      </p>
                    </td>
                  </tr>
                )}

                {loading && (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <p className="mt-2 text-[10px] text-muted-foreground">Loading accounts…</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-hairline bg-surface-soft/30 px-5 py-3 sm:px-6">
            <p className="text-[10px] text-muted-foreground">
              {stats.verified} of {stats.total} accounts have verified their email.
            </p>
            <span className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
              Read-only directory
            </span>
          </div>
        </section>
      </Reveal>
    </div>
  );
};
