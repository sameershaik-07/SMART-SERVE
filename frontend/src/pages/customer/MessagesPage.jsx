import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Send, 
  User, 
  CheckCheck, 
  Check,
  Phone, 
  Video, 
  MoreVertical, 
  Sparkles, 
  Loader2, 
  AlertCircle,
  MessageSquare,
  Paperclip,
  Image as ImageIcon,
  Smile,
  Clock,
  MapPin,
  ShieldCheck,
  ArrowLeft,
  X,
  Mic,
  MicOff,
  Volume2,
  Calendar,
  ChevronRight,
  Star,
  ThumbsUp,
  Heart,
  Info,
  CheckCircle2,
  PhoneOff,
  Maximize2
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { 
  getConversationsApi, 
  createOrGetConversationApi, 
  getMessagesApi, 
  sendMessageApi, 
  markMessagesReadApi 
} from '../../api/chat';
import { getSocket } from '../../api/socket';

export const MessagesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetProviderId = searchParams.get('providerId');
  const targetProviderName = searchParams.get('name');
  const targetProviderAvatar = searchParams.get('avatar');
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
      ? (conv.provider?.category?.categoryName || 'Service Provider')
      : 'Customer';

    const lastMsg = conv.lastMessage || conv.messages?.[0]?.message || 'Conversation started';
    const timeFormatted = conv.lastMessageAt || conv.updatedAt
      ? new Date(conv.lastMessageAt || conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'Just now';

    return {
      id: conv.id,
      name: fallbackName,
      avatar: partnerUser.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
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
    const isMe = user ? (msg.senderId === user.id || msg.senderRole === user.role) : (msg.senderRole === 'CUSTOMER');
    const timeStr = msg.createdAt 
      ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : (msg.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    return {
      id: msg.id || Date.now(),
      isMe,
      senderRole: msg.senderRole,
      senderName: msg.sender?.name || (isMe ? 'You' : 'Provider'),
      text: msg.message || msg.text,
      time: timeStr,
      isRead: msg.isRead ?? true,
      image: msg.image || null,
    };
  };

  // 1. Initial load & query param handling
  useEffect(() => {
    let isMounted = true;

    const loadConversations = async () => {
      setLoadingConversations(true);
      setErrorMessage(null);

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // Demo mode without token
          if (targetProviderId) {
            const pId = Number(targetProviderId);
            const exists = defaultConversations.find(c => c.id === pId);
            if (!exists && targetProviderName) {
              const newConv = {
                id: pId,
                name: decodeURIComponent(targetProviderName),
                avatar: targetProviderAvatar ? decodeURIComponent(targetProviderAvatar) : 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
                lastMessage: 'Conversation opened',
                time: 'Just now',
                unread: 0,
                role: 'Verified Service Provider',
                rating: 4.9,
                online: true,
                booking: targetBookingId ? { id: Number(targetBookingId), service: 'Scheduled Service' } : null,
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
          setLoadingConversations(false);
          return;
        }

        // Live API call
        const res = await getConversationsApi();
        const convList = res.conversations || [];
        const formattedList = convList.map(formatConversation);

        if (!isMounted) return;

        let selectedId = null;

        if (targetProviderId) {
          const provId = Number(targetProviderId);
          const existing = convList.find(c => c.providerId === provId || c.provider?.userId === provId);

          if (existing) {
            selectedId = existing.id;
            setConversations(formattedList);
          } else {
            try {
              const createRes = await createOrGetConversationApi(provId, targetBookingId);
              if (createRes.conversation) {
                const formattedNew = formatConversation(createRes.conversation);
                const updated = [
                  formattedNew, 
                  ...formattedList.filter(c => c.id !== formattedNew.id)
                ];
                setConversations(updated);
                selectedId = formattedNew.id;
              }
            } catch (err) {
              console.warn('Could not create conversation, fallback to first:', err);
              setConversations(formattedList.length > 0 ? formattedList : defaultConversations);
              selectedId = formattedList[0]?.id || 1;
            }
          }
        } else {
          setConversations(formattedList.length > 0 ? formattedList : defaultConversations);
          selectedId = formattedList.length > 0 ? formattedList[0].id : 1;
        }

        setActiveChatId(selectedId);
      } catch (err) {
        console.warn('Backend conversations unavailable, using default demo:', err);
        setConversations(defaultConversations);
        setActiveChatId(targetProviderId ? Number(targetProviderId) : 1);
      } finally {
        if (isMounted) setLoadingConversations(false);
      }
    };

    loadConversations();

    return () => {
      isMounted = false;
    };
  }, [targetProviderId, targetProviderName, targetProviderAvatar, targetBookingId, user]);

  // 2. Fetch messages & Socket subscription
  useEffect(() => {
    if (!activeChatId) return;

    let isMounted = true;
    setLoadingMessages(true);

    const loadMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          const savedHistory = localStorage.getItem('servicehub_chat_history');
          let history = defaultMessagesByChat;
          if (savedHistory) {
            try { history = JSON.parse(savedHistory); } catch {}
          }
          const chatMsgs = history[activeChatId] || [
            { id: 1, senderRole: 'PROVIDER', text: 'Hello! How can I assist you with your service today?', time: 'Just now' }
          ];
          if (isMounted) {
            setMessages(chatMsgs.map(formatMessage));
            setLoadingMessages(false);
          }
          return;
        }

        const res = await getMessagesApi(activeChatId);
        if (isMounted) {
          const apiMsgs = res.messages || [];
          setMessages(apiMsgs.map(formatMessage));
          markMessagesReadApi(activeChatId).catch(() => {});
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
            const isMe = user ? (msg.senderId === user.id || msg.senderRole === user.role) : (msg.senderRole === 'CUSTOMER');
            if (isMe) {
              const optIdx = prev.findIndex((m) => m.isMe && m.text === (msg.message || msg.text) && typeof m.id === 'number' && m.id > 1000000000000);
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
                  time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
  }, [activeChatId, user]);

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

    const currentTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
        c.id === activeChatId
          ? { ...c, lastMessage: messageToSend, time: 'Just now' }
          : c
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
          try { history = JSON.parse(savedHistory); } catch {}
        }
        const updatedChat = [...(history[activeChatId] || []), { id: tempId, senderRole: 'CUSTOMER', text: messageToSend, time: currentTimeStr }];
        localStorage.setItem('servicehub_chat_history', JSON.stringify({ ...history, [activeChatId]: updatedChat }));

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
    const matchesSearch = c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (activeTab === 'unread') return c.unread > 0;
    if (activeTab === 'bookings') return !!c.booking;
    return true;
  });

  const quickPrompts = [
    { label: "⏱️ What is your ETA?", text: "Hi! What is your estimated time of arrival?" },
    { label: "📍 Share location", text: "I have shared my confirmed service address." },
    { label: "🚪 I am at home", text: "I am at home and available whenever you arrive." },
    { label: "📞 Call upon arrival", text: "Please give me a quick ring when you reach the gate." },
    { label: "🛠️ Extra tools required", text: "Do you require any specific spare parts for inspection?" },
  ];

  const quickEmojis = ['👍', '👋', '🙏', '✨', '😊', '✅', '❤️', '👌'];

  // ── Theme config: dark for provider, light for customer ──────────────────
  const isProvider = user?.role === 'PROVIDER';
  const t = isProvider
    ? {
        // Provider dark navy theme
        shell:        'bg-[#0f172a] border-slate-800',
        sidebar:      'bg-[#141b2d] border-slate-800/80',
        sidebarHdr:   'bg-[#141b2d] border-slate-800',
        iconBg:       'bg-emerald-600',
        titleColor:   'text-white',
        subtitleColor:'text-slate-400',
        threadsBadge: 'bg-slate-800 text-emerald-400 border-slate-700',
        searchBg:     'bg-slate-800/70 border-transparent focus:border-emerald-500 focus:bg-slate-800 text-white placeholder:text-slate-500',
        tabBar:       'bg-slate-800/60',
        tabActive:    'bg-slate-700 text-emerald-400 shadow-xs',
        tabInactive:  'text-slate-500 hover:text-slate-200',
        listDivide:   'divide-slate-800/50',
        convActive:   'bg-slate-800 border-emerald-500/30 ring-1 ring-emerald-500/20',
        convInactive: 'hover:bg-slate-800/60 border-transparent hover:border-slate-700/50',
        convAccent:   'bg-gradient-to-b from-emerald-500 to-teal-500',
        imgBorder:    'border-slate-700',
        onlineDot:    'border-slate-800',
        nameActive:   'text-emerald-100',
        nameInactive: 'text-slate-200',
        rolePill:     'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        lastMsg:      'text-slate-400',
        lastMsgActive:'text-slate-200',
        unreadBadge:  'bg-emerald-500 text-white',
        footer:       'bg-[#141b2d]/80 border-slate-800',
        mainPanel:    'bg-[#0f172a]',
        chatHdr:      'bg-[#141b2d]/95 border-slate-800/80',
        avatarBorder: 'border-emerald-500/30',
        nameHdr:      'text-white',
        roleHdrPill:  'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        onlineText:   'text-emerald-400',
        callSegment:  'bg-slate-800/90 border-slate-700/80',
        callBtn:      'text-slate-300 hover:text-emerald-400 hover:bg-slate-700',
        callIcon:     'text-emerald-400',
        bookingBtn:   'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30',
        infoBtn:      'text-slate-400 hover:text-emerald-400 hover:bg-slate-800 border-slate-700 bg-slate-800/50',
        infoBtnActive:'bg-emerald-600 text-white border-emerald-600',
        pinBar:       'bg-emerald-900/20 border-emerald-800/30 text-emerald-300',
        pinBtn:       'text-emerald-400 hover:text-emerald-200',
        errorBar:     'bg-red-950/50 text-red-400 border-red-900/40',
        msgStream:    'bg-[#0a0f1e]/60',
        encryptPill:  'text-slate-500 bg-slate-800/80 border-slate-700/60',
        loaderColor:  'text-emerald-500',
        emptyIcon:    'bg-emerald-500/10 text-emerald-400',
        emptyTitle:   'text-slate-200',
        emptyText:    'text-slate-500',
        theirBubble:  'bg-slate-800 text-slate-100 border-slate-700/60',
        myBubble:     'bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-emerald-600/20',
        readCheck:    'text-emerald-400',
        typingBubble: 'bg-slate-800 border-slate-700/80',
        typingDot:    'bg-emerald-500',
        typingText:   'text-slate-400',
        quickBar:     'bg-[#141b2d] border-slate-800',
        quickLabel:   'text-slate-500',
        quickChip:    'bg-slate-800/80 hover:bg-emerald-500/10 text-slate-300 hover:text-emerald-300 border-slate-700/50 hover:border-emerald-500/30',
        inputDock:    'bg-[#141b2d] border-slate-800',
        attachPreview:'bg-emerald-900/30 border-emerald-700/50',
        attachText:   'text-emerald-200',
        emojiPicker:  'bg-slate-800 border-slate-700',
        attachBtn:    'text-slate-500 hover:text-emerald-400 hover:bg-slate-800',
        emojiBtn:     'text-slate-500 hover:text-emerald-400 hover:bg-slate-800',
        emojiBtnActive:'text-emerald-400 bg-slate-800',
        inputField:   'bg-slate-800/60 focus:bg-slate-800 border-slate-700 focus:border-emerald-500 text-slate-100 placeholder:text-slate-500 shadow-none',
        sendBtn:      'shadow-emerald-600/20',
        infoPanel:    'bg-[#141b2d] border-slate-800',
        infoPanelHdr: 'text-white',
        infoPanelX:   'text-slate-500 hover:text-slate-200 hover:bg-slate-800',
        infoPanelBorder:'border-slate-800',
        infoPanelPill:'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        infoPanelMeta:'text-slate-500',
        infoPanelVal: 'text-slate-200',
        infoPanelIcon:'text-emerald-500',
      }
    : {
        // Customer light purple theme (original)
        shell:        'bg-white border-slate-200/90',
        sidebar:      'bg-slate-50/70 border-slate-200/80',
        sidebarHdr:   'bg-white border-slate-100',
        iconBg:       'bg-gradient-to-tr from-purple-600 to-indigo-600',
        titleColor:   'text-slate-900',
        subtitleColor:'text-slate-400',
        threadsBadge: 'bg-purple-100/70 text-purple-700 border-purple-200/50',
        searchBg:     'bg-slate-100/70 border-transparent focus:border-purple-500 focus:bg-white text-slate-900 placeholder:text-slate-400',
        tabBar:       'bg-slate-100/70',
        tabActive:    'bg-white text-purple-700 shadow-xs',
        tabInactive:  'text-slate-500 hover:text-slate-900',
        listDivide:   'divide-slate-100/70',
        convActive:   'bg-white shadow-md shadow-purple-900/5 border-purple-100/90 ring-1 ring-purple-500/20',
        convInactive: 'hover:bg-white/80 border-transparent hover:border-slate-200/50',
        convAccent:   'bg-gradient-to-b from-purple-600 to-indigo-600',
        imgBorder:    'border-slate-200/80',
        onlineDot:    'border-white',
        nameActive:   'text-purple-950',
        nameInactive: 'text-slate-900',
        rolePill:     'text-purple-700 bg-purple-50 border-purple-100/70',
        lastMsg:      'text-slate-500',
        lastMsgActive:'text-slate-700',
        unreadBadge:  'bg-purple-600 text-white',
        footer:       'bg-white/70 border-slate-100',
        mainPanel:    'bg-white',
        chatHdr:      'bg-white/95 border-slate-200/80',
        avatarBorder: 'border-purple-100',
        nameHdr:      'text-slate-900',
        roleHdrPill:  'text-purple-700 bg-purple-50 border-purple-100',
        onlineText:   'text-emerald-600',
        callSegment:  'bg-slate-100/90 border-slate-200/80',
        callBtn:      'text-slate-700 hover:text-purple-700 hover:bg-white',
        callIcon:     'text-purple-600',
        bookingBtn:   'text-purple-700 bg-purple-50 hover:bg-purple-100 border-purple-200/80',
        infoBtn:      'text-slate-600 hover:text-purple-700 hover:bg-purple-50 border-slate-200/70 bg-white',
        infoBtnActive:'bg-purple-600 text-white border-purple-600',
        pinBar:       'bg-gradient-to-r from-purple-50/90 to-indigo-50/70 border-purple-100/60 text-slate-700',
        pinBtn:       'text-purple-700 hover:text-purple-900',
        errorBar:     'bg-red-50 text-red-700 border-red-100',
        msgStream:    'bg-slate-50/40',
        encryptPill:  'text-slate-500 bg-white border-slate-200/90',
        loaderColor:  'text-purple-600',
        emptyIcon:    'bg-purple-50 text-purple-600',
        emptyTitle:   'text-slate-800',
        emptyText:    'text-slate-400',
        theirBubble:  'bg-white text-slate-800 border-slate-200/90',
        myBubble:     'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-purple-600/20',
        readCheck:    'text-purple-600',
        typingBubble: 'bg-white border-slate-200/80',
        typingDot:    'bg-purple-500',
        typingText:   'text-slate-500',
        quickBar:     'bg-white border-slate-100',
        quickLabel:   'text-slate-400',
        quickChip:    'bg-slate-100/80 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border-slate-200/50 hover:border-purple-200',
        inputDock:    'bg-white border-slate-100',
        attachPreview:'bg-purple-50 border-purple-200',
        attachText:   'text-purple-900',
        emojiPicker:  'bg-white border-slate-200',
        attachBtn:    'text-slate-400 hover:text-purple-600 hover:bg-purple-50',
        emojiBtn:     'text-slate-400 hover:text-purple-600 hover:bg-purple-50',
        emojiBtnActive:'text-purple-600 bg-purple-50',
        inputField:   'bg-slate-50 focus:bg-white border-slate-200 focus:border-purple-600 text-slate-900 placeholder:text-slate-400 shadow-inner',
        sendBtn:      'shadow-purple-600/20',
        infoPanel:    'bg-white border-slate-100',
        infoPanelHdr: 'text-slate-900',
        infoPanelX:   'text-slate-400 hover:text-slate-700 hover:bg-slate-100',
        infoPanelBorder:'border-slate-100',
        infoPanelPill:'text-purple-700 bg-purple-50 border-purple-100',
        infoPanelMeta:'text-slate-400',
        infoPanelVal: 'text-slate-800',
        infoPanelIcon:'text-purple-600',
      };

  return (
    <div className="h-[calc(100vh-6rem)] max-w-7xl mx-auto flex flex-col animate-fade-in">
      {/* Outer Shell */}
      <div className={`flex-1 rounded-3xl border shadow-2xl flex overflow-hidden relative ${t.shell}`}>

        {/* ===== LEFT SIDEBAR ===== */}
        <div className={`w-full md:w-80 lg:w-[330px] shrink-0 border-r flex flex-col z-20 ${t.sidebar} ${showMobileList ? 'flex' : 'hidden md:flex'}`}>
          {/* Header */}
          <div className={`p-5 border-b ${t.sidebarHdr}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md ${t.iconBg}`}>
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h1 className={`text-xl font-black tracking-tight ${t.titleColor}`}>Messages</h1>
                  <p className={`text-[11px] font-semibold ${t.subtitleColor}`}>Direct consultation</p>
                </div>
              </div>
              <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${t.threadsBadge}`}>
                {conversations.length} Threads
              </span>
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${t.subtitleColor}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                className={`w-full rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium outline-none transition-all border ${t.searchBg}`}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className={`absolute right-3 top-1/2 -translate-y-1/2 ${t.subtitleColor} hover:opacity-80 p-0.5`}>
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className={`flex items-center gap-1.5 mt-3.5 p-1 rounded-xl ${t.tabBar}`}>
              {[{ id: 'all', label: 'All Chats' }, { id: 'unread', label: 'Unread' }, { id: 'bookings', label: 'Bookings' }].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab.id ? t.tabActive : t.tabInactive}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations List */}
          <div className={`flex-1 overflow-y-auto divide-y p-2 space-y-1 ${t.listDivide}`}>
            {loadingConversations ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Loader2 size={26} className={`animate-spin ${t.loaderColor}`} />
                <span className={`text-xs font-semibold ${t.subtitleColor}`}>Loading conversations...</span>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="py-16 text-center px-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 ${t.emptyIcon}`}>
                  <Search size={22} />
                </div>
                <h4 className={`text-xs font-bold ${t.emptyTitle}`}>No conversations found</h4>
                <p className={`text-[11px] mt-1 ${t.subtitleColor}`}>Try searching with a different keyword.</p>
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isActive = activeChatId === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelectConversation(c.id)}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all flex items-start gap-3.5 relative group border ${isActive ? t.convActive : t.convInactive}`}
                  >
                    {isActive && <span className={`absolute left-1 top-4 bottom-4 w-1 rounded-full ${t.convAccent}`} />}
                    <div className="relative shrink-0">
                      <img src={c.avatar} alt={c.name} className={`w-12 h-12 rounded-2xl object-cover border shadow-xs ${t.imgBorder}`} />
                      {c.online && <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 rounded-full ${t.onlineDot}`} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-1.5 truncate">
                          <h4 className={`text-xs font-black truncate ${isActive ? t.nameActive : t.nameInactive}`}>{c.name}</h4>
                          <CheckCircle2 size={13} className="text-blue-500 fill-blue-500 stroke-white shrink-0" />
                        </div>
                        <span className={`text-[10px] font-bold shrink-0 ml-1 ${t.subtitleColor}`}>{c.time}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border inline-block ${t.rolePill}`}>{c.role}</span>
                        {c.booking && <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100/80 truncate">Booking #{c.booking.id}</span>}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs truncate ${isActive ? t.lastMsgActive : t.lastMsg} ${isActive ? 'font-medium' : 'font-normal'}`}>{c.lastMessage}</p>
                        {c.unread > 0 && <span className={`shrink-0 w-4.5 h-4.5 rounded-full text-[10px] font-black flex items-center justify-center ${t.unreadBadge}`}>{c.unread}</span>}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className={`p-3.5 border-t text-center ${t.footer}`}>
            <span className={`text-[10px] font-bold flex items-center justify-center gap-1.5 ${t.subtitleColor}`}>
              <ShieldCheck size={13} className="text-emerald-500" /> ServiceHub Safe Consultation Guarantee
            </span>
          </div>
        </div>

        {/* ===== RIGHT MAIN PANEL ===== */}
        <div className={`flex-1 flex flex-col h-full overflow-hidden ${t.mainPanel} ${showMobileList ? 'hidden md:flex' : 'flex'}`}>
          {/* Chat Header */}
          <div className={`px-5 py-3.5 border-b flex items-center justify-between backdrop-blur-md z-10 shadow-xs gap-3 ${t.chatHdr}`}>
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button type="button" onClick={() => setShowMobileList(true)} className={`md:hidden p-2 -ml-1 rounded-xl transition-colors shrink-0 ${t.callBtn}`} title="Back">
                <ArrowLeft size={18} />
              </button>
              <div className="relative shrink-0">
                <img src={activeConv?.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80'} alt={activeConv?.name} className={`w-11 h-11 rounded-2xl object-cover border shadow-xs ${t.avatarBorder}`} />
                <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 rounded-full ${t.onlineDot}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className={`text-sm sm:text-base font-extrabold truncate tracking-tight ${t.nameHdr}`}>{activeConv?.name || 'Conversation'}</h3>
                  <CheckCircle2 size={16} className="text-blue-500 fill-blue-500 stroke-white shrink-0" />
                  {activeConv?.role && <span className={`hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${t.roleHdrPill}`}>{activeConv.role}</span>}
                </div>
                <div className={`flex items-center gap-2 mt-0.5 text-[11px] ${t.subtitleColor}`}>
                  <span className={`font-bold flex items-center gap-1 shrink-0 ${t.onlineText}`}><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Online</span>
                  <span className="text-slate-400">•</span>
                  <span className="truncate hidden md:inline">Replies in ~5m</span>
                  <span className="text-slate-400 hidden md:inline">•</span>
                  <span className="font-semibold flex items-center gap-1 text-amber-500 shrink-0"><Star size={12} className="fill-amber-400 text-amber-400" /> {activeConv?.rating || 4.9}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className={`flex items-center p-1 rounded-2xl border shadow-xs ${t.callSegment}`}>
                <button type="button" onClick={() => setActiveCallModal('voice')} className={`px-2.5 py-1.5 rounded-xl transition-all font-bold text-xs flex items-center gap-1.5 active:scale-95 cursor-pointer ${t.callBtn}`} title="Voice Call">
                  <Phone size={15} className={`shrink-0 ${t.callIcon}`} /><span className="hidden sm:inline">Call</span>
                </button>
                <div className="w-[1px] h-4 bg-slate-400/30 mx-0.5" />
                <button type="button" onClick={() => setActiveCallModal('video')} className={`px-2.5 py-1.5 rounded-xl transition-all font-bold text-xs flex items-center gap-1.5 active:scale-95 cursor-pointer ${t.callBtn}`} title="Video Call">
                  <Video size={15} className={`shrink-0 ${t.callIcon}`} /><span className="hidden sm:inline">Video</span>
                </button>
              </div>
              {activeConv?.booking && (
                <button type="button" onClick={() => navigate(`/bookings/${activeConv.booking.id}`)} className={`hidden xl:flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-2xl border transition-all cursor-pointer active:scale-95 ${t.bookingBtn}`}>
                  <Calendar size={14} className="shrink-0" /><span>#{activeConv.booking.id}</span>
                </button>
              )}
              <button type="button" onClick={() => setShowInfoSidebar(!showInfoSidebar)} className={`p-2 rounded-2xl transition-all border cursor-pointer active:scale-95 ${showInfoSidebar ? t.infoBtnActive : t.infoBtn}`} title="Info">
                <Info size={17} />
              </button>
            </div>
          </div>

          {/* Booking Pin Bar */}
          {activeConv?.booking && (
            <div className={`px-6 py-2 border-b flex items-center justify-between text-xs ${t.pinBar}`}>
              <div className="flex items-center gap-2 font-medium">
                <span className="w-2 h-2 rounded-full bg-current opacity-60" />
                <span>Active Booking: <strong>{activeConv.booking.service || 'Home Service'}</strong></span>
              </div>
              <button onClick={() => navigate(`/bookings/${activeConv.booking.id}`)} className={`font-bold flex items-center gap-1 transition-colors ${t.pinBtn}`}>
                Track <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className={`px-6 py-2 text-xs flex items-center justify-between border-b ${t.errorBar}`}>
              <div className="flex items-center gap-2"><AlertCircle size={15} /><span>{errorMessage}</span></div>
              <button onClick={() => setErrorMessage(null)}><X size={14} /></button>
            </div>
          )}

          {/* Message Stream */}
          <div className={`flex-1 p-6 overflow-y-auto space-y-4 relative ${t.msgStream}`}>
            <div className="text-center py-2">
              <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase font-black tracking-wider px-3.5 py-1.5 rounded-full border ${t.encryptPill}`}>
                <ShieldCheck size={13} className="text-emerald-500" /> End-to-End Encrypted
              </span>
            </div>

            {loadingMessages ? (
              <div className="py-24 flex flex-col items-center justify-center gap-2">
                <Loader2 size={28} className={`animate-spin ${t.loaderColor}`} />
                <span className={`text-xs font-semibold ${t.subtitleColor}`}>Loading messages...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-3 shadow-inner ${t.emptyIcon}`}><Sparkles size={28} /></div>
                <h4 className={`text-sm font-bold ${t.emptyTitle}`}>Start the Conversation</h4>
                <p className={`text-xs max-w-sm mt-1 ${t.emptyText}`}>Send your first message to {activeConv?.name}.</p>
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`flex flex-col group ${m.isMe ? 'items-end' : 'items-start'}`}>
                  {!m.isMe && <span className={`text-[10px] font-bold mb-1 px-1 ${t.subtitleColor}`}>{m.senderName}</span>}
                  <div className="flex items-end gap-2 max-w-md md:max-w-lg">
                    <div className={`p-4 rounded-2xl text-xs font-medium leading-relaxed transition-all border ${m.isMe ? `${t.myBubble} shadow-md rounded-br-xs border-transparent` : `${t.theirBubble} rounded-bl-xs shadow-xs`}`}>
                      {m.image && <div className="mb-2.5 rounded-xl overflow-hidden border border-white/20 max-h-56"><img src={m.image} alt="Attachment" className="w-full h-full object-cover" /></div>}
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 mt-1 px-1 text-[10px] font-semibold ${t.subtitleColor}`}>
                    <span>{m.time}</span>
                    {m.isMe && (m.isRead ? <CheckCheck size={14} className={t.readCheck} /> : <Check size={13} className={t.subtitleColor} />)}
                  </div>
                </div>
              ))
            )}

            {isTyping && (
              <div className={`flex items-center gap-2 border px-4 py-2.5 rounded-2xl rounded-bl-none w-max animate-pulse ${t.typingBubble}`}>
                <span className={`w-2 h-2 rounded-full animate-bounce ${t.typingDot}`} />
                <span className={`w-2 h-2 rounded-full animate-bounce delay-150 ${t.typingDot}`} />
                <span className={`w-2 h-2 rounded-full animate-bounce delay-300 ${t.typingDot}`} />
                <span className={`text-[11px] font-semibold ml-1 ${t.typingText}`}>{activeConv?.name} is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reply Chips */}
          <div className={`px-6 py-2 border-t flex items-center gap-2 overflow-x-auto no-scrollbar ${t.quickBar}`}>
            <span className={`text-[10px] uppercase font-extrabold shrink-0 ${t.quickLabel}`}>Quick replies:</span>
            {quickPrompts.map((chip, i) => (
              <button key={i} onClick={() => handleSendPrompt(chip.text)} className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${t.quickChip}`}>
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input Dock */}
          <div className={`p-4 border-t relative ${t.inputDock}`}>
            {attachedImage && (
              <div className={`mb-3 p-2 border rounded-2xl flex items-center justify-between max-w-xs ${t.attachPreview}`}>
                <div className="flex items-center gap-2.5">
                  <img src={attachedImage} alt="" className="w-10 h-10 rounded-xl object-cover" />
                  <span className={`text-xs font-bold ${t.attachText}`}>Photo Attached</span>
                </div>
                <button onClick={() => setAttachedImage(null)} className={`p-1 rounded-lg transition-colors ${t.attachBtn}`}><X size={16} /></button>
              </div>
            )}
            {showEmojiPicker && (
              <div className={`absolute bottom-20 left-6 border rounded-2xl p-2.5 shadow-xl flex items-center gap-1.5 z-30 ${t.emojiPicker}`}>
                {quickEmojis.map((emoji, idx) => (
                  <button key={idx} onClick={() => { setInputText((p) => p + emoji); setShowEmojiPicker(false); }} className={`text-lg p-1.5 rounded-xl transition-all ${t.attachBtn}`}>{emoji}</button>
                ))}
              </div>
            )}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2.5">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAttachImageSimulation} className="hidden" />
              <button type="button" onClick={() => fileInputRef.current?.click()} className={`p-2.5 rounded-2xl transition-all ${t.attachBtn}`} title="Attach image"><Paperclip size={18} /></button>
              <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`p-2.5 rounded-2xl transition-all ${showEmojiPicker ? t.emojiBtnActive : t.emojiBtn}`} title="Emoji"><Smile size={18} /></button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={handleInputChange}
                  placeholder={`Message ${activeConv?.name || 'the other party'}...`}
                  className={`w-full border rounded-2xl px-4 py-3 text-xs font-medium outline-none transition-all ${t.inputField}`}
                />
              </div>
              <Button type="submit" size="md" icon={Send} disabled={sending || (!inputText.trim() && !attachedImage)} className={`rounded-2xl px-5 shadow-md ${t.sendBtn}`}>
                {sending ? 'Sending...' : 'Send'}
              </Button>
            </form>
          </div>
        </div>

        {/* ===== INFO SLIDE-OVER ===== */}
        {showInfoSidebar && (
          <div className={`w-80 border-l p-6 flex flex-col justify-between animate-fade-in z-20 ${t.infoPanel}`}>
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-sm font-black ${t.infoPanelHdr}`}>Details</h3>
                <button onClick={() => setShowInfoSidebar(false)} className={`p-1.5 rounded-xl transition-colors ${t.infoPanelX}`}><X size={16} /></button>
              </div>
              <div className={`text-center pb-6 border-b ${t.infoPanelBorder}`}>
                <img src={activeConv?.avatar} alt={activeConv?.name} className="w-20 h-20 rounded-3xl object-cover border-2 border-current mx-auto mb-3 shadow-md opacity-90" />
                <h4 className={`text-base font-black ${t.infoPanelHdr}`}>{activeConv?.name}</h4>
                <span className={`text-xs font-bold px-3 py-0.5 rounded-full border mt-1 inline-block ${t.infoPanelPill}`}>{activeConv?.role}</span>
                <div className="flex items-center justify-center gap-2 mt-3 text-xs font-bold">
                  <span className="flex items-center gap-1 text-amber-500"><Star size={14} className="fill-amber-400" /> {activeConv?.rating || 4.9}</span>
                  <span className={t.subtitleColor}>•</span>
                  <span className="text-emerald-500">Verified</span>
                </div>
              </div>
              <div className={`space-y-4 py-6 text-xs border-b ${t.infoPanelBorder}`}>
                {[
                  { Icon: MapPin, label: 'Service Area', value: 'Koramangala & Indiranagar' },
                  { Icon: ShieldCheck, label: 'Verification', value: 'Govt ID & Police Verified' },
                  { Icon: Clock, label: 'Response Time', value: 'Under 5 minutes' },
                ].map(({ Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <Icon size={16} className={`shrink-0 mt-0.5 ${t.infoPanelIcon}`} />
                    <div>
                      <span className={`font-medium block ${t.infoPanelMeta}`}>{label}</span>
                      <span className={`font-bold ${t.infoPanelVal}`}>{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4">
              <Button variant="outline" size="sm" fullWidth onClick={() => navigate(isProvider ? '/provider/bookings' : '/providers')}>
                {isProvider ? 'View Bookings' : 'View Profile'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ===== VOICE CALL MODAL ===== */}
      {activeCallModal === 'voice' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 text-white w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl border border-slate-800 relative">
            <div className="relative inline-block mb-4">
              <img src={activeConv?.avatar} alt="" className="w-24 h-24 rounded-3xl object-cover border-4 border-purple-500/40 shadow-xl" />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-slate-900 rounded-full animate-ping" />
            </div>
            <h3 className="text-lg font-black">{activeConv?.name}</h3>
            <span className="text-xs text-purple-300 font-semibold">{activeConv?.role}</span>
            <div className="my-6">
              <div className="text-2xl font-black font-mono text-emerald-400">{formatCallTime(callDuration)}</div>
              <span className="text-[11px] text-slate-400 font-medium">HD Voice Connected</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 mb-8 h-8">
              {[6,14,24,18,28,12,22,10,26,16].map((h,i) => <span key={i} style={{height:`${h}px`}} className="w-1 bg-purple-400 rounded-full animate-pulse" />)}
            </div>
            <div className="flex items-center justify-center gap-5">
              <button onClick={() => setIsCallMuted(!isCallMuted)} className={`p-4 rounded-2xl transition-all ${isCallMuted ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                {isCallMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <button onClick={() => setActiveCallModal(null)} className="p-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 transition-transform active:scale-95">
                <PhoneOff size={22} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== VIDEO CALL MODAL ===== */}
      {activeCallModal === 'video' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-lg flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-slate-800 relative flex flex-col h-[520px]">
            <div className="flex-1 relative bg-gradient-to-tr from-slate-900 via-purple-950/40 to-slate-900 flex items-center justify-center overflow-hidden">
              <img src={activeConv?.avatar} alt="" className="w-full h-full object-cover opacity-80 filter brightness-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/40" />
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/10">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                  <span className="text-xs font-bold">{activeConv?.name}</span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">{formatCallTime(callDuration)}</span>
                </div>
                <div className="text-[10px] font-bold bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-xl">HD 1080p</div>
              </div>
              <div className="absolute bottom-4 right-4 w-32 h-44 rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl bg-slate-800">
                <img src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} alt="You" className="w-full h-full object-cover" />
                <span className="absolute bottom-2 left-2 text-[9px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded-md">You</span>
              </div>
            </div>
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-center gap-4">
              <button onClick={() => setIsCallMuted(!isCallMuted)} className={`p-3.5 rounded-2xl transition-all ${isCallMuted ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                {isCallMuted ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <button onClick={() => setActiveCallModal(null)} className="p-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 transition-transform active:scale-95">
                <PhoneOff size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
