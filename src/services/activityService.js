// Activity Service — logs user actions to Firestore
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { createActivityModel } from "../models";

const COLLECTION = "activities";

// NOTE: You may need a composite index in Firebase Console:
// Collection: activities, Fields: userId (Asc), createdAt (Desc)

export const addActivity = async (userId, activityData) => {
  const activity = createActivityModel({ ...activityData, userId });
  await addDoc(collection(db, COLLECTION), activity);
  return activity;
};

export const getRecentActivities = async (userId, maxItems = 4) => {
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(maxItems)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
