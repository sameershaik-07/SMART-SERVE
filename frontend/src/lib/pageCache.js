// Lightweight in-memory cache for session-scoped page data
// Keys are per-user to avoid cross-user leakage
const userCaches = new Map(); // userId -> { providers, conversations, messages: { [convId]: [] } }

// Ongoing fetch promises to prevent duplicate background requests
const ongoing = new Map();

const getUserKey = (userId) => (userId ? String(userId) : 'anon');

const ensureUserCache = (userId) => {
  const k = getUserKey(userId);
  if (!userCaches.has(k)) {
    userCaches.set(k, { providers: null, conversations: null, messages: {} });
  }
  return userCaches.get(k);
};

export const getProviders = (userId) => ensureUserCache(userId).providers;
export const setProviders = (userId, list) => {
  const c = ensureUserCache(userId);
  c.providers = Array.isArray(list) ? list : [];
};

export const getConversations = (userId) => ensureUserCache(userId).conversations;
export const setConversations = (userId, list) => {
  const c = ensureUserCache(userId);
  c.conversations = Array.isArray(list) ? list : [];
};

export const getMessages = (userId, convId) => {
  const c = ensureUserCache(userId);
  return c.messages?.[convId] || null;
};
export const setMessages = (userId, convId, msgs) => {
  const c = ensureUserCache(userId);
  c.messages = c.messages || {};
  c.messages[convId] = Array.isArray(msgs) ? msgs : [];
};

export const clearUserCache = (userId) => {
  const k = getUserKey(userId);
  userCaches.delete(k);
};

// Helpers to prevent duplicate fetches
export const withOngoing = (key, fn) => {
  if (ongoing.has(key)) return ongoing.get(key);
  const p = (async () => {
    try {
      return await fn();
    } finally {
      ongoing.delete(key);
    }
  })();
  ongoing.set(key, p);
  return p;
};

// Merge helpers
export const mergeMessages = (existing = [], fresh = []) => {
  // Build map of fresh by id
  const freshById = new Map();
  for (const m of fresh) {
    if (m && m.id != null) freshById.set(String(m.id), m);
  }

  const result = [];
  // Start with fresh messages (canonical)
  for (const m of fresh) result.push(m);

  // Append existing optimistic messages that are not represented in fresh
  for (const e of existing) {
    if (e == null) continue;
    const eid = String(e.id);
    // If existing id is present in fresh, skip (duplicate)
    if (freshById.has(eid)) continue;

    // If existing is optimistic (large numeric temp id), try to detect replacement
    const isTemp = typeof e.id === 'number' && e.id > 1e12;
    if (isTemp) {
      // If any fresh message has same text and same senderRole, consider it replaced
      const replaced = fresh.some(f => (f.message || f.text) === (e.text || e.message) && f.senderRole === e.senderRole);
      if (replaced) continue;
    }

    // Otherwise keep the existing message (likely real-time new)
    result.push(e);
  }

  // Sort by createdAt if available, else by id
  result.sort((a, b) => {
    const ta = a?.createdAt ? new Date(a.createdAt).getTime() : (a?.id || 0);
    const tb = b?.createdAt ? new Date(b.createdAt).getTime() : (b?.id || 0);
    return ta - tb;
  });
  return result;
};

export const mergeConversations = (existing = [], fresh = []) => {
  const byId = new Map();
  for (const c of existing) byId.set(String(c.id), c);
  for (const c of fresh) {
    const id = String(c.id);
    if (!byId.has(id)) {
      byId.set(id, c);
    } else {
      const prev = byId.get(id);
      // prefer newer lastMessageAt/updatedAt
      const prevTime = prev.lastMessageAt ? new Date(prev.lastMessageAt).getTime() : (prev.updatedAt ? new Date(prev.updatedAt).getTime() : 0);
      const newTime = c.lastMessageAt ? new Date(c.lastMessageAt).getTime() : (c.updatedAt ? new Date(c.updatedAt).getTime() : 0);
      if (newTime >= prevTime) {
        byId.set(id, { ...prev, ...c });
      } else {
        // keep prev, but ensure lastMessage is preserved if newer
        byId.set(id, prev);
      }
    }
  }
  // Return array preserving original sort: use fresh order when possible, otherwise prev order
  const final = [];
  for (const c of fresh) final.push(byId.get(String(c.id)));
  for (const c of existing) if (!fresh.some(f => String(f.id) === String(c.id))) final.push(byId.get(String(c.id)));
  return final;
};

export default {
  getProviders,
  setProviders,
  getConversations,
  setConversations,
  getMessages,
  setMessages,
  clearUserCache,
  withOngoing,
  mergeMessages,
  mergeConversations,
};
