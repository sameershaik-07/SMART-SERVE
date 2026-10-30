import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Send,
  CheckCheck,
  Check,
  Phone,
  Video,
  Sparkles,
  Loader2,
  AlertCircle,
  MessageSquare,
  Paperclip,
  Smile,
  Clock,
  MapPin,
  Shield,
  ShieldCheck,
  ArrowLeft,
  X,
  Mic,
  MicOff,
  Calendar,
  ChevronRight,
  Star,
  Info,
  CheckCircle2,
  PhoneOff,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import {
  getConversationsApi,
  createOrGetConversationApi,
  getMessagesApi,
  sendMessageApi,
  markMessagesReadApi,
} from '../../api/chat';
import { getSocket } from '../../api/socket';
import {
  getConversations as cacheGetConversations,
  setConversations as cacheSetConversations,
  getMessages as cacheGetMessages,
  setMessages as cacheSetMessages,
  withOngoing as cacheWithOngoing,
  mergeMessages as cacheMergeMessages,
  mergeConversations as cacheMergeConversations,
} from '../../lib/pageCache';

export const MessagesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetProviderId = searchParams.get('providerId');
  const targetCustomerId = searchParams.get('customerId');
  const targetPartnerId = targetProviderId || targetCustomerId;
  const targetPartnerName = searchParams.get('name') || searchParams.get('customerName');
  const targetPartnerAvatar = searchParams.get('avatar') || searchParams.get('customerAvatar');
  const targetBookingId = searchParams.get('bookingId');

  const defaultConversations = [];
  const defaultMessagesByChat = {};

  const [conversations, setConversations] = useState(defaultConversations);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread' | 'bookings'
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // UI Panels / Modals
  const [showMobileList, setShowMobileList] = useState(true);
  const [showInfoSidebar, setShowInfoSidebar] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeCallModal, setActiveCallModal] = useState(null); // 'voice' | 'video' | null
  const [callDuration, setCallDuration] = useState(0);
  const [isCallMuted, setIsCallMuted] = useState(false);
  const [attachedImage, setAttachedImage] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const initialMessagesLoadRef = useRef(true); // only the first messages fetch should skip the COUNT()

  // Call timer simulation
  useEffect(() => {
    let interval = null;
    if (activeCallModal) {
      setCallDuration(0);
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [activeCallModal]);

  const formatCallTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Format backend conversation to UI representation
  const formatConversation = (conv) => {
    const isCustomer = user?.role === 'CUSTOMER';
    const partner = isCustomer ? conv.provider : conv.customer;
    const partnerUser = partner?.user || {};
    const fallbackName = partnerUser.name || (isCustomer ? 'Service Provider' : 'Customer');
    const partnerRole = isCustomer
      ? conv.provider?.category?.categoryName || 'Service Provider'
      : 'Customer';

    const lastMsg = conv.lastMessage || conv.messages?.[0]?.message || 'Conversation started';
    const timeFormatted =
      conv.lastMessageAt || conv.updatedAt
        ? new Date(conv.lastMessageAt || conv.updatedAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'Just now';

    return {
      id: conv.id,
      name: fallbackName,
      avatar:
        partnerUser.avatar ||
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
      lastMessage: lastMsg,
      time: timeFormatted,
      unread: conv.unreadCount || 0,
      role: partnerRole,
      rating: conv.provider?.rating || 4.9,
      online: true,
      booking: conv.booking || null,
      raw: conv,
    };
  };

  // Format message to UI representation
  const formatMessage = (msg) => {
    const isMe = user
      ? msg.senderId === user.id || (user.role !== 'ADMIN' && msg.senderRole === user.role)
      : msg.senderRole === 'CUSTOMER';
    const timeStr = msg.createdAt
      ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : msg.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let senderName = msg.sender?.name;
    if (!senderName) {
      if (msg.senderRole === 'ADMIN') senderName = 'ServiceHub Moderator';
      else if (isMe) senderName = 'You';
      else senderName = user?.role === 'PROVIDER' ? 'Customer' : 'Provider';
    }

    return {
      id: msg.id || Date.now(),
      isMe,
      senderRole: msg.senderRole,
      senderName,
      text: msg.message || msg.text,
      time: timeStr,
      isRead: msg.isRead ?? true,
      image: msg.image || null,
    };
  };

  const matchesPartner = (conv, partnerId) => {
    if (!conv || !partnerId) return false;
    const pid = Number(partnerId);
    return (
      conv.providerId === pid ||
      conv.provider?.userId === pid ||
      conv.provider?.id === pid ||
      conv.customerId === pid ||
      conv.customer?.userId === pid ||
      conv.customer?.id === pid
    );
  };

  // 1. Initial load & query param handling
  useEffect(() => {
    let isMounted = true;

    const loadConversations = async () => {
      setErrorMessage(null);

      const token = localStorage.getItem('token');
      const isProv = user?.role === 'PROVIDER';

      // Demo mode without token: keep fallback
      if (!token) {
        setLoadingConversations(false);
        if (targetPartnerId) {
          const pId = Number(targetPartnerId);
          const exists = defaultConversations.find((c) => c.id === pId);
          if (!exists && targetPartnerName) {
            const newConv = {
              id: pId,
              name: decodeURIComponent(targetPartnerName),
              avatar: targetPartnerAvatar
                ? decodeURIComponent(targetPartnerAvatar)
                : 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
              lastMessage: 'Conversation opened',
              time: 'Just now',
              unread: 0,
              role: isProv ? 'Customer' : 'Verified Service Provider',
              rating: 4.9,
              online: true,
              booking: targetBookingId
                ? { id: Number(targetBookingId), service: 'Scheduled Service' }
                : null,
            };
            setConversations([newConv, ...defaultConversations]);
            setActiveChatId(pId);
          } else {
            setActiveChatId(pId || defaultConversations[0]?.id || null);
          }
        } else {
          setConversations(defaultConversations);
          setActiveChatId(defaultConversations[0]?.id || null);
        }
        return;
      }

      // Check cache first for instant render
      const cached = cacheGetConversations(user?.id);
      let selectedId = null;

      if (cached && Array.isArray(cached) && cached.length > 0) {
        const formattedCached = cached.map(formatConversation);
        setConversations(formattedCached);
        setLoadingConversations(false);

        if (targetPartnerId) {
          const matchCached = cached.find((c) => matchesPartner(c, targetPartnerId));
          if (matchCached) {
            selectedId = matchCached.id;
            setActiveChatId(selectedId);
          }
        } else {
          selectedId = cached[0]?.id || null;
          setActiveChatId(selectedId);
        }
      } else {
        setLoadingConversations(true);
      }

      // Fetch fresh conversations from backend
      try {
        const res = await getConversationsApi();
        const convList = res.conversations || [];
        const mergedRaw =
          cached && Array.isArray(cached) && cached.length > 0
            ? cacheMergeConversations(cached, convList)
            : convList;
        cacheSetConversations(user?.id, mergedRaw);

        if (!isMounted) return;

        let formattedList = mergedRaw.map(formatConversation);

        if (targetPartnerId) {
          const pId = Number(targetPartnerId);
          let match = mergedRaw.find((c) => matchesPartner(c, pId));

          if (match) {
            selectedId = match.id;
            setConversations(formattedList);
            setActiveChatId(selectedId);
          } else {
            // Initiate new conversation with partner
            try {
              const createRes = await createOrGetConversationApi(pId, targetBookingId);
              if (createRes.conversation) {
                const formattedNew = formatConversation(createRes.conversation);
                formattedList = [
                  formattedNew,
                  ...formattedList.filter((c) => c.id !== formattedNew.id),
                ];
                setConversations(formattedList);
                selectedId = formattedNew.id;
                setActiveChatId(selectedId);
                cacheSetConversations(user?.id, [
                  createRes.conversation,
                  ...mergedRaw.filter((c) => c.id !== createRes.conversation.id),
                ]);
              }
            } catch (err) {
              console.warn('Could not create conversation, fallback to first:', err);
              setConversations(formattedList);
              if (!selectedId) {
                selectedId = formattedList[0]?.id || null;
                setActiveChatId(selectedId);
              }
            }
          }
        } else {
          setConversations(formattedList);
          // Only change activeChatId if not yet set or not in current list
          setActiveChatId((prev) => {
            if (prev && formattedList.some((c) => c.id === prev)) {
              return prev;
            }
            return formattedList[0]?.id || null;
          });
        }
      } catch (err) {
        console.warn('Backend conversations unavailable:', err);
        if (!cached || cached.length === 0) {
          setConversations([]);
          setActiveChatId(null);
        }
      } finally {
        if (isMounted) setLoadingConversations(false);
      }
    };

    loadConversations();

    return () => {
      isMounted = false;
    };
  }, [targetPartnerId, targetPartnerName, targetPartnerAvatar, targetBookingId, user?.id, user?.role]);

  // 2. Fetch messages & Socket subscription

  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }

    let isMounted = true;

    const loadMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          const savedHistory = localStorage.getItem('servicehub_chat_history');
          let history = defaultMessagesByChat;
          if (savedHistory) {
            try {
              history = JSON.parse(savedHistory);
            } catch {}
          }
          const chatMsgs = history[activeChatId] || [
            {
              id: 1,
              senderRole: 'PROVIDER',
              text: 'Hello! How can I assist you with your service today?',
              time: 'Just now',
            },
          ];
          if (isMounted) {
            setMessages(chatMsgs.map(formatMessage));
            setLoadingMessages(false);
          }
          return;
        }

        // If we have cached messages for this conversation, show them immediately
        const cached = cacheGetMessages(user?.id, activeChatId);
        if (cached && Array.isArray(cached) && cached.length > 0) {
          setMessages(cached.map(formatMessage));
          setLoadingMessages(false);

          // background refresh (deduplicated)
          cacheWithOngoing(`messages:${user?.id}:${activeChatId}`, async () => {
            try {
              const res = await getMessagesApi(activeChatId, 1, 50, initialMessagesLoadRef.current);
              const apiMsgs = res.messages || [];
              // merge raw arrays and update cache
              const mergedRaw = cacheMergeMessages(cached, apiMsgs);
              cacheSetMessages(user?.id, activeChatId, mergedRaw);
              if (!isMounted) return;
              setMessages(mergedRaw.map(formatMessage));
              markMessagesReadApi(activeChatId).catch(() => {});
              if (initialMessagesLoadRef.current) initialMessagesLoadRef.current = false;
            } catch (err) {
              console.warn('Background refresh messages failed:', err);
            }
          }).catch(() => {});

          return;
        }

        // No cache: perform normal blocking load
        setLoadingMessages(true);
        // For the very first messages load on page open, we don't need the total count
        // so pass skipCount=true to avoid a COUNT() in the DB. Subsequent navigations
        // will request the full count as before.
        const res = await getMessagesApi(activeChatId, 1, 50, initialMessagesLoadRef.current);
        if (isMounted) {
          const apiMsgs = res.messages || [];
          // store raw messages in cache
          cacheSetMessages(user?.id, activeChatId, apiMsgs);
          setMessages(apiMsgs.map(formatMessage));
          markMessagesReadApi(activeChatId).catch(() => {});
          // After initial load, subsequent loads should request the full count
          if (initialMessagesLoadRef.current) initialMessagesLoadRef.current = false;
        }
      } catch (err) {
        console.warn('Failed to load messages from backend:', err);
        const local = defaultMessagesByChat[activeChatId] || [];
        if (isMounted) {
          setMessages(local.map(formatMessage));
        }
      } finally {
        if (isMounted) setLoadingMessages(false);
      }
    };

    loadMessages();

    // Socket.io integration
    const socket = getSocket();
    if (socket) {
      socket.emit('join_conversation', { conversationId: activeChatId });

      const handleNewMessage = (msg) => {
        if (msg.conversationId === activeChatId) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;

            // Check if there is an unresolved optimistic message we can replace
            // tempIds are Date.now() which are huge numbers. Real DB IDs are small ints (or UUIDs, but here ints).
            const isMe = user
              ? msg.senderId === user.id || msg.senderRole === user.role
              : msg.senderRole === 'CUSTOMER';
            if (isMe) {
              const optIdx = prev.findIndex(
                (m) =>
                  m.isMe &&
                  m.text === (msg.message || msg.text) &&
                  typeof m.id === 'number' &&
                  m.id > 1000000000000
              );
              if (optIdx !== -1) {
                const updated = [...prev];
                updated[optIdx] = formatMessage(msg);
                return updated;
              }
            }

            return [...prev, formatMessage(msg)];
          });

          if (user && msg.senderId !== user.id) {
            socket.emit('mark_read', { conversationId: activeChatId });
          }
        }

        setConversations((prev) =>
          prev.map((c) =>
            c.id === msg.conversationId
              ? {
                  ...c,
                  lastMessage: msg.message,
                  time: new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                }
              : c
          )
        );
      };

      const handleUserTyping = (data) => {
        if (data.conversationId === activeChatId && data.userId !== user?.id) {
          setIsTyping(true);
        }
      };

      const handleUserStoppedTyping = (data) => {
        if (data.conversationId === activeChatId) {
          setIsTyping(false);
        }
      };

      socket.on('new_message', handleNewMessage);
      socket.on('user_typing', handleUserTyping);
      socket.on('user_stopped_typing', handleUserStoppedTyping);

      return () => {
        socket.emit('leave_conversation', { conversationId: activeChatId });
        socket.off('new_message', handleNewMessage);
        socket.off('user_typing', handleUserTyping);
        socket.off('user_stopped_typing', handleUserStoppedTyping);
      };
    }
  }, [activeChatId, user?.id, user?.role]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    const socket = getSocket();
    if (!socket || !activeChatId) return;

    socket.emit('typing_start', { conversationId: activeChatId });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', { conversationId: activeChatId });
    }, 1500);
  };

  const handleSelectConversation = (id) => {
    setActiveChatId(id);
    setShowMobileList(false);
  };

  const handleSendPrompt = (promptText) => {
    setInputText(promptText);
  };

  const handleAttachImageSimulation = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const text = inputText.trim();
    if ((!text && !attachedImage) || !activeChatId) return;

    const messageToSend = text || 'Sent an image attachment';
    const currentImg = attachedImage;

    setInputText('');
    setAttachedImage(null);
    setShowEmojiPicker(false);
    setSending(true);
    setErrorMessage(null);

    const currentTimeStr = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const tempId = Date.now();
    const optimisticMsg = {
      id: tempId,
      isMe: true,
      senderRole: user?.role || 'CUSTOMER',
      senderName: user?.name || 'You',
      text: messageToSend,
      image: currentImg,
      time: currentTimeStr,
      isRead: false,
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeChatId ? { ...c, lastMessage: messageToSend, time: 'Just now' } : c
      )
    );

    try {
      const token = localStorage.getItem('token');
      if (token) {
        const res = await sendMessageApi(activeChatId, messageToSend);
        const savedMsg = res.data;
        if (savedMsg) {
          setMessages((prev) =>
            prev.map((m) => (m.id === tempId ? { ...formatMessage(savedMsg), image: currentImg } : m))
          );
        }
      } else {
        // Fallback simulation
        const savedHistory = localStorage.getItem('servicehub_chat_history');
        let history = defaultMessagesByChat;
        if (savedHistory) {
          try {
            history = JSON.parse(savedHistory);
          } catch {}
        }
        const updatedChat = [
          ...(history[activeChatId] || []),
          { id: tempId, senderRole: 'CUSTOMER', text: messageToSend, time: currentTimeStr },
        ];
        localStorage.setItem(
          'servicehub_chat_history',
          JSON.stringify({ ...history, [activeChatId]: updatedChat })
        );

        setTimeout(() => {
          const autoReply = {
            id: Date.now() + 1,
            senderRole: 'PROVIDER',
            text: 'Thank you! We have received your update and our technician is on track.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, formatMessage(autoReply)]);
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to deliver message:', err);
      setErrorMessage('Could not deliver message to the server. Please check your connection.');
    } finally {
      setSending(false);
    }
  };

  const activeConv = conversations.find((c) => c.id === activeChatId) || conversations[0];

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'unread') return c.unread > 0;
    if (activeTab === 'bookings') return !!c.booking;
    return true;
  });

  const quickPrompts = [
    { label: '⏱️ What is your ETA?', text: 'Hi! What is your estimated time of arrival?' },
    { label: '📍 Share location', text: 'I have shared my confirmed service address.' },
    { label: '🚪 I am at home', text: 'I am at home and available whenever you arrive.' },
    { label: '📞 Call upon arrival', text: 'Please give me a quick ring when you reach the gate.' },
    {
      label: '🛠️ Extra tools required',
      text: 'Do you require any specific spare parts for inspection?',
    },
  ];

  const quickEmojis = ['👍', '👋', '🙏', '✨', '😊', '✅', '❤️', '👌'];

  const isProvider = user?.role === 'PROVIDER';

  // Warm editorial tokens. Palette adapts to dark mode automatically.
  const t = {
    shell: 'bg-card border-hairline',
    sidebar: 'bg-surface-soft/50',
    sidebarHdr: 'bg-canvas/40 border-hairline',
    iconBg: 'bg-primary text-primary-foreground',
    titleColor: 'text-ink',
    subtitleColor: 'text-muted-foreground',
    threadsBadge: 'border-hairline bg-canvas text-body',
    searchBg:
      'border-hairline bg-canvas text-ink placeholder:text-muted-foreground focus:border-primary',
    tabBar: 'border border-hairline bg-canvas/70',
    tabActive: 'bg-card text-ink shadow-xs',
    tabInactive: 'text-muted-foreground hover:text-ink',
    listDivide: 'divide-hairline-soft',
    convActive: 'border-primary/25 bg-card shadow-xs ring-1 ring-primary/10',
    convInactive: 'border-transparent hover:border-hairline-soft hover:bg-canvas/60',
    convAccent: 'bg-primary',
    imgBorder: 'border-hairline',
    onlineDot: 'border-card bg-accent-teal',
    nameActive: 'text-ink',
    nameInactive: 'text-body-strong',
    rolePill: 'border-hairline bg-canvas text-muted-foreground',
    lastMsg: 'text-muted-foreground',
    lastMsgActive: 'text-body',
    unreadBadge: 'bg-primary text-primary-foreground',
    footer: 'border-hairline bg-canvas/40',
    mainPanel: 'bg-canvas',
    chatHdr: 'border-hairline bg-canvas/90',
    avatarBorder: 'border-hairline',
    nameHdr: 'text-ink',
    roleHdrPill: 'border-hairline bg-surface-soft text-muted-foreground',
    onlineText: 'text-accent-teal',
    callSegment: 'border-hairline bg-surface-soft',
    callBtn: 'text-body hover:bg-canvas hover:text-ink',
    callIcon: 'text-primary',
    bookingBtn: 'border-primary/25 bg-primary/6 text-primary hover:bg-primary/10',
    infoBtn:
      'border-hairline bg-canvas text-muted-foreground hover:bg-surface-soft hover:text-ink',
    infoBtnActive: 'border-primary bg-primary text-primary-foreground',
    pinBar: 'border-primary/15 bg-primary/6 text-primary',
    pinBtn: 'text-primary hover:text-primary-active',
    errorBar: 'border-destructive/20 bg-destructive/6 text-destructive',
    msgStream: 'bg-surface-soft/30',
    encryptPill: 'border-hairline bg-canvas text-muted-foreground',
    loaderColor: 'text-primary',
    emptyIcon: 'bg-primary/8 text-primary',
    emptyTitle: 'text-ink',
    emptyText: 'text-muted-foreground',
    theirBubble: 'border-hairline bg-card text-body',
    myBubble: 'border-transparent bg-primary text-primary-foreground',
    readCheck: 'text-primary',
    typingBubble: 'border-hairline bg-card',
    typingDot: 'bg-primary',
    typingText: 'text-muted-foreground',
    quickBar: 'border-hairline bg-canvas',
    quickLabel: 'text-muted-foreground',
    quickChip:
      'border-hairline bg-surface-soft text-body hover:border-primary/30 hover:bg-primary/5 hover:text-primary',
    inputDock: 'border-hairline bg-canvas',
    attachPreview: 'border-primary/20 bg-primary/6',
    attachText: 'text-ink',
    emojiPicker: 'border-hairline bg-popover',
    attachBtn: 'text-muted-foreground hover:bg-surface-soft hover:text-ink',
    emojiBtn: 'text-muted-foreground hover:bg-surface-soft hover:text-ink',
    emojiBtnActive: 'bg-surface-soft text-primary',
    inputField:
      'border-hairline bg-surface-soft/60 text-ink placeholder:text-muted-foreground focus:border-primary focus:bg-canvas',
    sendBtn: '',
    infoPanel: 'border-hairline bg-card',
    infoPanelHdr: 'text-ink',
    infoPanelX: 'text-muted-foreground hover:bg-surface-soft hover:text-ink',
    infoPanelBorder: 'border-hairline',
    infoPanelPill: 'border-hairline bg-surface-soft text-muted-foreground',
    infoPanelMeta: 'text-muted-foreground',
    infoPanelVal: 'text-ink',
    infoPanelIcon: 'text-primary',
  };

  return (
    <div className="mx-0 flex h-full min-h-0 max-w-none animate-fade-in flex-col">
      {/* Outer Shell */}
      <div
        className={`relative flex min-h-0 flex-1 overflow-hidden rounded-lg border ${t.shell}`}
      >
        {/* ===== LEFT SIDEBAR ===== */}
        <div
          className={`z-20 flex min-h-0 w-full shrink-0 flex-col border-r md:w-80 lg:w-[336px] ${t.sidebar} ${
            showMobileList ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Header */}
          <div className={`shrink-0 border-b p-5 ${t.sidebarHdr}`}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-md shadow-xs ${t.iconBg}`}
                >
                  <MessageSquare size={18} strokeWidth={1.8} />
                </div>
                <div>
                  <h1
                    className={`font-display text-[1.65rem] leading-none tracking-[-0.02em] ${t.titleColor}`}
                  >
                    Messages
                  </h1>
                  <p
                    className={`mt-1 text-[10px] uppercase tracking-[0.14em] ${t.subtitleColor}`}
                  >
                    Encrypted conversations
                  </p>
                </div>
              </div>
              <span
                className={`shrink-0 rounded-pill border px-2.5 py-1 text-[10px] font-medium tabular-nums ${t.threadsBadge}`}
              >
                {conversations.length} threads
              </span>
            </div>

            {/* Search */}
            <div className="relative">
              <Search
                size={15}
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${t.subtitleColor}`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations…"
                className={`h-10 w-full rounded-md border pl-9 pr-9 text-xs font-medium outline-hidden transition-all ${t.searchBg}`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-xs p-0.5 transition-opacity hover:opacity-80 ${t.subtitleColor}`}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className={`mt-3.5 flex items-center gap-1 rounded-md p-1 ${t.tabBar}`}>
              {[
                { id: 'all', label: 'All' },
                { id: 'unread', label: 'Unread' },
                { id: 'bookings', label: 'Bookings' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 rounded-sm py-1.5 text-[11px] font-medium transition-all ${
                    activeTab === tab.id ? t.tabActive : t.tabInactive
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations List */}
          <div className={`flex-1 space-y-1 divide-y overflow-y-auto p-2 ${t.listDivide}`}>
            {loadingConversations ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20">
                <Loader2 size={24} className={`animate-spin ${t.loaderColor}`} />
                <span className={`text-[11px] ${t.subtitleColor}`}>Loading conversations…</span>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="px-4 py-16 text-center">
                <div
                  className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${t.emptyIcon}`}
                >
                  <Search size={20} strokeWidth={1.7} />
                </div>
                <h4 className={`text-[13px] font-medium ${t.emptyTitle}`}>
                  {conversations.length === 0
                    ? isProvider
                      ? 'No conversations yet'
                      : 'No messages yet'
                    : 'No conversations found'}
                </h4>
                <p className={`mt-1 text-[11px] ${t.subtitleColor}`}>
                  {conversations.length === 0
                    ? isProvider
                      ? 'Customer booking inquiries will appear here.'
                      : 'Book a service or contact a provider to start chatting.'
                    : 'Try a different search or filter.'}
                </p>
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isActive = activeChatId === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelectConversation(c.id)}
                    className={`group relative flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-all ${
                      isActive ? t.convActive : t.convInactive
                    }`}
                  >
                    {isActive && (
                      <span
                        className={`absolute bottom-3 left-0 top-3 w-[2px] rounded-full ${t.convAccent}`}
                      />
                    )}
                    <div className="relative shrink-0">
                      <img
                        src={c.avatar}
                        alt={c.name}
                        className={`h-11 w-11 rounded-md border object-cover ${t.imgBorder}`}
                      />
                      {c.online && (
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 ${t.onlineDot}`}
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex items-center justify-between gap-1">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <h4
                            className={`truncate text-[13px] font-medium ${
                              isActive ? t.nameActive : t.nameInactive
                            }`}
                          >
                            {c.name}
                          </h4>
                          <CheckCircle2
                            size={12}
                            className="shrink-0 fill-accent-teal text-accent-teal"
                            strokeWidth={2}
                          />
                        </div>
                        <span
                          className={`ml-1 shrink-0 text-[10px] tabular-nums ${t.subtitleColor}`}
                        >
                          {c.time}
                        </span>
                      </div>
                      <div className="mb-1 flex items-center gap-1.5">
                        <span
                          className={`inline-block truncate rounded-xs border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.06em] ${t.rolePill}`}
                        >
                          {c.role}
                        </span>
                        {c.booking && (
                          <span className="truncate rounded-xs border border-primary/20 bg-primary/6 px-1.5 py-0.5 text-[9px] font-medium text-primary">
                            #{c.booking.id}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`truncate text-[11px] ${
                            isActive ? `${t.lastMsgActive} font-medium` : t.lastMsg
                          }`}
                        >
                          {c.lastMessage}
                        </p>
                        {c.unread > 0 && (
                          <span
                            className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-[9px] font-semibold tabular-nums ${t.unreadBadge}`}
                          >
                            {c.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className={`shrink-0 border-t p-3.5 text-center ${t.footer}`}>
            <span
              className={`flex items-center justify-center gap-1.5 text-[10px] ${t.subtitleColor}`}
            >
              <ShieldCheck size={12} className="text-accent-teal" />
              ServiceHub safe consultation guarantee
            </span>
          </div>
        </div>

        {/* ===== RIGHT MAIN PANEL ===== */}
        <div
          className={`flex h-full flex-1 flex-col overflow-hidden ${t.mainPanel} ${
            showMobileList ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Chat Header */}
          <div
            className={`z-10 flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3 backdrop-blur-md sm:px-5 ${t.chatHdr}`}
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <button
                type="button"
                onClick={() => setShowMobileList(true)}
                className={`-ml-1 shrink-0 rounded-md p-2 transition-colors md:hidden ${t.callBtn}`}
                title="Back"
              >
                <ArrowLeft size={17} />
              </button>
              {activeConv && (
              <div className="relative shrink-0">
                <img
                  src={
                    activeConv?.avatar ||
                    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80'
                  }
                  alt={activeConv?.name}
                  className={`h-10 w-10 rounded-md border object-cover ${t.avatarBorder}`}
                />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 ${t.onlineDot}`}
                />
              </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3
                    className={`truncate font-display text-[1.3rem] leading-none tracking-[-0.02em] ${t.nameHdr}`}
                  >
                    {activeConv?.name || 'No conversation selected'}
                  </h3>
                  {activeConv && (
                    <CheckCircle2
                      size={14}
                      className="shrink-0 fill-accent-teal text-accent-teal"
                      strokeWidth={2}
                    />
                  )}
                  {activeConv?.role && (
                    <span
                      className={`hidden shrink-0 rounded-xs border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.06em] sm:inline-flex ${t.roleHdrPill}`}
                    >
                      {activeConv.role}
                    </span>
                  )}
                </div>
                <div
                  className={`mt-1 flex items-center gap-2 text-[10px] ${activeConv ? '' : 'hidden'} ${t.subtitleColor}`}
                >
                  <span className={`flex shrink-0 items-center gap-1 font-medium ${t.onlineText}`}>
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-teal" />
                    Online
                  </span>
                  <span className="text-hairline">·</span>
                  <span className="hidden truncate md:inline">Replies in ~5m</span>
                  <span className="hidden text-hairline md:inline">·</span>
                  <span className="flex shrink-0 items-center gap-1 font-medium text-accent-amber">
                    <Star size={11} className="fill-accent-amber text-accent-amber" />
                    {activeConv?.rating || 4.9}
                  </span>
                </div>
              </div>
            </div>

            <div className={`flex shrink-0 items-center gap-1.5 ${activeConv ? '' : 'hidden'}`}>
              <div
                className={`flex items-center gap-0.5 rounded-md border p-0.5 ${t.callSegment}`}
              >
                <button
                  type="button"
                  onClick={() => setActiveCallModal('voice')}
                  className={`flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-[11px] font-medium transition-all active:scale-95 ${t.callBtn}`}
                  title="Voice call"
                >
                  <Phone size={14} className={`shrink-0 ${t.callIcon}`} />
                  <span className="hidden sm:inline">Call</span>
                </button>
                <div className="mx-0.5 h-4 w-px bg-hairline" />
                <button
                  type="button"
                  onClick={() => setActiveCallModal('video')}
                  className={`flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-[11px] font-medium transition-all active:scale-95 ${t.callBtn}`}
                  title="Video call"
                >
                  <Video size={14} className={`shrink-0 ${t.callIcon}`} />
                  <span className="hidden sm:inline">Video</span>
                </button>
              </div>
              {activeConv?.booking && (
                <button
                  type="button"
                  onClick={() => navigate(isProvider ? '/provider/bookings' : `/bookings/${activeConv.booking.id}`)}
                  className={`hidden items-center gap-1.5 rounded-md border px-2.5 py-2 text-[11px] font-medium transition-all active:scale-95 xl:flex ${t.bookingBtn}`}
                >
                  <Calendar size={13} className="shrink-0" />
                  <span>#{activeConv.booking.id}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowInfoSidebar(!showInfoSidebar)}
                className={`rounded-md border p-2 transition-all active:scale-95 ${
                  showInfoSidebar ? t.infoBtnActive : t.infoBtn
                }`}
                title="Conversation details"
              >
                <Info size={16} />
              </button>
            </div>
          </div>

          {/* Booking Pin Bar */}
          {activeConv?.booking && (
            <div
              className={`flex shrink-0 items-center justify-between border-b px-5 py-2 text-[11px] ${t.pinBar}`}
            >
              <div className="flex items-center gap-2 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                <span>
                  Active booking:{' '}
                  <strong className="font-medium">
                    {activeConv.booking.service || 'Home service'}
                  </strong>
                </span>
              </div>
              <button
                onClick={() => navigate(isProvider ? '/provider/bookings' : `/bookings/${activeConv.booking.id}`)}
                className={`flex items-center gap-1 font-medium transition-colors ${t.pinBtn}`}
              >
                Track <ChevronRight size={13} />
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div
              className={`flex shrink-0 items-center justify-between border-b px-5 py-2 text-[11px] ${t.errorBar}`}
            >
              <div className="flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{errorMessage}</span>
              </div>
              <button onClick={() => setErrorMessage(null)} aria-label="Dismiss error">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Message Stream */}
          <div
            className={`relative min-h-0 flex-1 space-y-4 overflow-y-auto bg-paper-grain p-5 sm:p-6 ${t.msgStream}`}
          >
            <div className="py-1 text-center">
              <span
                className={`inline-flex items-center gap-1.5 rounded-pill border px-3 py-1 text-[9px] uppercase tracking-[0.14em] ${t.encryptPill}`}
              >
                <ShieldCheck size={11} className="text-accent-teal" />
                End-to-end encrypted
              </span>
            </div>

            {loadingMessages ? (
              <div className="flex flex-col items-center justify-center gap-2 py-24">
                <Loader2 size={24} className={`animate-spin ${t.loaderColor}`} />
                <span className={`text-[11px] ${t.subtitleColor}`}>Loading messages…</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div
                  className={`mb-3 flex h-14 w-14 items-center justify-center rounded-full ${t.emptyIcon}`}
                >
                  <Sparkles size={24} strokeWidth={1.6} />
                </div>
                <h4 className={`text-[13px] font-medium ${t.emptyTitle}`}>
                  {activeConv
                    ? 'Start the conversation'
                    : isProvider
                    ? 'No active customer chats'
                    : 'No conversations yet'}
                </h4>
                <p className={`mt-1 max-w-sm text-[11px] ${t.emptyText}`}>
                  {activeConv
                    ? `Send your first message to ${activeConv.name || (isProvider ? 'the customer' : 'your professional')}.`
                    : isProvider
                    ? 'When customers reach out or book your services, conversations will appear here.'
                    : 'When you book a service or message a provider, your messages will appear here.'}
                </p>
                {!activeConv &&
                  (isProvider ? (
                    <Button size="sm" className="mt-4" onClick={() => navigate('/provider/bookings')}>
                      View job requests
                    </Button>
                  ) : (
                    <Button size="sm" className="mt-4" onClick={() => navigate('/services')}>
                      Browse services
                    </Button>
                  ))}
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`group flex flex-col ${m.isMe ? 'items-end' : 'items-start'}`}
                >
                  {!m.isMe && (
                    <span className={`mb-1 flex items-center gap-1 px-1 text-[10px] font-medium ${t.subtitleColor}`}>
                      {m.senderRole === 'ADMIN' && <Shield size={10} className="text-primary" />}
                      {m.senderName}
                    </span>
                  )}
                  <div className="flex max-w-[85%] items-end gap-2 sm:max-w-md md:max-w-lg">
                    <div
                      className={`rounded-lg border px-3.5 py-2.5 text-[12.5px] font-normal leading-relaxed transition-all ${
                        m.senderRole === 'ADMIN'
                          ? `border-primary/30 bg-primary/10 text-ink shadow-xs`
                          : m.isMe
                          ? `rounded-br-xs shadow-xs ${t.myBubble}`
                          : `rounded-bl-xs ${t.theirBubble}`
                      }`}
                    >
                      {m.senderRole === 'ADMIN' && (
                        <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                          <Shield size={11} /> ServiceHub Official Notice
                        </div>
                      )}
                      {m.image && (
                        <div className="mb-2 max-h-56 overflow-hidden rounded-md border border-white/20">
                          <img src={m.image} alt="Attachment" className="h-full w-full object-cover" />
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    </div>
                  </div>
                  <div
                    className={`mt-1 flex items-center gap-1 px-1 text-[9px] tabular-nums ${t.subtitleColor}`}
                  >
                    <span>{m.time}</span>
                    {m.isMe &&
                      (m.isRead ? (
                        <CheckCheck size={12} className={t.readCheck} />
                      ) : (
                        <Check size={12} className={t.subtitleColor} />
                      ))}
                  </div>
                </div>
              ))
            )}

            {isTyping && (
              <div
                className={`flex w-max animate-pulse items-center gap-1.5 rounded-lg rounded-bl-none border px-3.5 py-2.5 ${t.typingBubble}`}
              >
                <span className={`h-1.5 w-1.5 animate-bounce rounded-full ${t.typingDot}`} />
                <span
                  className={`h-1.5 w-1.5 animate-bounce rounded-full delay-150 ${t.typingDot}`}
                />
                <span
                  className={`h-1.5 w-1.5 animate-bounce rounded-full delay-300 ${t.typingDot}`}
                />
                <span className={`ml-1 text-[10px] ${t.typingText}`}>
                  {activeConv?.name} is typing…
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reply Chips */}
          <div
            className={`scrollbar-none flex shrink-0 items-center gap-2 overflow-x-auto border-t px-5 py-2 ${activeConv ? '' : 'hidden'} ${t.quickBar}`}
          >
            <span
              className={`shrink-0 text-[9px] font-medium uppercase tracking-[0.14em] ${t.quickLabel}`}
            >
              Quick replies
            </span>
            {quickPrompts.map((chip, i) => (
              <button
                key={i}
                onClick={() => handleSendPrompt(chip.text)}
                className={`shrink-0 rounded-pill border px-2.5 py-1 text-[10px] font-medium transition-all ${t.quickChip}`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input Dock */}
          <div className={`relative shrink-0 border-t p-3.5 sm:p-4 ${activeConv ? '' : 'hidden'} ${t.inputDock}`}>
            {attachedImage && (
              <div
                className={`mb-3 flex max-w-xs items-center justify-between rounded-md border p-2 ${t.attachPreview}`}
              >
                <div className="flex items-center gap-2.5">
                  <img src={attachedImage} alt="" className="h-10 w-10 rounded-sm object-cover" />
                  <span className={`text-[11px] font-medium ${t.attachText}`}>Photo attached</span>
                </div>
                <button
                  onClick={() => setAttachedImage(null)}
                  className={`rounded-xs p-1 transition-colors ${t.attachBtn}`}
                  aria-label="Remove attachment"
                >
                  <X size={15} />
                </button>
              </div>
            )}
            {showEmojiPicker && (
              <div
                className={`absolute bottom-[4.5rem] left-4 z-30 flex items-center gap-1 rounded-md border p-2 shadow-[var(--shadow-lift)] ${t.emojiPicker}`}
              >
                {quickEmojis.map((emoji, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputText((p) => p + emoji);
                      setShowEmojiPicker(false);
                    }}
                    className={`rounded-sm p-1.5 text-lg transition-all ${t.attachBtn}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
            <form onSubmit={handleSendMessage} className="flex items-center gap-1.5 sm:gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAttachImageSimulation}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`rounded-md p-2.5 transition-all ${t.attachBtn}`}
                title="Attach image"
              >
                <Paperclip size={17} />
              </button>
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`hidden rounded-md p-2.5 transition-all sm:block ${
                  showEmojiPicker ? t.emojiBtnActive : t.emojiBtn
                }`}
                title="Emoji"
              >
                <Smile size={17} />
              </button>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputText}
                  onChange={handleInputChange}
                  placeholder={`Message ${activeConv?.name || 'the other party'}…`}
                  className={`h-10 w-full rounded-md border px-3.5 text-xs outline-hidden transition-all ${t.inputField}`}
                />
              </div>
              <Button
                type="submit"
                size="default"
                icon={Send}
                disabled={sending || (!inputText.trim() && !attachedImage)}
                className={`h-10 min-w-[88px] rounded-md px-4 text-xs disabled:opacity-100 ${t.sendBtn}`}
              >
                {sending ? 'Sending…' : 'Send'}
              </Button>
            </form>
          </div>
        </div>

        {/* ===== INFO SLIDE-OVER ===== */}
        {showInfoSidebar && (
          <div
            className={`z-20 flex w-80 animate-fade-in flex-col justify-between border-l p-6 ${t.infoPanel}`}
          >
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h3 className={`text-[13px] font-medium ${t.infoPanelHdr}`}>Details</h3>
                <button
                  onClick={() => setShowInfoSidebar(false)}
                  className={`rounded-md p-1.5 transition-colors ${t.infoPanelX}`}
                  aria-label="Close details"
                >
                  <X size={16} />
                </button>
              </div>
              <div className={`border-b pb-6 text-center ${t.infoPanelBorder}`}>
                <img
                  src={activeConv?.avatar}
                  alt={activeConv?.name}
                  className="mx-auto mb-3 h-20 w-20 rounded-lg border border-hairline object-cover"
                />
                <h4 className={`font-display text-[1.35rem] leading-tight ${t.infoPanelHdr}`}>
                  {activeConv?.name}
                </h4>
                <span
                  className={`mt-2 inline-block rounded-pill border px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em] ${t.infoPanelPill}`}
                >
                  {activeConv?.role}
                </span>
                <div className="mt-3 flex items-center justify-center gap-2 text-[11px] font-medium">
                  <span className="flex items-center gap-1 text-accent-amber">
                    <Star size={12} className="fill-accent-amber" /> {activeConv?.rating || 4.9}
                  </span>
                  <span className={t.subtitleColor}>•</span>
                  <span className="text-accent-teal">Verified</span>
                </div>
              </div>
              <div className={`space-y-4 border-b py-6 text-[11px] ${t.infoPanelBorder}`}>
                {[
                  { Icon: MapPin, label: 'Service area', value: 'Koramangala & Indiranagar' },
                  { Icon: ShieldCheck, label: 'Verification', value: 'Govt ID & police verified' },
                  { Icon: Clock, label: 'Response time', value: 'Under 5 minutes' },
                ].map(({ Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <Icon size={15} className={`mt-0.5 shrink-0 ${t.infoPanelIcon}`} />
                    <div>
                      <span className={`block ${t.infoPanelMeta}`}>{label}</span>
                      <span className={`font-medium ${t.infoPanelVal}`}>{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => navigate(isProvider ? '/provider/bookings' : '/providers')}
              >
                {isProvider ? 'View bookings' : 'View profile'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ===== VOICE CALL MODAL ===== */}
      {activeCallModal === 'voice' && (
        <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-[#141413]/75 p-4 backdrop-blur-xl">
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-surface-dark p-8 text-center text-on-dark shadow-[var(--shadow-dark)]">
            <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-coral/22 blur-[80px]" />
            <div className="relative">
              <div className="relative mb-5 inline-block">
                <img
                  src={activeConv?.avatar}
                  alt=""
                  className="h-24 w-24 rounded-full border border-white/15 object-cover"
                />
                <span className="absolute -bottom-1 -right-1 h-4 w-4 animate-ping rounded-full border-2 border-surface-dark bg-accent-teal" />
              </div>
              <h3 className="font-display text-[1.7rem] leading-tight text-on-dark">
                {activeConv?.name}
              </h3>
              <span className="mt-1 block text-[10px] uppercase tracking-[0.16em] text-on-dark-soft">
                {activeConv?.role}
              </span>
              <div className="my-6">
                <div className="font-mono text-2xl font-medium tabular-nums text-accent-teal-bright">
                  {formatCallTime(callDuration)}
                </div>
                <span className="mt-1 block text-[10px] uppercase tracking-[0.14em] text-on-dark-soft">
                  HD voice · Encrypted
                </span>
              </div>
              <div className="mb-8 flex h-8 items-center justify-center gap-1.5">
                {[6, 14, 24, 18, 28, 12, 22, 10, 26, 16].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${h}px` }}
                    className="w-1 animate-pulse rounded-full bg-coral/70"
                  />
                ))}
              </div>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setIsCallMuted(!isCallMuted)}
                  className={`rounded-full p-4 transition-all active:scale-95 ${
                    isCallMuted
                      ? 'bg-accent-amber text-[#141413]'
                      : 'bg-white/8 text-on-dark hover:bg-white/12'
                  }`}
                  aria-label={isCallMuted ? 'Unmute' : 'Mute'}
                >
                  {isCallMuted ? <MicOff size={19} /> : <Mic size={19} />}
                </button>
                <button
                  onClick={() => setActiveCallModal(null)}
                  className="rounded-full bg-destructive p-4 text-destructive-foreground shadow-lg shadow-destructive/25 transition-transform active:scale-95"
                  aria-label="End call"
                >
                  <PhoneOff size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== VIDEO CALL MODAL ===== */}
      {activeCallModal === 'video' && (
        <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-[#141413]/80 p-4 backdrop-blur-xl">
          <div className="relative flex h-[520px] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface-dark shadow-[var(--shadow-dark)]">
            <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-gradient-to-tr from-[#0f0e0d] via-[#241a17] to-[#0f0e0d]">
              <img
                src={activeConv?.avatar}
                alt=""
                className="h-full w-full object-cover opacity-70 brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f0e0d]/95 via-transparent to-[#0f0e0d]/45" />
              <div className="pointer-events-none absolute -left-16 top-10 h-56 w-56 rounded-full bg-coral/20 blur-[90px]" />
              <div className="absolute left-4 right-4 top-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2.5 rounded-md border border-white/10 bg-black/35 px-3 py-1.5 backdrop-blur-md">
                  <span className="h-1.5 w-1.5 animate-ping rounded-full bg-accent-teal" />
                  <span className="text-[11px] font-medium">{activeConv?.name}</span>
                  <span className="font-mono text-[11px] tabular-nums text-accent-teal-bright">
                    {formatCallTime(callDuration)}
                  </span>
                </div>
                <div className="rounded-xs bg-white/15 px-2 py-1 text-[9px] font-medium uppercase tracking-[0.1em] backdrop-blur-md">
                  HD 1080p
                </div>
              </div>
              <div className="absolute bottom-4 right-4 h-40 w-28 overflow-hidden rounded-md border border-white/20 bg-surface-dark-elevated shadow-[var(--shadow-dark)]">
                <img
                  src={
                    user?.avatar ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                  }
                  alt="You"
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-1.5 left-1.5 rounded-xs bg-black/60 px-1.5 py-0.5 text-[8px] font-medium text-white">
                  You
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 border-t border-white/8 bg-[#141312] p-4">
              <button
                onClick={() => setIsCallMuted(!isCallMuted)}
                className={`rounded-full p-3.5 transition-all active:scale-95 ${
                  isCallMuted
                    ? 'bg-accent-amber text-[#141413]'
                    : 'bg-white/8 text-on-dark hover:bg-white/12'
                }`}
                aria-label={isCallMuted ? 'Unmute' : 'Mute'}
              >
                {isCallMuted ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <button
                onClick={() => setActiveCallModal(null)}
                className="rounded-full bg-destructive p-3.5 text-destructive-foreground shadow-lg shadow-destructive/25 transition-transform active:scale-95"
                aria-label="End call"
              >
                <PhoneOff size={19} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
