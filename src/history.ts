// Keeps a snapshot of the followers list in this browser only (localStorage),
// so the next upload can show who stopped following you.
// Two snapshots are kept: if the same export is uploaded again, the comparison
// is still made against the one before it.

export interface SnapshotUser {
  u: string;
  t?: number;
}

export interface Snapshot {
  /** Date of the data: export date when known, otherwise upload time (ms) */
  savedAt: number;
  users: SnapshotUser[];
}

export interface Store {
  baseline?: Snapshot;
  latest?: Snapshot;
}

const PREFIX = 'fu:history:';
const BACKUP_APP = 'followers-unfollowers-history';

const read = (account: string): Store => {
  try {
    const raw = localStorage.getItem(PREFIX + account);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
};

const write = (account: string, store: Store) => {
  try {
    localStorage.setItem(PREFIX + account, JSON.stringify(store));
  } catch {
    // Storage unavailable (private mode, quota): history is simply not kept
  }
};

export const sameUsers = (a: Snapshot, b: Snapshot) => {
  if (a.users.length !== b.users.length) return false;
  const set = new Set(a.users.map(x => x.u.toLowerCase()));
  return b.users.every(x => set.has(x.u.toLowerCase()));
};

export const toSnapshot = (users: { username: string; timestamp?: number }[], date?: number): Snapshot => ({
  savedAt: date ?? Date.now(),
  users: users.map(x => ({ u: x.username, t: x.timestamp })),
});

/**
 * Saves the current followers and returns the snapshot to compare against,
 * or null when there is no earlier one for this account.
 */
export function recordFollowers(account: string, current: Snapshot): Snapshot | null {
  const store = read(account);

  if (!store.latest) {
    write(account, { latest: current });
    return null;
  }
  if (sameUsers(store.latest, current)) {
    // Same list uploaded again: keep comparing with the snapshot before it
    return store.baseline ?? null;
  }
  write(account, { baseline: store.latest, latest: current });
  return store.latest;
}

/** Stores an explicit pair: an earlier snapshot (older export or backup) and the current one */
export function setPair(account: string, previous: Snapshot, current: Snapshot) {
  write(account, { baseline: previous, latest: current });
}

export function clearHistory(account: string) {
  try {
    localStorage.removeItem(PREFIX + account);
  } catch {
    // ignore
  }
}

/** Contents of a backup file the user can keep and restore later */
export function makeBackup(account: string): string | null {
  const store = read(account);
  if (!store.latest) return null;
  return JSON.stringify({ app: BACKUP_APP, version: 1, account, savedAt: Date.now(), store });
}

/** Reads a backup file; returns its account and stored snapshots */
export function parseBackup(text: string): { account: string; store: Store } | null {
  try {
    const data = JSON.parse(text);
    const store: Store | undefined = data?.store;
    if (data?.app !== BACKUP_APP || !store?.latest || !Array.isArray(store.latest.users)) return null;
    return { account: String(data.account || '_'), store };
  } catch {
    return null;
  }
}

/** Account name from an export file name like "instagram-username-2026-10-17-xxxx.zip" */
export function accountFromZipName(name: string): string {
  const m = /^instagram-(.+?)-\d{4}-\d{2}-\d{2}/i.exec(name);
  return m ? m[1].toLowerCase() : '_';
}

/** Export date from the same file name, if present */
export function dateFromZipName(name: string): number | undefined {
  const m = /-(\d{4})-(\d{2})-(\d{2})/.exec(name);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime() : undefined;
}

/** Stable pastel colours per username, so people are easier to tell apart */
export function avatarColors(name: string) {
  let h = 0;
  for (const c of name.toLowerCase()) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const hue = h % 360;
  return { background: `hsl(${hue} 80% 86%)`, color: `hsl(${hue} 60% 28%)` };
}
