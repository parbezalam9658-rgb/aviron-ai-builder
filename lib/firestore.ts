export type UserProfile = {
  uid: string;
  email?: string;
  displayName?: string;
};

export type CloudProject = {
  id: string;
  title: string;
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
  });

  return () => {};
}

export async function upsertUserProfile(user: UserProfile) {
  return true;
}