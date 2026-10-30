import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Calendar,
  IndianRupee,
  BarChart3,
  AlertCircle,
  ArrowUpRight,
  Sparkles,
  Receipt,
} from 'lucide-react';
import { getAdminAnalyticsTrendsApi } from '../../api/admin';
import { Reveal } from '@/components/motion/Reveal';
import { AnimatedNumber } from '@/components/motion/AnimatedNumber';
import { cn } from '@/lib/utils';

const tooltipStyle = {
  background: 'var(--sh-popover)',
  border: '1px solid var(--sh-hairline)',
  borderRadius: 8,
  fontSize: 11,
  color: 'var(--sh-popover-foreground)',
  boxShadow: '0 12px 32px rgba(20, 20, 19, 0.12)',
  padding: '10px 12px',
};

const metricTones = {
  coral: 'border-primary/20 bg-primary/8 text-primary',
  teal: 'border-accent-teal/20 bg-accent-teal/8 text-accent-teal',
  amber: 'border-accent-amber/25 bg-accent-amber/8 text-accent-amber',
  neutral: 'border-hairline bg-surface-soft text-body',
};

export const AdminAnalyticsPage = () => {
  const [trends, setTrends] = useState({ series: [], totalBookings: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminAnalyticsTrendsApi(7)
      .then((response) =>
        setTrends(response?.data || response || { series: [], totalBookings: 0, totalRevenue: 0 })
      )
      .catch((err) => setError(err.message || 'Unable to load analytics.'))
      .finally(() => setLoading(false));
  }, []);

  const chartData = trends.series || [];
  const hasActivity = chartData.some((item) => item.bookings > 0 || item.revenue > 0);

  const totalBookings = Number(trends.totalBookings) || 0;
  const totalRevenue = Number(trends.totalRevenue) || 0;
  const avgTicket = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;
  const peakDay = chartData.reduce(
    (best, item) => (Number(item.revenue) > Number(best.revenue) ? item : best),
    { day: '—', revenue: 0, bookings: 0 }
  );

  const metrics = [
    {
      label: 'Bookings · 7 days',
      icon: Calendar,
      tone: 'coral',
      value: totalBookings,
      note: 'All service requests received this week.',
    },
    {
      label: 'Successful revenue',
      icon: IndianRupee,
      tone: 'teal',
      value: totalRevenue,
      prefix: '₹',
      note: 'Captured from successful payments only.',
    },
    {
      label: 'Average ticket',
      icon: Receipt,
      tone: 'amber',
      value: avgTicket,
      prefix: '₹',
      note: 'Mean value of a settled booking.',
    },
    {
      label: 'Peak revenue day',
      icon: TrendingUp,
      tone: 'neutral',
      value: peakDay.day || '—',
      isText: true,
      note: `₹${Number(peakDay.revenue || 0).toLocaleString('en-IN')} on the strongest day.`,
    },
  ];

  const dateLabel = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="mx-auto max-w-[1240px] animate-fade-in space-y-6 pb-16">
      {/* Header */}
      <Reveal className="flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="sh-eyebrow">Platform intelligence</p>
            <span className="inline-flex items-center gap-1.5 rounded-pill border border-hairline bg-surface-soft px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              <span className="h-1 w-1 animate-pulse rounded-full bg-accent-teal" /> Live data
            </span>
          </div>
          <h1 className="workspace-title mt-2">Analytics & reports</h1>
          <p className="workspace-subtitle">
            Booking volume and successful-payment performance across the last seven days.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-md border border-hairline bg-canvas px-3 py-2 text-[10px] font-medium text-muted-foreground">
            <Calendar size={12} /> {dateLabel}
          </span>
          <span className="flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/6 px-3 py-2 text-[10px] font-medium text-primary">
            <BarChart3 size={12} /> Rolling 7 days
          </span>
        </div>
      </Reveal>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/25 bg-destructive/8 px-4 py-3 text-xs font-medium text-destructive">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, icon: Icon, tone, value, prefix, note, isText }, index) => (
          <Reveal key={label} delay={Math.min(index * 0.05, 0.2)}>
            <div className="h-full rounded-lg border border-hairline bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-[var(--shadow-soft)]">
              <div className="flex items-start justify-between gap-3">
                <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  {label}
                </span>
                <span
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-md border',
                    metricTones[tone]
                  )}
                >
                  <Icon size={16} strokeWidth={1.8} />
                </span>
              </div>
              <div className="mt-5 font-display text-[2.1rem] leading-none tracking-[-0.035em] text-ink">
                {isText ? (
                  value
                ) : (
                  <>
                    {prefix}
                    <AnimatedNumber value={value} />
                  </>
                )}
              </div>
              <p className="mt-2.5 text-[10px] leading-relaxed text-muted-foreground">{note}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Chart */}
      <Reveal delay={0.1}>
        <section className="overflow-hidden rounded-lg border border-hairline bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-display text-[1.5rem] leading-tight tracking-[-0.02em] text-ink">
                Revenue & booking trends
              </h2>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                Revenue is counted only when a payment succeeds.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-4 rounded-pill bg-primary" /> Revenue
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-4 rounded-pill bg-accent-teal" /> Bookings
              </span>
            </div>
          </div>

          <div className="h-[320px] w-full px-3 py-5 sm:px-5">
            {loading ? (
              <div className="grid h-full place-items-center gap-3">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <p className="text-[11px] text-muted-foreground">Loading analytics…</p>
                </div>
              </div>
            ) : !hasActivity ? (
              <div className="grid h-full place-items-center text-center">
                <div className="max-w-sm">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-hairline bg-surface-soft text-muted-foreground">
                    <BarChart3 size={22} strokeWidth={1.7} />
                  </span>
                  <h3 className="mt-3 text-[13px] font-medium text-ink">No activity this week</h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    No bookings or successful payments were recorded in the last seven days. Data
                    will populate here as soon as the platform sees traffic.
                  </p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="shRevenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--sh-primary)" stopOpacity={0.26} />
                      <stop offset="100%" stopColor="var(--sh-primary)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="shBookingsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--sh-teal)" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="var(--sh-teal)" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 5"
                    vertical={false}
                    stroke="var(--sh-hairline)"
                  />
                  <XAxis
                    dataKey="day"
                    stroke="var(--sh-muted-foreground)"
                    tickLine={false}
                    axisLine={false}
                    fontSize={10}
                    tickMargin={10}
                  />
                  <YAxis
                    yAxisId="revenue"
                    stroke="var(--sh-muted-foreground)"
                    tickLine={false}
                    axisLine={false}
                    fontSize={10}
                    width={54}
                    tickFormatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
                  />
                  <YAxis
                    yAxisId="bookings"
                    orientation="right"
                    stroke="var(--sh-muted-foreground)"
                    tickLine={false}
                    axisLine={false}
                    fontSize={10}
                    width={32}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={{
                      color: 'var(--sh-muted-foreground)',
                      fontSize: 10,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: 4,
                    }}
                    itemStyle={{ fontSize: 11 }}
                    cursor={{ stroke: 'var(--sh-hairline)', strokeWidth: 1 }}
                    formatter={(value, name) => [
                      name === 'revenue'
                        ? `₹${Number(value).toLocaleString('en-IN')}`
                        : Number(value),
                      name === 'revenue' ? 'Revenue' : 'Bookings',
                    ]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={28}
                    iconType="circle"
                    iconSize={7}
                    formatter={(value) => (
                      <span style={{ color: 'var(--sh-muted-foreground)', fontSize: 10 }}>
                        {value === 'revenue' ? 'Revenue' : 'Bookings'}
                      </span>
                    )}
                  />
                  <Area
                    yAxisId="revenue"
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--sh-primary)"
                    strokeWidth={2.4}
                    fillOpacity={1}
                    fill="url(#shRevenueFill)"
                    activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--sh-card)' }}
                  />
                  <Area
                    yAxisId="bookings"
                    type="monotone"
                    dataKey="bookings"
                    stroke="var(--sh-teal)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#shBookingsFill)"
                    activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--sh-card)' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-hairline bg-surface-soft/30 px-5 py-3 sm:px-6">
            <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Sparkles size={11} className="text-primary" />
              Revenue includes successful payments only — pending and refunded amounts are excluded.
            </p>
            <span className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
              7-day window
            </span>
          </div>
        </section>
      </Reveal>

      {/* Daily breakdown */}
      <Reveal delay={0.16}>
        <section className="overflow-hidden rounded-lg border border-hairline bg-card">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-display text-[1.4rem] leading-tight tracking-[-0.02em] text-ink">
                Daily breakdown
              </h2>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                Day-by-day totals behind the chart.
              </p>
            </div>
            <span className="rounded-pill border border-hairline bg-surface-soft px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              {chartData.length} days
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-hairline text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                  <th className="px-4 py-3 font-medium sm:px-6">Day</th>
                  <th className="px-3 py-3 text-right font-medium">Bookings</th>
                  <th className="px-3 py-3 text-right font-medium">Revenue</th>
                  <th className="hidden px-5 py-3 text-right font-medium sm:table-cell sm:px-6">Share of week</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline-soft text-[11px]">
                {chartData.map((item) => {
                  const share =
                    totalRevenue > 0 ? Math.round((Number(item.revenue) / totalRevenue) * 100) : 0;
                  return (
                    <tr key={item.day} className="transition-colors hover:bg-surface-soft/30">
                      <td className="whitespace-nowrap px-4 py-3.5 font-medium text-ink sm:px-6">
                        {item.day}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-right tabular-nums text-body">
                        {Number(item.bookings) || 0}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-right tabular-nums font-medium text-ink">
                        ₹{Number(item.revenue || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="hidden whitespace-nowrap px-5 py-3.5 sm:table-cell sm:px-6">
                        <div className="ml-auto flex w-32 items-center gap-2">
                          <div className="h-1 w-full overflow-hidden rounded-pill bg-surface-soft">
                            <div
                              className="h-full rounded-pill bg-primary/70"
                              style={{ width: `${Math.min(share, 100)}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-[9px] tabular-nums text-muted-foreground">
                            {share}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {!loading && chartData.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <p className="text-[12px] font-medium text-ink">No daily data yet</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        Daily records will appear once bookings start coming in.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </Reveal>

      {/* Footnote CTA */}
      <Reveal delay={0.2}>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-hairline px-5 py-4">
          <p className="flex items-center gap-2 text-[10px] leading-relaxed text-muted-foreground">
            <ArrowUpRight size={13} className="shrink-0 text-primary" />
            Week-over-week comparisons will appear once a second full week of data is available.
          </p>
          <span className="rounded-pill border border-hairline bg-surface-soft px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            Read-only report
          </span>
        </div>
      </Reveal>
    </div>
  );
};
