import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Shield,
  ShieldAlert,
  Search,
  User,
  Wrench,
  Send,
  X,
  FileText,
  RefreshCw,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
import {
  getAdminChatConversationsApi,
  getAdminChatMessagesApi,
  sendAdminChatMessageApi,
  getAdminChatStatsApi,
} from '../../api/admin';
import { Reveal } from '@/components/motion/Reveal';
import { AnimatedNumber } from '@/components/motion/AnimatedNumber';
import { cn } from '@/lib/utils';

const templates = [
  {
    label: 'Verify arrival',
    text: 'Notice: ServiceHub Dispute Support has reviewed this booking. Technician arrival has been verified.',
  },
  {
    label: 'Warranty re-work',
    text: 'Dispute Ruling: Customer service guarantee has been approved. Warranty re-work scheduled at zero cost.',
  },
];

export const AdminChatAuditPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({ totalConversations: 0, totalMessages: 0, activeChats: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  // Load conversations and stats
  const fetchAuditData = async () => {
    try {
      setLoadingList(true);
      const [convRes, statsRes] = await Promise.allSettled([
        getAdminChatConversationsApi(),
        getAdminChatStatsApi(),
      ]);

      if (convRes.status === 'fulfilled' && convRes.value) {
        const list = Array.isArray(convRes.value)
          ? convRes.value
          : convRes.value.conversations || [];
        setConversations(list);
        if (list.length > 0 && !selectedConv) {
          selectConversation(list[0]);
        }
        if (list.length === 0) setSelectedConv(null);
      } else if (convRes.status === 'rejected') {
        setFeedback({
          type: 'error',
          msg: convRes.reason?.message || 'Unable to load chat conversations.',
        });
      }

      if (statsRes.status === 'fulfilled' && statsRes.value) {
        setStats(statsRes.value.data || statsRes.value);
      }
    } catch (err) {
      console.warn('Could not load chat audit data:', err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, []);

  const selectConversation = async (conv) => {
    setSelectedConv(conv);
    try {
      setLoadingMessages(true);
      const res = await getAdminChatMessagesApi(conv.id);
      const list = Array.isArray(res) ? res : res.messages || [];
      setMessages(list);
    } catch (err) {
      console.warn('Could not load messages for conversation:', err);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendAdminNotice = async (e) => {
    e.preventDefault();
    if (!adminReplyText.trim() || !selectedConv) return;

    try {
      setSendingReply(true);
      setFeedback({ type: '', msg: '' });

      const res = await sendAdminChatMessageApi(selectedConv.id, {
        message: adminReplyText.trim(),
      });

      const newMsg = res.data || {
        id: Date.now(),
        senderRole: 'ADMIN',
        message: adminReplyText.trim(),
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newMsg]);
      setAdminReplyText('');
      setFeedback({
        type: 'success',
        msg: 'Official moderation message posted to conversation.',
      });
      setTimeout(() => setFeedback({ type: '', msg: '' }), 4000);
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err.message || 'Failed to send moderator message.',
      });
    } finally {
      setSendingReply(false);
    }
  };

  const applyTemplate = (template) => {
    setAdminReplyText(template);
  };

  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const cust = (c.customer?.name || c.customer?.user?.name || '').toLowerCase();
    const prov = (c.provider?.name || c.provider?.user?.name || '').toLowerCase();
    const svc = c.booking?.service?.title?.toLowerCase() || '';
    const id = String(c.bookingId || c.id);
    return cust.includes(q) || prov.includes(q) || svc.includes(q) || id.includes(q);
  });

  const metrics = [
    {
      label: 'Active channels',
      icon: MessageSquare,
      tone: 'border-primary/20 bg-primary/8 text-primary',
      value: (
        <span className="flex items-baseline gap-1.5">
          <AnimatedNumber value={stats.totalConversations ?? conversations.length} />
          <span className="font-sans text-[10px] font-normal text-muted-foreground">channels</span>
        </span>
      ),
      note: 'Customer ↔ provider threads under audit.',
    },
    {
      label: 'Messages today',
      icon: FileText,
      tone: 'border-accent-amber/25 bg-accent-amber/8 text-accent-amber',
      value: (
        <span className="flex items-baseline gap-1.5">
          <AnimatedNumber value={stats.messagesToday ?? 0} />
          <span className="font-sans text-[10px] font-normal text-muted-foreground">today</span>
        </span>
      ),
      note: 'Transcript entries recorded since midnight.',
    },
    {
      label: 'Moderator status',
      icon: CheckCircle2,
      tone: 'border-accent-teal/20 bg-accent-teal/8 text-accent-teal',
      value: <span className="text-[1.35rem]">Encrypted / Active</span>,
      note: 'Escrow-protected channels with full audit trail.',
    },
  ];

  return (
    <div className="mx-auto max-w-[1240px] animate-fade-in space-y-6 pb-16 font-sans">
      {/* Header */}
      <Reveal className="flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="sh-eyebrow">Safety & compliance audit</p>
            <span className="inline-flex items-center gap-1 rounded-pill border border-primary/20 bg-primary/6 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em] text-primary">
              <Shield size={10} /> Live message audit
            </span>
          </div>
          <h1 className="workspace-title mt-2">Chat moderation & dispute audit</h1>
          <p className="workspace-subtitle">
            Inspect customer-to-provider communications, mediate active disputes, and issue
            official resolution notices.
          </p>
        </div>

        <button
          onClick={fetchAuditData}
          title="Refresh audit logs"
          className="flex items-center gap-1.5 rounded-md border border-hairline bg-canvas px-3.5 py-2 text-[11px] font-medium text-body transition-all hover:border-ink/25 hover:text-ink active:scale-[0.98]"
        >
          <RefreshCw size={13} className={loadingList ? 'animate-spin' : ''} /> Refresh audit
        </button>
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
            {feedback.type === 'error' ? <ShieldAlert size={14} /> : <CheckCircle2 size={14} />}
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
        {metrics.map(({ label, icon: Icon, tone, value, note }, index) => (
          <Reveal key={label} delay={Math.min(index * 0.04, 0.12)}>
            <div className="flex h-full items-start gap-3.5 rounded-lg border border-hairline bg-card p-4">
              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-md border',
                  tone
                )}
              >
                <Icon size={17} strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <div className="text-[9px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {label}
                </div>
                <div className="mt-1 font-display text-[1.5rem] leading-none tracking-[-0.02em] text-ink">
                  {value}
                </div>
                <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">{note}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Two-pane audit console */}
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
        {/* Conversations browser */}
        <Reveal delay={0.06} className="lg:col-span-5">
          <section className="overflow-hidden rounded-lg border border-hairline bg-card">
            <div className="border-b border-hairline px-5 py-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-[1.35rem] leading-tight tracking-[-0.02em] text-ink">
                  Conversations
                </h2>
                <span className="rounded-pill border border-hairline bg-surface-soft px-2 py-0.5 text-[8px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
                  {filteredConversations.length} threads
                </span>
              </div>

              <div className="relative mt-3">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by customer, pro, or booking ID…"
                  className="h-10 w-full rounded-md border border-hairline bg-canvas pl-10 pr-3 text-xs text-ink outline-hidden transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/15"
                />
              </div>
            </div>

            {loadingList ? (
              <div className="flex flex-col items-center justify-center gap-3 py-24">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-[11px] text-muted-foreground">Loading audit threads…</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-hairline bg-surface-soft text-muted-foreground">
                  <MessageSquare size={22} strokeWidth={1.7} />
                </span>
                <h3 className="mt-3 text-[13px] font-medium text-ink">No conversations found</h3>
                <p className="mx-auto mt-1 max-w-xs text-[11px] leading-relaxed text-muted-foreground">
                  Chats between customers and providers will appear here once bookings start.
                </p>
              </div>
            ) : (
              <div className="max-h-[560px] space-y-1 overflow-y-auto p-2.5">
                {filteredConversations.map((conv) => {
                  const isSelected = selectedConv?.id === conv.id;
                  const custName = conv.customer?.name || conv.customer?.user?.name || 'Customer';
                  const provName = conv.provider?.name || conv.provider?.user?.name || 'Provider';
                  const serviceTitle = conv.booking?.service?.title || 'Service Appointment';

                  return (
                    <button
                      key={conv.id}
                      onClick={() => selectConversation(conv)}
                      className={cn(
                        'w-full rounded-md border p-3.5 text-left transition-all',
                        isSelected
                          ? 'border-primary/30 bg-primary/6 shadow-xs'
                          : 'border-transparent hover:border-hairline hover:bg-surface-soft/40'
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-[11px] font-medium text-ink">
                          {custName} ↔ {provName}
                        </span>
                        {conv.bookingId && (
                          <span className="shrink-0 rounded-xs border border-hairline bg-surface-soft px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
                            #{conv.bookingId}
                          </span>
                        )}
                      </div>

                      <div
                        className={cn(
                          'mt-1 truncate text-[11px]',
                          isSelected ? 'text-primary' : 'text-body'
                        )}
                      >
                        {serviceTitle}
                      </div>

                      <p className="mt-1 line-clamp-1 text-[10px] leading-relaxed text-muted-foreground">
                        {conv.lastMessage ||
                          'Active chat channel between customer and verified technician.'}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </Reveal>

        {/* Transcript & intervention */}
        <Reveal delay={0.1} className="lg:col-span-7">
          <section className="overflow-hidden rounded-lg border border-hairline bg-card">
            {selectedConv ? (
              <>
                {/* Header details */}
                <div className="flex flex-col gap-3 border-b border-hairline px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-[1.35rem] leading-tight tracking-[-0.02em] text-ink">
                        Channel #{selectedConv.id}
                      </h2>
                      <span className="rounded-pill border border-accent-teal/20 bg-accent-teal/8 px-2 py-0.5 text-[8px] font-medium uppercase tracking-[0.06em] text-accent-teal">
                        <Shield size={8} className="mr-1 inline" />
                        Escrow protected
                      </span>
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <User size={11} className="text-primary" />
                        {selectedConv.customer?.name ||
                          selectedConv.customer?.user?.name ||
                          'Customer'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Wrench size={11} className="text-accent-teal" />
                        {selectedConv.provider?.name ||
                          selectedConv.provider?.user?.name ||
                          'Provider'}
                      </span>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <span className="block text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                      Service reference
                    </span>
                    <span className="mt-0.5 block text-[11px] font-medium text-ink">
                      {selectedConv.booking?.service?.title || 'Appointment'}
                    </span>
                  </div>
                </div>

                {/* Transcript viewer */}
                <div className="max-h-[400px] min-h-[340px] space-y-4 overflow-y-auto bg-surface-soft/30 p-4 sm:p-5">
                  {loadingMessages ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-20">
                      <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <p className="text-[11px] text-muted-foreground">Decrypting messages…</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="py-20 text-center">
                      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-hairline bg-canvas text-muted-foreground">
                        <MessageSquare size={19} strokeWidth={1.7} />
                      </span>
                      <p className="mt-2.5 text-[12px] font-medium text-ink">
                        No transcript entries yet
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        Messages exchanged on this booking will appear here.
                      </p>
                    </div>
                  ) : (
                    messages.map((m, idx) => {
                      const isAdmin = m.senderRole === 'ADMIN';
                      const isCustomer = m.senderRole === 'CUSTOMER';

                      return (
                        <div
                          key={m.id || idx}
                          className={cn(
                            'flex flex-col gap-1',
                            isAdmin ? 'items-center' : isCustomer ? 'items-start' : 'items-end'
                          )}
                        >
                          <span className="px-1 text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                            {isAdmin
                              ? 'ServiceHub moderator notice'
                              : isCustomer
                                ? `Customer · ${
                                    selectedConv.customer?.name ||
                                    selectedConv.customer?.user?.name ||
                                    'Customer'
                                  }`
                                : `Provider · ${
                                    selectedConv.provider?.name ||
                                    selectedConv.provider?.user?.name ||
                                    'Pro'
                                  }`}
                          </span>

                          <div
                            className={cn(
                              'max-w-md rounded-lg px-3.5 py-2.5 text-[11px] leading-relaxed',
                              isAdmin
                                ? 'border border-primary/25 bg-primary/8 text-center font-medium text-primary'
                                : isCustomer
                                  ? 'border border-hairline bg-canvas text-body shadow-xs'
                                  : 'bg-ink text-canvas shadow-xs'
                            )}
                          >
                            {m.message || m.text || m.content}
                          </div>

                          <span className="px-1 text-[9px] tabular-nums text-muted-foreground">
                            {m.createdAt
                              ? new Date(m.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Just now'}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Moderation composer */}
                <div className="space-y-3 border-t border-hairline px-5 py-4 sm:px-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      <ShieldAlert size={12} className="text-primary" /> Official moderator ruling
                    </span>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {templates.map((template) => (
                        <button
                          key={template.label}
                          type="button"
                          onClick={() => applyTemplate(template.text)}
                          className="rounded-pill border border-hairline bg-canvas px-2.5 py-1 text-[9px] font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                        >
                          {template.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleSendAdminNotice} className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="text"
                      required
                      value={adminReplyText}
                      onChange={(e) => setAdminReplyText(e.target.value)}
                      placeholder="Type an official moderation message or dispute ruling…"
                      className="h-10 flex-1 rounded-md border border-hairline bg-canvas px-3.5 text-xs text-ink outline-hidden transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/15"
                    />
                    <button
                      type="submit"
                      disabled={sendingReply}
                      className="flex items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-[11px] font-medium text-primary-foreground transition-all hover:bg-primary-active active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
                    >
                      <Send size={13} />
                      {sendingReply ? 'Posting…' : 'Post notice'}
                    </button>
                  </form>

                  <p className="flex items-center gap-1.5 text-[9px] leading-relaxed text-muted-foreground">
                    <ArrowUpRight size={10} className="shrink-0 text-primary" />
                    Notices are delivered to both parties and permanently attached to the booking
                    audit trail.
                  </p>
                </div>
              </>
            ) : (
              <div className="px-6 py-32 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-hairline bg-surface-soft text-muted-foreground">
                  <Shield size={24} strokeWidth={1.6} />
                </span>
                <h3 className="mt-4 font-display text-[1.5rem] leading-tight tracking-[-0.02em] text-ink">
                  Select a conversation to audit
                </h3>
                <p className="mx-auto mt-1.5 max-w-xs text-[11px] leading-relaxed text-muted-foreground">
                  Choose an active communication channel from the left panel to review message
                  transcripts and issue notices.
                </p>
              </div>
            )}
          </section>
        </Reveal>
      </div>
    </div>
  );
};
