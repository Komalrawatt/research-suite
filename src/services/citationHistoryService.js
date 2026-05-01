// Citation History Service — saves generated citations to Firestore
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { createCitationModel } from "../models";

const COLLECTION = "citations";

// NOTE: You must create a composite index in Firebase Console for this collection:
// Collection: citations, Fields: userId (Asc), createdAt (Desc)

// Save a generated citation
export const saveCitation = async (userId, citationData) => {
  const citation = createCitationModel({ ...citationData, userId });
  const docId = `${userId}_${Date.now()}`;
  await setDoc(doc(db, COLLECTION, docId), citation);
  return citation;
};

// Get all saved citations for a user
export const getSavedCitations = async (userId) => {
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Delete a citation
export const deleteCitation = async (citationId) => {
  await deleteDoc(doc(db, COLLECTION, citationId));
};
