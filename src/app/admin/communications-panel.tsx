"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/utils/firebase/client";
import { sendChatMessage, setSupportPresence, watchMessages, watchSupportChats, watchVisits, type ChatMessage, type SiteVisit, type SupportChat } from "@/lib/customer-communications";

function dateValue(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? 0 : date.getTime(); }
function compactTime(value: string) { const time = dateValue(value); return time ? new Date(time).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "Recently"; }

export default function CommunicationsPanel({ adminEmail }: { adminEmail: string }) {
  const [chats, setChats] = useState<SupportChat[]>([]);
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState("");
  const [online, setOnline] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [now, setNow] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const selected = chats.find(chat => chat.id === selectedId) ?? chats[0] ?? null;
  const activeChatId = selected?.id;

  useEffect(() => {
    const timer = window.setTimeout(() => setNow(Date.now()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const stopChats = watchSupportChats(items => { setChats(items); setLoading(false); }, () => { setError("Chat inbox is unavailable. Check Firestore access rules."); setLoading(false); });
    const stopVisits = watchVisits(setVisits, () => setError("Traffic data is unavailable. Check Firestore access rules."));
    return () => { stopChats(); stopVisits(); };
  }, []);

  useEffect(() => {
    if (!activeChatId) return;
    return watchMessages(activeChatId, setMessages);
  }, [activeChatId]);

  useEffect(() => {
    const update = () => { void setSupportPresence(online, adminEmail).catch(() => setError("Unable to update support availability.")); };
    update();
    const interval = window.setInterval(update, 25_000);
    return () => { window.clearInterval(interval); void setSupportPresence(false, adminEmail).catch(() => {}); };
  }, [online, adminEmail]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages]);

  const dayVisits = useMemo(() => visits.filter(visit => dateValue(visit.createdAt) >= now - 24 * 60 * 60 * 1000), [visits, now]);
  const weekVisits = useMemo(() => visits.filter(visit => dateValue(visit.createdAt) >= now - 7 * 24 * 60 * 60 * 1000), [visits, now]);
  const uniqueToday = useMemo(() => new Set(dayVisits.map(visit => visit.sessionId)).size, [dayVisits]);
  const pageCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const visit of weekVisits) counts.set(visit.page, (counts.get(visit.page) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [weekVisits]);
  const sourceCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const visit of weekVisits) counts.set(visit.source || "Direct", (counts.get(visit.source || "Direct") ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [weekVisits]);

  async function reply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !draft.trim() || sending) return;
    setSending(true);
    setError("");
    const metadata = { visitorSession: selected.visitorSession, visitorName: selected.visitorName, status: selected.status, lastMessage: selected.lastMessage, updatedAt: selected.updatedAt, createdAt: selected.createdAt };
    try { await sendChatMessage(selected.id, metadata, "admin", draft.trim(), "corgoXpress support"); setDraft(""); }
    catch { setError("Reply could not be sent. Check your connection and try again."); }
    finally { setSending(false); }
  }

  async function closeConversation() {
    if (!selected) return;
    try {
      await setDoc(doc(db, "supportChats", selected.id), { status: "closed", updatedAt: new Date().toISOString() }, { merge: true });
    } catch { setError("This conversation could not be closed."); }
  }

  return <section data-dashboard-panel="support" className="cx-admin-comms rounded-[28px] border border-blue-100 bg-white p-4 shadow-xl shadow-blue-950/10 sm:p-7">
    <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">Customer care &amp; analytics</p><h2 className="mt-2 text-3xl font-semibold text-slate-950">Live conversations</h2><p className="mt-1 text-sm text-slate-500">Reply to visitors and see how customers find your site.</p></div>
      <button type="button" aria-pressed={online} onClick={() => setOnline(value => !value)} className={`inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-full px-4 text-sm font-semibold transition ${online ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}><i className={`h-2.5 w-2.5 rounded-full ${online ? "bg-emerald-500" : "bg-slate-400"}`} />{online ? "You’re online" : "Set yourself online"}</button>
    </div>

    <div className="mt-5 grid gap-3 sm:grid-cols-3">
      <article className="rounded-2xl bg-[#f4f7fc] p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Page views · 24 hours</p><p className="mt-2 text-3xl font-semibold text-slate-950">{dayVisits.length}</p></article>
      <article className="rounded-2xl bg-[#f4f7fc] p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Visitors · 24 hours</p><p className="mt-2 text-3xl font-semibold text-slate-950">{uniqueToday}</p></article>
      <article className="rounded-2xl bg-[#f4f7fc] p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Open conversations</p><p className="mt-2 text-3xl font-semibold text-slate-950">{chats.filter(chat => chat.status !== "closed").length}</p></article>
    </div>

    <div className="mt-5 grid gap-5 xl:grid-cols-[0.82fr_1.35fr]">
      <div className="grid content-start gap-5">
        <section className="rounded-2xl border border-slate-100 p-4 sm:p-5"><div className="flex items-baseline justify-between gap-3"><h3 className="font-semibold text-slate-900">Most viewed pages</h3><span className="text-xs text-slate-400">7 days</span></div>{pageCounts.length ? <div className="mt-4 grid gap-4">{pageCounts.map(([page, count]) => <div key={page}><div className="mb-1 flex justify-between gap-3 text-sm"><span className="truncate text-slate-600">{page === "/" ? "Home" : page}</span><strong className="text-slate-900">{count}</strong></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.max(8, count / (pageCounts[0]?.[1] || 1) * 100)}%` }} /></div></div>)}</div> : <p className="mt-4 text-sm text-slate-500">Traffic will appear here as visitors browse.</p>}</section>
        <section className="rounded-2xl border border-slate-100 p-4 sm:p-5"><div className="flex items-baseline justify-between gap-3"><h3 className="font-semibold text-slate-900">Traffic sources</h3><span className="text-xs text-slate-400">7 days</span></div>{sourceCounts.length ? <div className="mt-3 grid gap-2">{sourceCounts.map(([source, count]) => <div key={source} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"><span className="truncate text-slate-600">{source}</span><strong className="ml-3 text-slate-900">{count}</strong></div>)}</div> : <p className="mt-4 text-sm text-slate-500">No referral data yet.</p>}<p className="mt-3 text-xs leading-5 text-slate-400">Counts use the latest 500 page views and don’t store visitor IP addresses.</p></section>
      </div>

      <section className="grid min-h-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-[#f8fafc] lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-b border-slate-200 bg-white lg:border-b-0 lg:border-r"><div className="border-b border-slate-100 p-4"><h3 className="font-semibold text-slate-900">Inbox</h3><p className="mt-1 text-xs text-slate-500">{chats.length} recent {chats.length === 1 ? "conversation" : "conversations"}</p></div><div className="max-h-60 overflow-auto lg:max-h-[520px]">{loading ? <p className="p-4 text-sm text-slate-500">Loading conversations…</p> : chats.length ? chats.map(chat => <button key={chat.id} type="button" onClick={() => setSelectedId(chat.id)} className={`block w-full border-b border-slate-100 p-4 text-left transition hover:bg-blue-50 ${selected?.id === chat.id ? "bg-blue-50" : "bg-white"}`}><span className="flex items-center justify-between gap-2"><strong className="truncate text-sm text-slate-900">{chat.visitorName || "Guest"}</strong><i className={`h-2 w-2 shrink-0 rounded-full ${chat.status === "closed" ? "bg-slate-300" : "bg-blue-500"}`} /></span><span className="mt-1 block truncate text-xs text-slate-500">{chat.lastMessage}</span><time className="mt-2 block text-[10px] text-slate-400">{compactTime(chat.updatedAt)}</time></button>) : <p className="p-4 text-sm leading-6 text-slate-500">{error || "No messages yet. New visitor chats will appear here."}</p>}</div></aside>
        <div className="flex min-h-[420px] min-w-0 flex-col bg-[#f8fafc]">{selected ? <>
          <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-5"><div className="min-w-0"><h3 className="truncate font-semibold text-slate-900">{selected.visitorName || "Guest visitor"}</h3><p className="text-xs text-slate-500">Started {compactTime(selected.createdAt)}</p></div>{selected.status !== "closed" ? <button type="button" onClick={closeConversation} className="shrink-0 rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200">Close chat</button> : <span className="shrink-0 rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">Closed</span>}</header>
          <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">{messages.map(message => <article key={message.id} className={`flex ${message.sender === "admin" ? "justify-end" : "justify-start"}`}><div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${message.sender === "admin" ? "rounded-br-md bg-blue-700 text-white" : "rounded-bl-md border border-slate-100 bg-white text-slate-800"}`}><p className="whitespace-pre-wrap break-words">{message.text}</p><time className={`mt-1 block text-[10px] ${message.sender === "admin" ? "text-blue-100" : "text-slate-400"}`}>{compactTime(message.createdAt)}</time></div></article>)}<div ref={endRef} /></div>
          <form onSubmit={reply} className="border-t border-slate-200 bg-white p-3 sm:p-4"><div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-blue-400"><textarea value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} placeholder="Write a helpful reply…" aria-label="Write a reply" rows={2} maxLength={2000} className="min-h-11 flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm outline-none" /><button type="submit" disabled={!draft.trim() || sending} className="min-h-10 shrink-0 rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-45">{sending ? "Sending" : "Send"}</button></div><p className="mt-2 text-[10px] text-slate-400">Enter to send · Shift + Enter for a new line</p></form>
        </> : <div className="grid flex-1 place-items-center p-8 text-center"><div><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-100 text-2xl text-blue-700">✦</span><h3 className="mt-4 font-semibold text-slate-900">Your inbox is ready</h3><p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">Choose a conversation to reply, or keep this tab open to help the next visitor.</p></div></div>}</div>
      </section>
    </div>
    {error ? <p role="status" className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</p> : null}
  </section>;
}
