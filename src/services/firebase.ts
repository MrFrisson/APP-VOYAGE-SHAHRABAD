import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { TravelAppData } from '../types/travel';

// 1. Initialize Firebase App and Services
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 2. Auth Helpers
export async function loginWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export function onAuthUserChanged(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

// 3. Firestore Sync Helpers
export async function saveTravelDataToCloud(
  data: TravelAppData,
  user: User
): Promise<void> {
  const path = `users/${user.uid}/data/app_state`;
  try {
    const docRef = doc(db, 'users', user.uid, 'data', 'app_state');
    await setDoc(
      docRef,
      {
        userId: user.uid,
        trips: data.trips,
        steps: data.steps,
        accommodations: data.accommodations,
        transports: data.transports,
        activities: data.activities,
        expenses: data.expenses,
        documents: data.documents,
        links: data.links,
        notes: data.notes,
        activeTripId: data.activeTripId,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadTravelDataFromCloud(
  user: User
): Promise<Partial<TravelAppData> | null> {
  const path = `users/${user.uid}/data/app_state`;
  try {
    const docRef = doc(db, 'users', user.uid, 'data', 'app_state');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as Partial<TravelAppData>;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export function subscribeToTravelData(
  user: User,
  onData: (data: Partial<TravelAppData>) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = `users/${user.uid}/data/app_state`;
  const docRef = doc(db, 'users', user.uid, 'data', 'app_state');

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.data() as Partial<TravelAppData>);
      }
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// 4. Shared Carnets (Global synchronization across all users / colleague links)
export async function saveSharedTravelData(data: TravelAppData): Promise<boolean> {
  try {
    const docRef = doc(db, 'app_data', 'global_state');
    await setDoc(
      docRef,
      {
        trips: data.trips || [],
        steps: data.steps || [],
        accommodations: data.accommodations || [],
        transports: data.transports || [],
        activities: data.activities || [],
        expenses: data.expenses || [],
        documents: data.documents || [],
        links: data.links || [],
        notes: data.notes || [],
        activeTripId: data.activeTripId || '',
        updatedAt: data.updatedAt || new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (error: any) {
    console.error('Failed to save to shared Firestore:', error);
    return false;
  }
}

export async function loadSharedTravelData(): Promise<Partial<TravelAppData> | null> {
  try {
    const docRef = doc(db, 'app_data', 'global_state');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as Partial<TravelAppData>;
    }
    return null;
  } catch (error: any) {
    console.error('Failed to load shared travel data from Firestore:', error);
    return null;
  }
}

export function subscribeToSharedTravelData(
  onData: (data: Partial<TravelAppData>) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const docRef = doc(db, 'app_data', 'global_state');
  try {
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          onData(snapshot.data() as Partial<TravelAppData>);
        }
      },
      (error) => {
        console.error('Firestore real-time shared subscription error:', error);
        onError?.(error);
      }
    );
  } catch (err) {
    console.error('Failed to establish Firestore subscription:', err);
    return () => {};
  }
}
