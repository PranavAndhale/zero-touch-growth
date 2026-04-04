import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (singleton — avoid re-init on hot reload)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ─── Business CRUD ────────────────────────────────────────────────────────────

export async function saveBusinessToFirestore(
  data: Record<string, unknown>
): Promise<string> {
  try {
    const ref = await addDoc(collection(db, "businesses"), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return ref.id;
  } catch (err) {
    console.error("Firestore save error:", err);
    throw err;
  }
}

export async function getBusinessFromFirestore(
  id: string
): Promise<Record<string, unknown> | null> {
  try {
    const snap = await getDoc(doc(db, "businesses", id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    console.error("Firestore get error:", err);
    return null;
  }
}

export async function updateBusinessInFirestore(
  id: string,
  data: Record<string, unknown>
): Promise<void> {
  try {
    await updateDoc(doc(db, "businesses", id), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Firestore update error:", err);
    throw err;
  }
}

// ─── Plan CRUD ────────────────────────────────────────────────────────────────

export async function savePlanToFirestore(
  data: Record<string, unknown>
): Promise<string> {
  try {
    const ref = await addDoc(collection(db, "plans"), {
      ...data,
      createdAt: new Date().toISOString(),
    });
    return ref.id;
  } catch (err) {
    console.error("Firestore plan save error:", err);
    throw err;
  }
}

export async function getPlanFromFirestore(
  planId: string
): Promise<Record<string, unknown> | null> {
  try {
    const snap = await getDoc(doc(db, "plans", planId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    console.error("Firestore plan get error:", err);
    return null;
  }
}

export async function getPlansForBusiness(
  businessId: string
): Promise<Record<string, unknown>[]> {
  try {
    const q = query(
      collection(db, "plans"),
      where("businessId", "==", businessId),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("Firestore plans query error:", err);
    return [];
  }
}

export async function updatePlanInFirestore(
  planId: string,
  data: Record<string, unknown>
): Promise<void> {
  try {
    await updateDoc(doc(db, "plans", planId), data);
  } catch (err) {
    console.error("Firestore plan update error:", err);
    throw err;
  }
}

// ─── Festival Cache (Firestore) ───────────────────────────────────────────────

export async function getFestivalsFromCache(
  cacheKey: string
): Promise<unknown[] | null> {
  try {
    const snap = await getDoc(doc(db, "cache", cacheKey));
    if (!snap.exists()) return null;
    const data = snap.data();
    // Check TTL — 30 days
    const savedAt = new Date(data.savedAt).getTime();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - savedAt > thirtyDays) return null;
    return data.festivals;
  } catch {
    return null;
  }
}

export async function saveFestivalsToCache(
  cacheKey: string,
  festivals: unknown[]
): Promise<void> {
  try {
    await setDoc(doc(db, "cache", cacheKey), {
      festivals,
      savedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Firestore festival cache error:", err);
  }
}
