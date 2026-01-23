import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { MessageCircle, Send, X, Trash2, AlertTriangle } from 'lucide-react';
import VoiceRecorder from '../common/VoiceRecorder';
import { AI_WELCOME_MSG } from '../../constants/roles';

const STORAGE_KEY = 'vendorify_chat_messages';

const readMessages = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const writeMessages = (messages) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
};

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

const formatTime = (iso) => {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

const getAssistantReply = async ({ text }) => {
  await new Promise((r) => setTimeout(r, 700));

  const lower = String(text || '').toLowerCase();
  if (lower.includes('error')) {
    throw new Error('Simulated network error');
  }

  if (lower.includes('order') || lower.includes('cart')) {
    return "You can open a vendor, add items to your cart, then place an order from the Cart screen. Want me to guide you step-by-step?";
  }

  if (lower.includes('pani') || lower.includes('puri')) {
    return "Try Raju's Pani Puri. Open the vendor, add items, and place your order. If you want it spicy, mention it in WhatsApp later.";
  }

  if (lower.includes('vendor') && (lower.includes('verify') || lower.includes('unverify'))) {
    return 'Admins can verify/unverify vendors from Admin → Vendors. Unverified vendors stay visible but ordering is disabled.';
  }

  return "Got it. Tell me what you're looking for (e.g., 'cheap tea', 'spicy snacks', 'closest vendor').";
};

const ChatBubble = memo(({ role, text, time }) => {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm border ${
          isUser
            ? 'bg-indigo-600 text-white border-indigo-600 rounded-br-md'
            : 'bg-white text-gray-800 border-gray-100 rounded-bl-md'
        }`}
      >
        <div>{text}</div>
        {time ? (
          <div className={`mt-1 text-[10px] ${isUser ? 'text-indigo-100' : 'text-gray-400'}`}>{time}</div>
        ) : null}
      </div>
    </div>
  );
});

ChatBubble.displayName = 'ChatBubble';

const TypingIndicator = memo(() => {
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm border bg-white text-gray-800 border-gray-100 rounded-bl-md">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
          <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:120ms]" />
          <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:240ms]" />
        </div>
      </div>
    </div>
  );
});

TypingIndicator.displayName = 'TypingIndicator';

const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef(null);

  const hasUnread = useMemo(() => {
    if (!open && messages.length > 1) {
      const lastMsg = messages[messages.length - 1];
      return lastMsg.role === 'ai';
    }
    return false;
  }, [messages, open]);

  useEffect(() => {
    const stored = readMessages();
    if (stored && stored.length) {
      setMessages(stored);
      return;
    }

    const seeded = [
      {
        id: makeId(),
        role: 'ai',
        text: AI_WELCOME_MSG,
        createdAt: new Date().toISOString(),
      },
    ];
    setMessages(seeded);
    writeMessages(seeded);
  }, []);

  useEffect(() => {
    writeMessages(messages);
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
    return () => clearTimeout(t);
  }, [messages, sending, open]);

  const preparedMessages = useMemo(
    () =>
      messages.map((m) => ({
        ...m,
        time: formatTime(m.createdAt),
      })),
    [messages]
  );

  const clearChat = useCallback(() => {
    const seeded = [
      {
        id: makeId(),
        role: 'ai',
        text: AI_WELCOME_MSG,
        createdAt: new Date().toISOString(),
      },
    ];
    setMessages(seeded);
    setError('');
  }, []);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    setError('');
    setSending(true);
    setInput('');

    const userMsg = {
      id: makeId(),
      role: 'user',
      text: trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const replyText = await getAssistantReply({ text: trimmed });
      const aiMsg = {
        id: makeId(),
        role: 'ai',
        text: replyText,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      setError(e?.message || 'Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  }, [input, sending]);

  const handleVoiceTranscript = useCallback((transcript) => {
    setInput((prev) => (prev ? `${prev} ${transcript}`.trim() : transcript.trim()));
  }, []);

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="w-[92vw] max-w-sm md:max-w-md lg:max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 bg-indigo-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle size={18} />
              <div className="font-semibold text-sm">Vendorify Assistant</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearChat}
                className="p-2 rounded-lg hover:bg-white/10"
                aria-label="Clear chat"
              >
                <Trash2 size={16} />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {error ? (
            <div className="px-4 py-3 bg-red-50 border-b border-red-100 text-red-700 text-sm flex items-start gap-2">
              <AlertTriangle size={16} className="mt-0.5" />
              <div className="flex-1">
                <div className="font-medium">Message failed</div>
                <div className="text-xs mt-0.5">{error}</div>
              </div>
              <button
                type="button"
                onClick={() => setError('')}
                className="text-xs font-semibold text-red-700 hover:underline"
              >
                Dismiss
              </button>
            </div>
          ) : null}

          <div className="h-[480px] max-h-[70vh] overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
            {preparedMessages.map((m) => (
              <ChatBubble key={m.id} role={m.role} text={m.text} time={m.time} />
            ))}
            {sending ? <TypingIndicator /> : null}
            <div ref={endRef} />
          </div>

          <div className="p-3 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2 p-3 border-t border-gray-100">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type or speak your message..."
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                disabled={sending}
              />
              <VoiceRecorder
                onTranscript={handleVoiceTranscript}
                disabled={sending}
                className="shrink-0"
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                className="p-2 rounded-lg bg-indigo-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
            <div className="mt-2 text-[11px] text-gray-500">
              Tip: press Enter to send (Shift+Enter for new line)
            </div>
          </div>
        </div>
      )}

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`h-14 w-14 rounded-2xl bg-indigo-600 text-white shadow-xl flex items-center justify-center hover:bg-indigo-700 relative ${
            hasUnread ? 'animate-pulse' : ''
          }`}
          aria-label="Open chatbot"
        >
          <MessageCircle size={22} />
          {hasUnread && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
          )}
        </button>
      )}
    </div>
  );
};

export default memo(ChatbotWidget);
