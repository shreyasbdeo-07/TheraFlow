/**
 * lib/firestore.js
 * All Firestore read/write helpers for TheraFlow.
 *
 * Data model:
 *   users/{uid}
 *   users/{uid}/conversations/{convoId}
 *   users/{uid}/conversations/{convoId}/messages/{msgId}
 *   users/{uid}/moodLogs/{logId}
 *   users/{uid}/journalEntries/{entryId}
 */

import {
  doc, setDoc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  collection, query, orderBy, limit, serverTimestamp, writeBatch, onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";

// ─────────────────────────────────────────────────────────
// BATCH HELPERS
// ─────────────────────────────────────────────────────────

/**
 * Firestore batches are capped at 500 operations.
 * This helper splits an array of DocumentReferences into
 * chunks of ≤ 499 and commits each as a separate batch.
 */
async function deleteInChunks(refs) {
  const CHUNK_SIZE = 499;
  for (let i = 0; i < refs.length; i += CHUNK_SIZE) {
    const batch = writeBatch(db);
    refs.slice(i, i + CHUNK_SIZE).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
}

// ─────────────────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────────────────

/**
 * Create a user document on sign-up.
 */
export async function createUserDocument(uid, { name, email }) {
  const ref = doc(db, "users", uid);
  await setDoc(ref, { name, email, createdAt: serverTimestamp() }, { merge: true });
}

/**
 * Save user preferences (personality, notifications, etc.) to Firestore.
 */
export async function saveUserPrefs(uid, prefs) {
  await setDoc(doc(db, "users", uid), { prefs }, { merge: true });
}

/**
 * Load user preferences from Firestore.
 * Returns null if the document doesn't exist yet.
 */
export async function getUserPrefs(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data().prefs ?? null) : null;
}

// ─────────────────────────────────────────────────────────
// CONVERSATIONS
// ─────────────────────────────────────────────────────────

/**
 * Create a new conversation and return its ID.
 */
export async function createConversation(uid, title = "New Conversation") {
  const ref = await addDoc(collection(db, "users", uid, "conversations"), {
    title,
    lastMessage: "",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Fetch all conversations for a user, newest first (one-time read).
 */
export async function getConversations(uid) {
  const q = query(
    collection(db, "users", uid, "conversations"),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Subscribe to real-time conversation list updates.
 * Calls onChange(conversations[]) on every change.
 * Returns an unsubscribe function.
 */
export function subscribeConversations(uid, onChange) {
  const q = query(
    collection(db, "users", uid, "conversations"),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  return onSnapshot(q, (snap) => {
    const convos = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    onChange(convos);
  });
}

/**
 * Update a conversation's title.
 */
export async function updateConversationTitle(uid, convoId, title) {
  await setDoc(
    doc(db, "users", uid, "conversations", convoId),
    { title },
    { merge: true }
  );
}

/**
 * Delete a conversation and all its messages.
 */
export async function deleteConversation(uid, convoId) {
  // Collect all message refs first, then delete in safe chunks
  const msgsSnap = await getDocs(
    collection(db, "users", uid, "conversations", convoId, "messages")
  );
  const refs = msgsSnap.docs.map((d) => d.ref);
  refs.push(doc(db, "users", uid, "conversations", convoId));

  await deleteInChunks(refs);
}

// ─────────────────────────────────────────────────────────
// MESSAGES
// ─────────────────────────────────────────────────────────

/**
 * Save a single message to a conversation.
 */
export async function saveMessage(uid, convoId, message) {
  await addDoc(
    collection(db, "users", uid, "conversations", convoId, "messages"),
    {
      role:      message.role,       // "user" | "assistant"
      content:   message.content,
      timestamp: serverTimestamp(),
    }
  );
}

/**
 * Load all messages for a conversation, oldest first (one-time read).
 */
export async function getConversation(uid, convoId) {
  const q = query(
    collection(db, "users", uid, "conversations", convoId, "messages"),
    orderBy("timestamp", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Subscribe to real-time message updates for a conversation.
 * Calls onChange(messages[]) on every Firestore change.
 * Returns an unsubscribe function.
 */
export function subscribeMessages(uid, convoId, onChange) {
  const q = query(
    collection(db, "users", uid, "conversations", convoId, "messages"),
    orderBy("timestamp", "asc")
  );
  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    onChange(msgs);
  });
}

/**
 * Update the lastMessage preview on the parent conversation document.
 * Called after every AI reply so the history list shows a preview.
 */
export async function updateConversationLastMessage(uid, convoId, lastMessage) {
  await setDoc(
    doc(db, "users", uid, "conversations", convoId),
    { lastMessage },
    { merge: true }
  );
}

// ─────────────────────────────────────────────────────────
// MOOD ENTRIES  (users/{uid}/moods)
// ─────────────────────────────────────────────────────────

/**
 * Save a new mood entry.
 * Each call creates a separate document (multiple entries per day are allowed).
 */
export async function saveMood(uid, { mood, tags }) {
  await addDoc(collection(db, "users", uid, "moods"), {
    mood,
    tags: tags ?? [],
    createdAt: serverTimestamp(),
  });
}

/**
 * Fetch the last `count` mood entries for a user, newest first (one-time read).
 */
export async function getMoods(uid, count = 90) {
  const q = query(
    collection(db, "users", uid, "moods"),
    orderBy("createdAt", "desc"),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Subscribe to real-time mood entry updates for a user.
 * Calls onChange(entries[]) on every Firestore change.
 * Returns an unsubscribe function.
 */
export function subscribeMoods(uid, onChange, count = 90) {
  const q = query(
    collection(db, "users", uid, "moods"),
    orderBy("createdAt", "desc"),
    limit(count)
  );
  return onSnapshot(q, (snap) => {
    const entries = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    onChange(entries);
  });
}

// ─────────────────────────────────────────────────────────
// MOOD LOGS (legacy – kept for backwards compatibility)
// ─────────────────────────────────────────────────────────

/** @deprecated Use saveMood instead */
export async function saveMoodLog(uid, { mood, value, emoji, note, date }) {
  await setDoc(doc(db, "users", uid, "moodLogs", date), {
    mood, value, emoji, note, date,
    createdAt: serverTimestamp(),
  });
}

/** @deprecated Use getMoods instead */
export async function getMoodLogs(uid, days = 14) {
  const q = query(
    collection(db, "users", uid, "moodLogs"),
    orderBy("date", "desc"),
    limit(days)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─────────────────────────────────────────────────────────
// JOURNAL ENTRIES
// ─────────────────────────────────────────────────────────

/**
 * Save a new journal entry.
 */
export async function saveJournalEntry(uid, { title, body }) {
  await addDoc(collection(db, "users", uid, "journalEntries"), {
    title,
    body,
    createdAt: serverTimestamp(),
  });
}

/**
 * Fetch all journal entries for a user, newest first.
 */
export async function getJournalEntries(uid) {
  const q = query(
    collection(db, "users", uid, "journalEntries"),
    orderBy("createdAt", "desc"),
    limit(100)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Update an existing journal entry's title and body.
 */
export async function updateJournalEntry(uid, entryId, { title, body }) {
  await updateDoc(doc(db, "users", uid, "journalEntries", entryId), {
    title,
    body,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a journal entry by ID.
 */
export async function deleteJournalEntry(uid, entryId) {
  await deleteDoc(doc(db, "users", uid, "journalEntries", entryId));
}

/**
 * Subscribe to real-time journal entry updates for a user.
 * Calls onChange(entries[]) whenever Firestore data changes.
 * Returns an unsubscribe function.
 */
export function subscribeJournalEntries(uid, onChange) {
  const q = query(
    collection(db, "users", uid, "journalEntries"),
    orderBy("createdAt", "desc"),
    limit(200)
  );
  return onSnapshot(q, (snap) => {
    const entries = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    onChange(entries);
  });
}

// ─────────────────────────────────────────────────────────
// ACCOUNT DELETION
// ─────────────────────────────────────────────────────────

/**
 * Delete ALL data for a user (called before deleting the Auth account).
 * Removes: conversations, messages, mood logs, journal entries, user doc.
 */
export async function deleteAllUserData(uid) {
  // Collect ALL refs before batching — avoids the 500-op batch limit
  const allRefs = [];

  // Conversations + their messages
  const convosSnap = await getDocs(
    collection(db, "users", uid, "conversations")
  );
  for (const convoDoc of convosSnap.docs) {
    const msgsSnap = await getDocs(
      collection(db, "users", uid, "conversations", convoDoc.id, "messages")
    );
    msgsSnap.forEach((m) => allRefs.push(m.ref));
    allRefs.push(convoDoc.ref);
  }

  // Active moods collection
  const moodSnap = await getDocs(collection(db, "users", uid, "moods"));
  moodSnap.forEach((d) => allRefs.push(d.ref));

  // Legacy mood logs
  const moodLogSnap = await getDocs(collection(db, "users", uid, "moodLogs"));
  moodLogSnap.forEach((d) => allRefs.push(d.ref));

  // Journal entries
  const journalSnap = await getDocs(collection(db, "users", uid, "journalEntries"));
  journalSnap.forEach((d) => allRefs.push(d.ref));

  // User document itself
  allRefs.push(doc(db, "users", uid));

  // Commit in chunks of 499 to respect Firestore's 500-op batch limit
  await deleteInChunks(allRefs);
}
