import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Shield,
  ShieldAlert,
  Search,
  User,
  Wrench,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  X,
  FileText,
  BadgeAlert
} from 'lucide-react';
import {
  getAdminChatConversationsApi,
  getAdminChatMessagesApi,
  sendAdminChatMessageApi,
  getAdminChatStatsApi,
} from '../../api/admin';

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
        const list = Array.isArray(convRes.value) ? convRes.value : convRes.value.conversations || [];
        setConversations(list);
        if (list.length > 0 && !selectedConv) {
          selectConversation(list[0]);
        }
        if (list.length === 0) setSelectedConv(null);
      } else if (convRes.status === 'rejected') {
        setFeedback({ type: 'error', msg: convRes.reason?.message || 'Unable to load chat conversations.' });
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

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-16 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-extrabold text-foreground tracking-wider">
              Safety & Compliance Audit
            </span>
            <span className="inline-flex items-center gap-1 bg-muted text-foreground text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-border">
              <Shield size={12} /> Live Message Audit
            </span>
          </div>
          <h1 className="workspace-title text-2xl md:text-3xl">
            Chat Moderation & Dispute Audit
          </h1>
          <p className="workspace-subtitle text-xs md:text-sm mt-0.5">
            Inspect customer-to-provider communications, mediate active disputes, and issue official resolution notices.
          </p>
        </div>

        <button
          onClick={fetchAuditData}
          className="p-2.5 bg-muted hover:bg-accent text-foreground rounded-xl border border-border transition-colors cursor-pointer self-start sm:self-auto"
          title="Refresh Audit Logs"
        >
          <RefreshCw size={16} className={loadingList ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-2xl flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-muted text-foreground flex items-center justify-center">
            <MessageSquare size={18} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-bold uppercase">Active Channels</div>
            <div className="text-xl font-black text-foreground">
              {stats.totalConversations ?? conversations.length} Channels
            </div>
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-2xl flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-muted text-foreground flex items-center justify-center">
            <FileText size={18} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-bold uppercase">Messages Today</div>
            <div className="text-xl font-black text-foreground">
              {stats.messagesToday ?? 0} Today
            </div>
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-2xl flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-muted text-foreground flex items-center justify-center">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-bold uppercase">Moderator Status</div>
            <div className="text-xl font-black text-foreground">Encrypted / Active</div>
          </div>
        </div>
      </div>

      {/* Inline Feedback Banner */}
      {feedback.msg && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between animate-fade-in ${
            feedback.type === 'error'
              ? 'bg-rose-50 border border-rose-200 text-rose-700'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
          }`}
        >
          <span>{feedback.msg}</span>
          <button onClick={() => setFeedback({ type: '', msg: '' })}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Two-Pane Audit Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane (5 Cols): Conversations Browser */}
        <div className="lg:col-span-5 bg-card border border-border rounded-3xl p-5 space-y-4 shadow-sm">
          {/* Search Conversations */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer, pro, or booking ID..."
              className="w-full bg-muted border border-border rounded-xl pl-10 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:bg-card focus:border-foreground focus:outline-none transition-all"
            />
          </div>

          {/* Conversations List */}
          {loadingList ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-2">
              <div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-muted-foreground">Loading audit threads...</span>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <MessageSquare size={32} className="mx-auto text-slate-300" />
              <p className="text-xs font-bold text-slate-600">No conversations found</p>
              <p className="text-[11px] text-slate-400">Chats between customers and providers will appear here.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {filteredConversations.map((conv) => {
                const isSelected = selectedConv?.id === conv.id;
                const custName = conv.customer?.name || conv.customer?.user?.name || 'Customer';
                const provName = conv.provider?.name || conv.provider?.user?.name || 'Provider';
                const serviceTitle = conv.booking?.service?.title || 'Service Appointment';

                return (
                  <div
                    key={conv.id}
                    onClick={() => selectConversation(conv)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-muted border-foreground ring-2 ring-foreground/10'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[11px] font-black text-foreground truncate">
                        {custName} ↔ {provName}
                      </span>
                      {conv.bookingId && (
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                          #{conv.bookingId}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-foreground font-semibold truncate mb-1">
                      {serviceTitle}
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-1 leading-relaxed">
                      {conv.lastMessage || 'Active chat channel between customer and verified technician.'}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Pane (7 Cols): Transcript & Intervention Console */}
        <div className="lg:col-span-7 bg-card border border-border rounded-3xl p-6 space-y-4 shadow-sm">
          {selectedConv ? (
            <>
              {/* Header Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-foreground">
                      Channel #{selectedConv.id} Audit
                    </span>
                    <span className="text-[10px] font-bold bg-muted text-foreground px-2.5 py-0.5 rounded-full border border-border">
                      Escrow Protected
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1">
                      <User size={12} className="text-foreground" />
                      <strong>Customer:</strong> {selectedConv.customer?.name || selectedConv.customer?.user?.name || 'Customer'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Wrench size={12} className="text-foreground" />
                      <strong>Pro:</strong> {selectedConv.provider?.name || selectedConv.provider?.user?.name || 'Provider'}
                    </span>
                  </div>
                </div>

                <div className="text-right self-start sm:self-auto">
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 block">
                    Service Reference
                  </span>
                  <span className="text-xs font-black text-foreground">
                    {selectedConv.booking?.service?.title || 'Appointment'}
                  </span>
                </div>
              </div>

              {/* Message Transcript Viewer */}
              <div className="bg-muted/60 border border-border rounded-2xl p-4 min-h-[340px] max-h-[400px] overflow-y-auto space-y-3">
                {loadingMessages ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-2">
                    <div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-slate-400">Decrypting messages...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-20 text-center text-slate-400 text-xs">
                    No transcript entries recorded yet for this booking.
                  </div>
                ) : (
                  messages.map((m, idx) => {
                    const isAdmin = m.senderRole === 'ADMIN';
                    const isCustomer = m.senderRole === 'CUSTOMER';
                    const isProvider = m.senderRole === 'PROVIDER';

                    return (
                      <div
                        key={m.id || idx}
                        className={`flex flex-col space-y-1 ${
                          isAdmin
                            ? 'items-center'
                            : isCustomer
                            ? 'items-start'
                            : 'items-end'
                        }`}
                      >
                        <span className="text-[10px] font-bold text-slate-400 px-1">
                          {isAdmin
                            ? '🛡️ Official ServiceHub Moderator Notice'
                            : isCustomer
                            ? `👤 Customer (${selectedConv.customer?.name || selectedConv.customer?.user?.name || 'Customer'})`
                            : `🔧 Provider (${selectedConv.provider?.name || selectedConv.provider?.user?.name || 'Pro'})`}
                        </span>

                        <div
                          className={`p-3 rounded-2xl max-w-md text-xs leading-relaxed ${
                            isAdmin
                              ? 'bg-foreground text-background font-semibold text-center border border-foreground shadow-md'
                              : isCustomer
                              ? 'bg-card text-foreground border border-border shadow-sm'
                              : 'bg-slate-800 text-white shadow-2xs'
                          }`}
                        >
                          {m.message || m.text || m.content}
                        </div>

                        <span className="text-[9px] text-slate-400 px-1">
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

              {/* Official Moderator Action & Resolution */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <ShieldAlert size={14} className="text-foreground" />
                    Official Moderator Ruling / Intervention
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        applyTemplate(
                          'Notice: ServiceHub Dispute Support has reviewed this booking. Technician arrival has been verified.'
                        )
                      }
                      className="text-[10px] bg-muted hover:bg-accent text-foreground border border-border px-2 py-1 rounded-md font-semibold transition-colors"
                    >
                      Verify Arrival
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        applyTemplate(
                          'Dispute Ruling: Customer service guarantee has been approved. Warranty re-work scheduled at zero cost.'
                        )
                      }
                      className="text-[10px] bg-muted hover:bg-accent text-foreground border border-border px-2 py-1 rounded-md font-semibold transition-colors"
                    >
                      Warranty Re-work
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSendAdminNotice} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={adminReplyText}
                    onChange={(e) => setAdminReplyText(e.target.value)}
                    placeholder="Type official moderation message or dispute ruling..."
                    className="flex-1 bg-muted border border-border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:bg-card focus:border-foreground focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={sendingReply}
                    className="px-4 py-2.5 bg-foreground hover:bg-foreground/90 text-background rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <Send size={14} />
                    {sendingReply ? 'Posting...' : 'Post Notice'}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="py-36 text-center space-y-3">
              <Shield size={40} className="mx-auto text-slate-300" />
              <h4 className="text-sm font-bold text-foreground">Select a Conversation to Audit</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Choose an active communication channel from the left panel to review message transcripts.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
