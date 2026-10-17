// Keeps a snapshot of the followers list in this browser only (localStorage),
// so the next upload can show who stopped following you.
// Two snapshots are kept: if the same export is uploaded again, the comparison
// is still made against the one before it.

export interface SnapshotUser {
  u: string;
  t?: number;
}

export interface Snapshot {
  savedAt: number;
  users: SnapshotUser[];
}

interface Store {
  baseline?: Snapshot;
  latest?: Snapshot;
}

const PREFIX = 'fu:history:';

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

const sameUsers = (a: Snapshot, b: Snapshot) => {
  if (a.users.length !== b.users.length) return false;
  const set = new Set(a.users.map(x => x.u.toLowerCase()));
  return b.users.every(x => set.has(x.u.toLowerCase()));
};

/**
 * Saves the current followers and returns the snapshot to compare against,
 * or null when there is no earlier upload for this account.
 */
export function recordFollowers(account: string, users: { username: string; timestamp?: number }[]): Snapshot | null {
  const store = read(account);
  const current: Snapshot = {
    savedAt: Date.now(),
    users: users.map(x => ({ u: x.username, t: x.timestamp })),
  };

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

export function clearHistory(account: string) {
  try {
    localStorage.removeItem(PREFIX + account);
  } catch {
    // ignore
  }
}

/** Account name from an export file name like "instagram-username-2026-10-17-xxxx.zip" */
export function accountFromZipName(name: string): string {
  const m = /^instagram-(.+?)-\d{4}-\d{2}-\d{2}/i.exec(name);
  return m ? m[1].toLowerCase() : '_';
}

/** Stable pastel colours per username, so people are easier to tell apart */
export function avatarColors(name: string) {
  let h = 0;
  for (const c of name.toLowerCase()) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const hue = h % 360;
  return { background: `hsl(${hue} 80% 86%)`, color: `hsl(${hue} 60% 28%)` };
}
