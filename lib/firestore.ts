export type UserProfile = {
  uid: string;
  email?: string;
  displayName?: string;
  plan?: string;
  role?: string;
};

export type CloudProject = {
  id: string;
  title: string;
  prompt?: string;
  createdAt: string;
};

export function subscribeProjects(
  uid: string,
  callback: (rows: CloudProject[]) => void
) {
  callback([]);

  return () => {};
}

export function subscribeUserProfile(
  uid: string,
  callback: (profile: UserProfile | null) => void
) {
  callback({
    uid,
    email: "demo@example.com",
    displayName: "Parbez Alam",
    plan: "pro",
    role: "admin",
  });

  return () => {};
}

export async function upsertUserProfile(
  user: UserProfile
) {
  return true;
}

export async function saveProject(
  project: any
) {
  return true;
}

export async function updateProject(
  uid: string,
  projectId: string,
  data: any
) {
  return true;
}

export async function deleteProject(
  uid: string,
  projectId: string
) {
  return true;
}

export async function setUserPlan(
  uid: string,
  plan: string
) {
  return true;
}

export async function setUserRole(
  uid: string,
  role: string
) {
  return true;
}