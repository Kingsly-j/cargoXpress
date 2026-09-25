"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { watchMessages, watchSupportPresence, sendChatMessage, type ChatMessage, type SupportChat } from "@/lib/customer-communications";

const CHAT_ID_KEY = "cargoxpress-support-chat";
const SESSION_KEY = "cargoxpress-visitor-session";

function getPersistentValue(storage: Storage, key: string) {
  try {
    const saved = storage.getItem(key);
    if (saved) return saved;
    const next = crypto.randomUUID();
    storage.setItem(key, next);
    return next;
  } catch { return crypto.randomUUID(); }
}

function timeLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function LiveChat({ embedded = false }: { embedded?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [chatId, setChatId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [online, setOnline] = useState(false);
  const [name, setName] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  function toggleChat(nextOpen: boolean) {
    setOpen(nextOpen);
    if (embedded && window.parent !== window) {
      window.parent.postMessage({ source: "cargoxpress-live-chat", open: nextOpen }, window.location.origin);
    }
  }

  useEffect(() => {
    const init = window.setTimeout(() => {
      setChatId(getPersistentValue(window.localStorage, CHAT_ID_KEY));
      setSessionId(getPersistentValue(window.sessionStorage, SESSION_KEY));
      try { setName(window.localStorage.getItem("cargoxpress-chat-name") || ""); } catch { /* Optional convenience only. */ }
    }, 0);
    const unsubscribe = watchSupportPresence(setOnline);
    return () => { window.clearTimeout(init); unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!chatId) return;
    return watchMessages(chatId, setMessages);
  }, [chatId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, open]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !sessionId || sending) return;
    setSending(true);
    setError("");
    const id = chatId || crypto.randomUUID();
    const visitorName = name.trim().slice(0, 60) || "Guest";
    const now = new Date().toISOString();
    const metadata: Omit<SupportChat, "id"> = {
      visitorSession: sessionId,
      visitorName,
      status: "open",
      lastMessage: text,
      updatedAt: now,
      createdAt: now,
    };
    try {
      await sendChatMessage(id, metadata, "visitor", text, visitorName);
      setChatId(id);
      try { window.localStorage.setItem(CHAT_ID_KEY, id); window.localStorage.setItem("cargoxpress-chat-name", visitorName); } catch { /* Cloud chat remains available without local persistence. */ }
      setDraft("");
    } catch {
      setError("Your message could not be sent. Please check your connection and try again.");
    } finally { setSending(false); }
  }

  if (pathname.startsWith("/admin")) return null;

  return <div className="cx-chat" translate="no">
    {open ? <section className="cx-chat-window" aria-label="corgoXpress live chat">
      <header className="cx-chat-header">
        <div className="cx-chat-avatar" aria-hidden="true">CX</div>
        <div className="cx-chat-heading"><strong>corgoXpress support</strong><span><i className={online ? "is-online" : ""} />{online ? "Online now" : "We’ll reply as soon as we’re back"}</span></div>
        <button type="button" className="cx-chat-close" aria-label="Close chat" onClick={() => toggleChat(false)}>×</button>
      </header>
      <div className="cx-chat-welcome"><span>SHIPMENT SUPPORT</span><h2>How can we help?</h2><p>Send us a message and our team will get back to you here.</p></div>
      <div className="cx-chat-messages" aria-live="polite">
        {messages.length === 0 ? <div className="cx-chat-empty"><span>✦</span><p>Start a conversation</p><small>Questions about a shipment? We’re here to help.</small></div> : messages.map(message => <article key={message.id} className={`cx-chat-message ${message.sender === "visitor" ? "from-visitor" : "from-agent"}`}><div>{message.text}</div><time>{message.sender === "admin" ? "Support · " : "You · "}{timeLabel(message.createdAt)}</time></article>)}
        <div ref={endRef} />
      </div>
      <form className="cx-chat-form" onSubmit={submit}>
        {!name.trim() ? <label className="cx-chat-name"><span className="sr-only">Your name (optional)</span><input value={name} onChange={event => setName(event.target.value)} placeholder="Your name (optional)" maxLength={60} /></label> : null}
        <div className="cx-chat-compose"><textarea value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} aria-label="Write your message" placeholder="Write a message..." rows={1} maxLength={2000} /><button type="submit" disabled={!draft.trim() || sending} aria-label="Send message">{sending ? "…" : "➤"}</button></div>
        {error ? <p role="alert" className="cx-chat-error">{error}</p> : null}
        <p className="cx-chat-privacy">Replies appear here when you return to this browser.</p>
      </form>
    </section> : null}
    <button type="button" className="cx-chat-launcher" aria-expanded={open} onClick={() => toggleChat(!open)} aria-label={open ? "Close live chat" : "Open live chat"}>
      {open ? <span className="cx-chat-launcher-close">×</span> : <><span className="cx-chat-launcher-icon" aria-hidden="true">▰</span><span>Chat with us</span></>}
    </button>
  </div>;
}
