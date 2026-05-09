import type { User } from "firebase/auth";
import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "./firebase";

export type ProjectType = "website" | "ads" | "shopify-theme" | "video-ads" | "whatsapp-automation" | "mobile-app";

export type CloudProject = {
  id: string;
  type: ProjectType;
  title: string;
  prompt: string;
  template?: string;
  payload?: string;
  createdAt: string;
  updatedAt?: string;
};

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  plan: "Free" | "Pro" | "Pro+";
  role: "Super Admin" | "Admin" | "Premium User" | "Normal User";
};

type SaveProjectInput = {
  uid: string;
  type: ProjectType;
  title: string;
  prompt: string;
  template?: string;
  payload?: string;
};

const profilesCollection = collection(db, "profiles");

export async function upsertUserProfile(user: User) {
  await setDoc(
    doc(profilesCollection, user.uid),
    {
      uid: user.uid,
      email: user.email ?? "",
      displayName: user.displayName ?? "",
      photoURL: user.photoURL ?? "",
      plan: "Free",
      role: user.email?.endsWith("@aviron.ai") ? "Super Admin" : "Normal User",
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function setUserPlan(uid: string, plan: "Free" | "Pro" | "Pro+") {
  await setDoc(
    doc(profilesCollection, uid),
    {
      plan,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function setUserRole(
  uid: string,
  role: "Super Admin" | "Admin" | "Premium User" | "Normal User",
) {
  await setDoc(
    doc(profilesCollection, uid),
    {
      role,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export function subscribeUserProfile(uid: string, onData: (profile: UserProfile | null) => void) {
  const profileRef = doc(profilesCollection, uid);
  return onSnapshot(profileRef, (snapshot) => {
    if (!snapshot.exists()) {
      onData(null);
      return;
    }
    const data = snapshot.data() as Partial<UserProfile>;
    onData({
      uid,
      email: data.email ?? "",
      displayName: data.displayName ?? "",
      photoURL: data.photoURL ?? "",
      plan: (data.plan as UserProfile["plan"]) ?? "Free",
      role: (data.role as UserProfile["role"]) ?? "Normal User",
    });
  });
}

export async function saveProject(input: SaveProjectInput) {
  const projectsRef = collection(db, "profiles", input.uid, "projects");
  await addDoc(projectsRef, {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function subscribeProjects(uid: string, onData: (projects: CloudProject[]) => void) {
  const projectsRef = collection(db, "profiles", uid, "projects");
  const projectsQuery = query(projectsRef, orderBy("createdAt", "desc"), limit(50));

  return onSnapshot(projectsQuery, (snapshot) => {
    const rows: CloudProject[] = snapshot.docs.map((d) => {
      const data = d.data() as {
        type: ProjectType;
        title: string;
        prompt: string;
        template?: string;
        payload?: string;
        createdAt?: Timestamp;
        updatedAt?: Timestamp;
      };
      return {
        id: d.id,
        type: data.type,
        title: data.title,
        prompt: data.prompt,
        template: data.template,
        payload: data.payload,
        createdAt: data.createdAt?.toDate().toISOString() ?? new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString(),
      };
    });
    onData(rows);
  });
}

export async function updateProject(uid: string, projectId: string, patch: { title?: string; prompt?: string }) {
  const projectRef = doc(db, "profiles", uid, "projects", projectId);
  await updateDoc(projectRef, {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProject(uid: string, projectId: string) {
  const projectRef = doc(db, "profiles", uid, "projects", projectId);
  await deleteDoc(projectRef);
}
