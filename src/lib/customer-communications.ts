import { collection, doc, limit, onSnapshot, orderBy, query, setDoc, type Unsubscribe } from "firebase/firestore";
import { db } from "@/utils/firebase/client";

export const CHAT_COLLECTION = "supportChats";
export const VISITS_COLLECTION = "siteVisits";
export const PRESENCE_DOCUMENT = "supportPresence/agent";

export type ChatMessage = {
  id: string;
  sender: "visitor" | "admin";
  text: string;
  createdAt: string;
  senderName?: string;
};

export type SupportChat = {
  id: string;
  visitorSession: string;
  visitorName: string;
  status: "open" | "closed";
  lastMessage: string;
  updatedAt: string;
  createdAt: string;
};

export type SiteVisit = {
  id: string;
  sessionId: string;
  page: string;
  source: string;
  createdAt: string;
};

export function watchMessages(chatId: string, onChange: (messages: ChatMessage[]) => void): Unsubscribe {
  return onSnapshot(query(collection(db, CHAT_COLLECTION, chatId, "messages"), orderBy("createdAt", "asc")), snapshot => {
    onChange(snapshot.docs.map(item => ({ id: item.id, ...item.data() } as ChatMessage)));
  });
}

export async function sendChatMessage(chatId: string, chat: Omit<SupportChat, "id">, sender: ChatMessage["sender"], text: string, senderName?: string) {
  const messageId = crypto.randomUUID();
  const now = new Date().toISOString();
  const message: ChatMessage = { id: messageId, sender, text: text.trim(), createdAt: now, ...(senderName ? { senderName } : {}) };
  const batchWrite = async () => {
    const { writeBatch } = await import("firebase/firestore");
    const batch = writeBatch(db);
    batch.set(doc(db, CHAT_COLLECTION, chatId, "messages", messageId), message);
    batch.set(doc(db, CHAT_COLLECTION, chatId), { ...chat, id: chatId, lastMessage: message.text, updatedAt: now, status: "open" }, { merge: true });
    await batch.commit();
  };
  await batchWrite();
}

export function watchSupportChats(onChange: (chats: SupportChat[]) => void, onError: () => void): Unsubscribe {
  return onSnapshot(query(collection(db, CHAT_COLLECTION), orderBy("updatedAt", "desc"), limit(100)), snapshot => {
    onChange(snapshot.docs.map(item => ({ id: item.id, ...item.data() } as SupportChat)));
  }, onError);
}

export function watchVisits(onChange: (visits: SiteVisit[]) => void, onError: () => void): Unsubscribe {
  return onSnapshot(query(collection(db, VISITS_COLLECTION), orderBy("createdAt", "desc"), limit(500)), snapshot => {
    onChange(snapshot.docs.map(item => ({ id: item.id, ...item.data() } as SiteVisit)));
  }, onError);
}

export function watchSupportPresence(onChange: (online: boolean) => void): Unsubscribe {
  return onSnapshot(doc(db, PRESENCE_DOCUMENT), snapshot => {
    const data = snapshot.data();
    const updated = Date.parse(data?.updatedAt ?? "");
    onChange(data?.online === true && Number.isFinite(updated) && Date.now() - updated < 65_000);
  }, () => onChange(false));
}

export async function setSupportPresence(online: boolean, adminEmail: string) {
  await setDoc(doc(db, PRESENCE_DOCUMENT), { online, adminEmail, updatedAt: new Date().toISOString() }, { merge: true });
}
