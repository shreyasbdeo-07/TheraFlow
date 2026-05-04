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
  doc, setDoc, getDoc, getDocs, addDoc, deleteDoc,
  collection, query, orderBy, limit, serverTimestamp, writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

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
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Fetch all conversations for a user, newest first.
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
  const batch = writeBatch(db);

  // Delete all messages in the conversation
  const msgsSnap = await getDocs(
    collection(db, "users", uid, "conversations", convoId, "messages")
  );
  msgsSnap.forEach((d) => batch.delete(d.ref));

  // Delete the conversation doc itself
  batch.delete(doc(db, "users", uid, "conversations", convoId));

  await batch.commit();
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
 * Load all messages for a conversation, oldest first.
 */
export async function getConversation(uid, convoId) {
  const q = query(
    collection(db, "users", uid, "conversations", convoId, "messages"),
    orderBy("timestamp", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─────────────────────────────────────────────────────────
// MOOD LOGS
// ─────────────────────────────────────────────────────────

/**
 * Save a mood log entry for today.
 */
export async function saveMoodLog(uid, { mood, value, emoji, note, date }) {
  // Use the date as the doc ID so there's only one log per day
  await setDoc(doc(db, "users", uid, "moodLogs", date), {
    mood, value, emoji, note,
    date,
    createdAt: serverTimestamp(),
  });
}

/**
 * Get the last N days of mood logs, newest first.
 */
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
 * Delete a journal entry by ID.
 */
export async function deleteJournalEntry(uid, entryId) {
  await deleteDoc(doc(db, "users", uid, "journalEntries", entryId));
}

// ─────────────────────────────────────────────────────────
// ACCOUNT DELETION
// ─────────────────────────────────────────────────────────

/**
 * Delete ALL data for a user (called before deleting the Auth account).
 * Removes: conversations, messages, mood logs, journal entries, user doc.
 */
export async function deleteAllUserData(uid) {
  const batch = writeBatch(db);

  // Delete conversations + their messages
  const convosSnap = await getDocs(
    collection(db, "users", uid, "conversations")
  );
  for (const convoDoc of convosSnap.docs) {
    const msgsSnap = await getDocs(
      collection(db, "users", uid, "conversations", convoDoc.id, "messages")
    );
    msgsSnap.forEach((m) => batch.delete(m.ref));
    batch.delete(convoDoc.ref);
  }

  // Delete mood logs
  const moodSnap = await getDocs(collection(db, "users", uid, "moodLogs"));
  moodSnap.forEach((d) => batch.delete(d.ref));

  // Delete journal entries
  const journalSnap = await getDocs(collection(db, "users", uid, "journalEntries"));
  journalSnap.forEach((d) => batch.delete(d.ref));

  // Delete user doc
  batch.delete(doc(db, "users", uid));

  await batch.commit();
}
