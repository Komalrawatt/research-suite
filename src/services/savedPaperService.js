// Saved Papers Service — CRUD operations for bookmarked papers in Firestore
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../config/firebase";

const COLLECTION = "savedPapers";

// NOTE: You must create a composite index in Firebase Console for this collection:
// Collection: savedPapers, Fields: userId (Asc), savedAt (Desc)

/**
 * Sanitize a paper ID for use as a Firestore document ID.
 * Firestore doc IDs cannot contain "/" so we replace them.
 * OpenAlex IDs look like "https://openalex.org/W123" and Crossref IDs are DOIs with slashes.
 */
const sanitizeId = (id) => {
  if (!id) return `unknown_${Date.now()}`;
  return String(id)
    .replace(/https?:\/\//g, "")   // strip protocol
    .replace(/\//g, "_")           // replace slashes
    .replace(/\./g, "-")           // replace dots
    .substring(0, 200);            // Firestore doc IDs max 1500 bytes, keep it safe
};

// Save a paper to user's collection
export const savePaper = async (userId, paperData) => {
  const rawPaperId = paperData.paperId || paperData.id;
  const safePaperId = sanitizeId(rawPaperId);
  const docId = `${userId}_${safePaperId}`;

  const paper = {
    paperId: safePaperId,
    originalId: rawPaperId,  // keep the original for lookups
    title: paperData.title || "Untitled",
    authors: paperData.authors || [],
    year: paperData.year || null,
    journal: paperData.journal || "",
    doi: paperData.doi || "",
    citationCount: paperData.citationCount || 0,
    abstract: paperData.abstract || "",
    url: paperData.url || "",
    openAccessPdf: paperData.openAccessPdf || null,
    source: paperData.source || "",
    fieldsOfStudy: paperData.fieldsOfStudy || [],
    userId,
    savedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, COLLECTION, docId), paper);
  return paper;
};

// Remove a saved paper
export const removeSavedPaper = async (userId, paperId) => {
  const safePaperId = sanitizeId(paperId);
  const docId = `${userId}_${safePaperId}`;
  await deleteDoc(doc(db, COLLECTION, docId));
};

// Get all saved papers for a user
export const getSavedPapers = async (userId) => {
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
};

// Check if a paper is saved
export const isPaperSaved = async (userId, paperId) => {
  const safePaperId = sanitizeId(paperId);
  const docId = `${userId}_${safePaperId}`;
  const snap = await getDoc(doc(db, COLLECTION, docId));
  return snap.exists();
};
