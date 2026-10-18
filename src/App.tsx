import { useState, useCallback, useRef, ChangeEvent, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  UserPlus,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowRightLeft,
  Info,
  ExternalLink,
  Trash2,
  HelpCircle,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import Guide, { IG_EXPORT_URL } from './Guide';
import ConfirmDialog, { ActionLink } from './ConfirmDialog';
import { unzip } from 'fflate';
import { recordFollowers, clearHistory, accountFromZipName, dateFromZipName, avatarColors, toSnapshot, setPair, sameUsers, makeBackup, parseBackup, Snapshot } from './history';

interface UserData {
  username: string;
  link: string;
  date: string;
  timestamp?: number;
}

interface ComparisonResult {
  notFollowingBack: UserData[];
  fans: UserData[];
  mutuals: UserData[];
}

type Language = 'el' | 'en';
type HistoryAction = 'compareOlder' | 'backup' | 'restore' | 'clear';
type SortOrder = 'newest' | 'oldest' | 'az';
type Tab = 'notFollowingBack' | 'fans' | 'mutuals' | 'unfollowedYou' | 'youUnfollowed';

const translations = {
  el: {
    title: 'Followers & Unfollowers',
    howItWorks: 'Πώς λειτουργεί;',
    instructions: 'Κατέβασε από το Instagram την εξαγωγή με τους <b>followers</b> και <b>following</b> σου (μορφή <b>JSON</b>, εύρος <b>All time</b>) και ανέβασε εδώ το <b>.zip</b> όπως είναι. Η εφαρμογή βρίσκει μόνη της τα αρχεία.',
    openGuide: 'Δες αναλυτικά τα βήματα',
    openExport: 'Άνοιξε την εξαγωγή στο Instagram',
    guide: 'Οδηγός',
    followers: 'Followers',
    following: 'Following',
    users: 'χρήστες',
    uploadPlaceholder: 'Κάνε κλικ ή σύρε το .zip ή τα αρχεία εδώ',
    notFollowingBack: 'Δεν σε ακολουθούν',
    fans: 'Θαυμαστές',
    mutuals: 'Κοινοί',
    descNotFollowingBack: 'Τους ακολουθείς, αλλά δεν σε ακολουθούν πίσω.',
    descFans: 'Σε ακολουθούν, αλλά δεν τους ακολουθείς.',
    descMutuals: 'Ακολουθείτε ο ένας τον άλλον.',
    unfollowedYou: 'Σε έκαναν unfollow',
    youUnfollowed: 'Έκανες unfollow',
    descUnfollowedYou: 'Σε ακολουθούσαν στις {date}, αλλά όχι πια.',
    descUnfollowedYouFirst: 'Οι followers σου αποθηκεύτηκαν, μόνο σε αυτή τη συσκευή. Την επόμενη φορά που θα ανεβάσεις νέα εξαγωγή, εδώ θα δεις ποιοι σε έκαναν unfollow στο μεταξύ. Αν έχεις παλιότερο export ή αρχείο ιστορικού, ανέβασέ το τώρα για άμεση σύγκριση.',
    descYouUnfollowed: 'Λογαριασμοί που σταμάτησες πρόσφατα να ακολουθείς, σύμφωνα με το Instagram.',
    clearHistory: 'Διαγραφή ιστορικού',
    cancel: 'Ακύρωση',
    tipCompareOlder: 'Ανέβασε ένα παλιότερο zip από το Instagram, για να δεις ποιοι σε έκαναν unfollow από τότε.',
    tipBackup: 'Κατέβασε ένα αρχείο με τη λίστα των followers σου, για να μη χαθεί η σύγκριση.',
    tipRestore: 'Φόρτωσε ένα αρχείο ιστορικού που είχες αποθηκεύσει παλιότερα.',
    tipClear: 'Σβήνει τη λίστα followers που θυμάται η εφαρμογή σε αυτή τη συσκευή.',
    dlgCompareOlder: 'Αν έχεις κρατήσει ένα <b>παλιότερο export</b> από το Instagram (π.χ. από πριν ένα μήνα), επίλεξέ το στο επόμενο βήμα. Η εφαρμογή θα συγκρίνει τους followers που είχες τότε με τους τωρινούς και θα σου δείξει ποιοι έφυγαν.<br><br>Πρέπει να είναι από τον <b>ίδιο λογαριασμό</b>. Το αρχείο διαβάζεται μόνο στη συσκευή σου.',
    dlgBackup: 'Η εφαρμογή θυμάται τους followers σου <b>μόνο σε αυτόν τον browser</b>, και αυτό μπορεί να χαθεί (π.χ. αν καθαρίσεις τα δεδομένα του browser ή αλλάξεις κινητό).<br><br>Με την αποθήκευση κατεβαίνει στη συσκευή σου ένα <b>μικρό αρχείο (.json)</b> με αυτή τη λίστα. Κράτα το, και όποτε χρειαστεί φόρτωσέ το με την <b>Επαναφορά ιστορικού</b>.<br><br>Το αρχείο περιέχει τα usernames των followers σου, οπότε μην το μοιράζεσαι.',
    dlgRestore: 'Αν είχες πατήσει <b>Αποθήκευση ιστορικού</b> στο παρελθόν, επίλεξε στο επόμενο βήμα εκείνο το αρχείο (.json). Η εφαρμογή θα συγκρίνει τους followers που είχες τότε με τους τωρινούς.<br><br>Δουλεύει και σε άλλη συσκευή ή browser, αρκεί να είναι από τον <b>ίδιο λογαριασμό</b>.',
    dlgClear: 'Θα διαγραφεί η λίστα των followers που έχει κρατήσει η εφαρμογή <b>σε αυτόν τον browser</b>. Η επόμενη σύγκριση θα ξεκινήσει από την αρχή.<br><br>Τα αρχεία που έχεις κατεβάσει (exports ή αρχεία ιστορικού) δεν επηρεάζονται. <b>Δεν αναιρείται.</b>',
    chooseFile: 'Επιλογή αρχείου',
    filters: 'Φίλτρα',
    dateFrom: 'Από',
    dateTo: 'Έως',
    sortBy: 'Ταξινόμηση',
    sortNewest: 'Νεότερα πρώτα',
    sortOldest: 'Παλαιότερα πρώτα',
    sortAZ: 'Αλφαβητικά (A–Z)',
    clearFilters: 'Καθαρισμός φίλτρων',
    showing: 'Εμφανίζονται {n} από {total}',
    download: 'Λήψη αρχείου',
    delete: 'Διαγραφή',
    compareOlder: 'Σύγκριση με παλιότερο export',
    backupHistory: 'Αποθήκευση ιστορικού',
    restoreHistory: 'Επαναφορά ιστορικού',
    errorOtherAccount: 'Το αρχείο είναι από άλλον λογαριασμό',
    errorNotOlder: 'Αυτό το export δεν είναι παλιότερο από το τρέχον',
    errorBackup: 'Δεν είναι έγκυρο αρχείο ιστορικού αυτής της εφαρμογής',
    followingSince: 'Ακολουθείς από τις',
    followsYouSince: 'Σε ακολουθεί από τις',
    followedYouSince: 'Σε ακολουθούσε από τις',
    unfollowedOn: 'Unfollow στις',
    descHistoryCleared: 'Το ιστορικό διαγράφηκε από αυτή τη συσκευή. Θα ξεκινήσει ξανά την επόμενη φορά που θα ανεβάσεις αρχεία.',
    searchPlaceholder: 'Αναζήτηση χρήστη...',
    noResults: 'Δεν βρέθηκαν αποτελέσματα',
    waitingFiles: 'Περιμένω τα αρχεία σου...',
    madeForFriends: 'Φτιαγμένο για φίλους',
    errorParsing: 'Σφάλμα κατά την ανάγνωση του αρχείου. Βεβαιωθείτε ότι είναι έγκυρο αρχείο εξαγωγής του Instagram.',
    noDate: 'Χωρίς ημερομηνία',
    files: 'αρχεία',
    errorZip: 'Δεν ήταν δυνατό να ανοίξει το .zip.',
    zipEmpty: 'Δεν βρέθηκαν αρχεία followers/following μέσα στο .zip. Βεβαιώσου ότι στην εξαγωγή επέλεξες το Followers and following.'
  },
  en: {
    title: 'Followers & Unfollowers',
    howItWorks: 'How it works?',
    instructions: 'Download the export of your <b>followers</b> and <b>following</b> from Instagram (format <b>JSON</b>, range <b>All time</b>) and upload the <b>.zip</b> here as is. The app finds the files on its own.',
    openGuide: 'See the steps in detail',
    openExport: 'Open the export page on Instagram',
    guide: 'Guide',
    followers: 'Followers',
    following: 'Following',
    users: 'users',
    uploadPlaceholder: 'Click or drag the .zip or files here',
    notFollowingBack: 'Not following back',
    fans: 'Fans',
    mutuals: 'Mutuals',
    descNotFollowingBack: "You follow them, but they don't follow you back.",
    descFans: "They follow you, but you don't follow them.",
    descMutuals: 'You follow each other.',
    unfollowedYou: 'Unfollowed you',
    youUnfollowed: 'You unfollowed',
    descUnfollowedYou: 'They followed you on {date}, but not anymore.',
    descUnfollowedYouFirst: 'Your followers were saved, on this device only. Next time you upload a new export, you will see here who unfollowed you in the meantime. If you have an older export or a history file, upload it now to compare right away.',
    descYouUnfollowed: 'Accounts you recently stopped following, according to Instagram.',
    clearHistory: 'Clear history',
    cancel: 'Cancel',
    tipCompareOlder: 'Upload an older zip from Instagram to see who unfollowed you since then.',
    tipBackup: 'Download a file with your followers list, so the comparison is not lost.',
    tipRestore: 'Load a history file you saved earlier.',
    tipClear: 'Deletes the followers list the app remembers on this device.',
    dlgCompareOlder: 'If you kept an <b>older export</b> from Instagram (e.g. from a month ago), choose it in the next step. The app will compare your followers back then with your current ones and show you who left.<br><br>It must be from the <b>same account</b>. The file is read only on your device.',
    dlgBackup: 'The app remembers your followers <b>only in this browser</b>, and that can be lost (e.g. if you clear browser data or change phone).<br><br>Saving downloads a <b>small file (.json)</b> with this list to your device. Keep it, and whenever needed load it with <b>Restore history</b>.<br><br>The file contains your followers\' usernames, so do not share it.',
    dlgRestore: 'If you used <b>Save history</b> before, choose that file (.json) in the next step. The app will compare your followers back then with your current ones.<br><br>It also works on another device or browser, as long as it is from the <b>same account</b>.',
    dlgClear: 'The followers list the app has kept <b>in this browser</b> will be deleted. The next comparison will start from scratch.<br><br>Files you downloaded (exports or history files) are not affected. <b>This cannot be undone.</b>',
    chooseFile: 'Choose file',
    filters: 'Filters',
    dateFrom: 'From',
    dateTo: 'To',
    sortBy: 'Sort',
    sortNewest: 'Newest first',
    sortOldest: 'Oldest first',
    sortAZ: 'Alphabetical (A–Z)',
    clearFilters: 'Clear filters',
    showing: 'Showing {n} of {total}',
    download: 'Download file',
    delete: 'Delete',
    compareOlder: 'Compare with an older export',
    backupHistory: 'Save history',
    restoreHistory: 'Restore history',
    errorOtherAccount: 'This file is from a different account',
    errorNotOlder: 'This export is not older than the current one',
    errorBackup: 'Not a valid history file of this app',
    followingSince: 'Following since',
    followsYouSince: 'Follows you since',
    followedYouSince: 'Followed you since',
    unfollowedOn: 'Unfollowed on',
    descHistoryCleared: 'History was deleted from this device. It will start again the next time you upload files.',
    searchPlaceholder: 'Search user...',
    noResults: 'No results found',
    waitingFiles: 'Waiting for your files...',
    madeForFriends: 'Made for friends',
    errorParsing: 'Error parsing file. Please ensure it\'s a valid Instagram export file.',
    noDate: 'No date',
    files: 'files',
    errorZip: 'Could not open the .zip file.',
    zipEmpty: 'No followers/following files found in the .zip. Make sure you selected Followers and following in the export.'
  }
};

export default function App() {
  const [language, setLanguage] = useState<Language>('el');
  const [followers, setFollowers] = useState<UserData[]>([]);
  const [following, setFollowing] = useState<UserData[]>([]);
  const [followersFileName, setFollowersFileName] = useState<string>('');
  const [followingFileName, setFollowingFileName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<Tab>('notFollowingBack');
  // Followers comparison with the previous upload on this device
  const [history, setHistory] = useState<{ account: string; current: Snapshot; previousAt: number | null; unfollowedYou: UserData[]; cleared?: boolean } | null>(null);
  // From recently_unfollowed_profiles.json in the export (null = not in the uploaded files)
  const [youUnfollowed, setYouUnfollowed] = useState<UserData[] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  // Date filter (YYYY-MM-DD from <input type="date">) and sort order of the list
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [error, setError] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  // Errors from the history actions, shown inside the 'Unfollowed you' tab
  const [historyError, setHistoryError] = useState<string | null>(null);
  // History action waiting for the user's confirmation
  const [pendingAction, setPendingAction] = useState<HistoryAction | null>(null);
  const olderInputRef = useRef<HTMLInputElement>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);
  const cancelAction = useCallback(() => setPendingAction(null), []);
  const closeGuide = useCallback(() => setGuideOpen(false), []);

  const t = translations[language];

  // Parser for Instagram HTML/JSON/TXT files
  const parseFile = async (file: File): Promise<UserData[]> => {
    const text = await file.text();
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.json')) {
      try {
        const data = JSON.parse(text);
        // Handle different Instagram JSON formats
        let list: any[] = [];
        
        // Format 1: { "relationships_followers": [...] } or similar
        if (Array.isArray(data)) {
          list = data;
        } else if (data.relationships_followers) {
          list = data.relationships_followers;
        } else if (data.relationships_following) {
          list = data.relationships_following;
        } else {
          // Deep search for string_list_data
          const findListData = (obj: any): any[] => {
            if (!obj || typeof obj !== 'object') return [];
            if (Array.isArray(obj)) {
              if (obj.length > 0 && obj[0].string_list_data) return obj;
              return obj.flatMap(findListData);
            }
            return Object.values(obj).flatMap(findListData);
          };
          list = findListData(data);
        }

        return list.map(item => {
          // Newer export format: { label_values: [{ label: 'Username', value }, { label: 'URL', value }] }
          if (Array.isArray(item.label_values)) {
            const get = (label: string) => item.label_values.find((l: any) => l.label === label)?.value as string | undefined;
            const username = get('Username') || 'Unknown';
            return {
              username,
              link: get('URL') || `https://instagram.com/${username}`,
              date: item.timestamp ? new Date(item.timestamp * 1000).toLocaleString() : '',
              timestamp: item.timestamp
            };
          }
          const entry = item.string_list_data?.[0] || {};
          let username = item.title || entry.value || 'Unknown';
          
          // If username is still unknown or looks like a URL, try to extract from href
          if ((username === 'Unknown' || username.startsWith('http')) && entry.href) {
            try {
              const url = new URL(entry.href);
              username = url.pathname.split('/').filter(Boolean).pop() || username;
            } catch (e) {
              // Fallback for non-standard URLs
              username = entry.href.split('/').filter(Boolean).pop() || username;
            }
          }

          return {
            username,
            link: entry.href || `https://instagram.com/${username}`,
            date: entry.timestamp ? new Date(entry.timestamp * 1000).toLocaleString() : '',
            timestamp: entry.timestamp
          };
        }).filter(u => u.username !== 'Unknown');
      } catch (e) {
        throw new Error('Invalid JSON format');
      }
    } else if (fileName.endsWith('.html')) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const users: UserData[] = [];

      // Instagram HTML format: User entries are usually in div.pam elements
      // that are direct children of the main container or have specific classes.
      // We want to target the "cards" without double-counting nested divs.
      const cards = doc.querySelectorAll('div.pam.uiBoxWhite');
      
      cards.forEach(card => {
        const h2 = card.querySelector('h2');
        const link = card.querySelector('a');
        
        // Find the date - usually a div that contains a year (4 digits)
        const divs = Array.from(card.querySelectorAll('div'));
        const dateDiv = divs.find(d => {
          const content = d.textContent || '';
          return /\d{4}/.test(content) && !d.querySelector('a') && d.children.length === 0;
        });

        let username = '';
        let href = '';
        let date = dateDiv?.textContent?.trim() || '';

        // In "Following", username is often in h2
        if (h2) {
          username = h2.textContent?.trim() || '';
        }

        // In "Followers", username is often the text content of the link
        if (link) {
          const linkText = link.textContent?.trim() || '';
          const linkHref = link.getAttribute('href') || '';
          
          if (!username || username.startsWith('http')) {
            username = linkText;
          }
          href = linkHref;
        }

        // Clean up username (sometimes it contains the full URL or extra text)
        if (username.includes('instagram.com')) {
          username = username.split('/').filter(Boolean).pop() || username;
        }

        if (username && 
            username !== 'Followers' && 
            username !== 'Following' && 
            !username.includes('Profiles you choose')) {
          users.push({ username, link: href, date });
        }
      });

      if (users.length === 0) {
        // Fallback for different HTML structures
        const links = doc.querySelectorAll('a');
        links.forEach(link => {
          const href = link.getAttribute('href') || '';
          if (href.includes('instagram.com')) {
            let username = link.textContent?.trim() || '';
            if (!username || username.startsWith('http')) {
              username = href.split('/').filter(Boolean).pop() || '';
            }
            if (username && username !== 'Instagram') {
              users.push({ username, link: href, date: '' });
            }
          }
        });
      }

      // Final deduplication by username
      const uniqueUsers: UserData[] = [];
      const seen = new Set();
      for (const user of users) {
        const key = user.username.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          uniqueUsers.push(user);
        }
      }

      return uniqueUsers;
    } else {
      // TXT format - assume one username per line
      return text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith('#'))
        .map(username => ({ username, link: `https://instagram.com/${username}`, date: '' }));
    }
  };

  // Merges users from several files, keeping the first occurrence of each username
  const mergeUsers = (lists: UserData[][]): UserData[] => {
    const seen = new Set<string>();
    const merged: UserData[] = [];
    for (const list of lists) {
      for (const user of list) {
        const key = user.username.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(user);
        }
      }
    }
    return merged;
  };

  // Extracts the followers / following files from an Instagram export .zip.
  // JSON files are preferred; HTML files are used only if no JSON is present.
  const extractFromZip = async (zipFile: File): Promise<{ followers: File[]; following: File[]; unfollowed: File[] }> => {
    const buffer = new Uint8Array(await zipFile.arrayBuffer());
    const isFollowers = (name: string) => /^followers(_\d+)?\.(json|html)$/i.test(name);
    const isFollowing = (name: string) => /^following\.(json|html)$/i.test(name);
    const isUnfollowed = (name: string) => /^recently_unfollowed_profiles\.(json|html)$/i.test(name);
    const baseName = (path: string) => path.split('/').pop() || '';

    const entries = await new Promise<Record<string, Uint8Array>>((resolve, reject) => {
      unzip(buffer, { filter: f => { const n = baseName(f.name); return isFollowers(n) || isFollowing(n) || isUnfollowed(n); } },
        (err, data) => (err ? reject(err) : resolve(data)));
    });

    const toFiles = (match: (n: string) => boolean) => {
      const all = Object.entries(entries)
        .filter(([path]) => match(baseName(path)))
        .map(([path, data]) => new File([data], baseName(path)));
      const json = all.filter(f => f.name.toLowerCase().endsWith('.json'));
      return json.length > 0 ? json : all;
    };

    return { followers: toFiles(isFollowers), following: toFiles(isFollowing), unfollowed: toFiles(isUnfollowed) };
  };

  const parseAll = async (files: File[]): Promise<UserData[] | null> => {
    const lists: UserData[][] = [];
    for (const file of files) {
      try {
        lists.push(await parseFile(file));
      } catch (err) {
        setError(`${t.errorParsing} (${file.name})`);
        return null;
      }
    }
    return mergeUsers(lists);
  };

  const locale = language === 'el' ? 'el-GR' : 'en-GB';

  // Shows who is in `previous` but not in `current`
  const applyHistory = (account: string, current: Snapshot, previous: Snapshot | null) => {
    setHistoryError(null);
    const now = new Set(current.users.map(u => u.u.toLowerCase()));
    const unfollowedYou: UserData[] = previous
      ? previous.users
          .filter(p => !now.has(p.u.toLowerCase()))
          .map(p => ({ username: p.u, link: `https://instagram.com/${p.u}`, date: '', timestamp: p.t }))
      : [];
    setHistory({ account, current, previousAt: previous ? previous.savedAt : null, unfollowedYou });
  };

  // Compares the new followers list with the one saved on this device last time
  const updateHistory = (account: string, data: UserData[], dataDate?: number) => {
    const current = toSnapshot(data, dataDate);
    applyHistory(account, current, recordFollowers(account, current));
  };

  const isOtherAccount = (a: string, b: string) => a !== '_' && b !== '_' && a !== b;

  // Older Instagram export (zip or followers files) to compare against right away
  const handleOlderExport = async (e: ChangeEvent<HTMLInputElement>) => {
    const files: File[] = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = '';
    if (!history || files.length === 0) return;
    setHistoryError(null);

    let followerFiles = files.filter(f => !f.name.toLowerCase().endsWith('.zip'));
    const zip = files.find(f => f.name.toLowerCase().endsWith('.zip'));
    if (zip) {
      try {
        followerFiles = (await extractFromZip(zip)).followers;
      } catch {
        setHistoryError(`${t.errorZip} (${zip.name})`);
        return;
      }
      if (followerFiles.length === 0) {
        setHistoryError(`${t.zipEmpty} (${zip.name})`);
        return;
      }
      if (isOtherAccount(accountFromZipName(zip.name), history.account)) {
        setHistoryError(`${t.errorOtherAccount} (${zip.name})`);
        return;
      }
    }
    const data = await parseAll(followerFiles);
    if (!data) return;
    const date = (zip && dateFromZipName(zip.name)) ?? files[0].lastModified;
    if (date >= history.current.savedAt && zip && dateFromZipName(zip.name) !== undefined) {
      setHistoryError(`${t.errorNotOlder} (${zip.name})`);
      return;
    }
    const previous = toSnapshot(data, date);
    setPair(history.account, previous, history.current);
    applyHistory(history.account, history.current, previous);
  };

  // Saves the stored history as a file the user keeps
  const handleBackup = () => {
    if (!history) return;
    const content = makeBackup(history.account);
    if (!content) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
    const day = new Date().toISOString().slice(0, 10);
    a.download = `followers-history-${history.account === '_' ? 'account' : history.account}-${day}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // Restores a history file saved earlier (e.g. on another device or browser)
  const handleRestore = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!history || !file) return;
    setHistoryError(null);
    const backup = parseBackup(await file.text());
    if (!backup) {
      setHistoryError(`${t.errorBackup} (${file.name})`);
      return;
    }
    if (isOtherAccount(backup.account, history.account)) {
      setHistoryError(`${t.errorOtherAccount} (${file.name})`);
      return;
    }
    const { latest, baseline } = backup.store;
    const previous = latest && !sameUsers(latest, history.current) ? latest : baseline ?? null;
    if (previous) setPair(history.account, previous, history.current);
    applyHistory(history.account, history.current, previous);
  };

  // Runs a history action after the user confirmed it in the dialog
  const runPendingAction = () => {
    const action = pendingAction;
    setPendingAction(null);
    if (!history) return;
    if (action === 'compareOlder') olderInputRef.current?.click();
    if (action === 'restore') restoreInputRef.current?.click();
    if (action === 'backup') handleBackup();
    if (action === 'clear') {
      clearHistory(history.account);
      setHistory({ ...history, previousAt: null, unfollowedYou: [], cleared: true });
      setHistoryError(null);
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>, type: 'followers' | 'following') => {
    const files: File[] = e.target.files ? Array.from(e.target.files) : [];
    // Reset the input so selecting the same file(s) again still triggers onChange
    e.target.value = '';
    if (files.length === 0) return;

    setError(null);
    const zips = files.filter(f => f.name.toLowerCase().endsWith('.zip'));
    const plain = files.filter(f => !f.name.toLowerCase().endsWith('.zip'));

    // A .zip fills both boxes at once, whichever box it was dropped on
    if (zips.length > 0) {
      const found = { followers: [] as File[], following: [] as File[], unfollowed: [] as File[] };
      for (const zip of zips) {
        try {
          const r = await extractFromZip(zip);
          found.followers.push(...r.followers);
          found.following.push(...r.following);
          found.unfollowed.push(...r.unfollowed);
        } catch (err) {
          setError(`${t.errorZip} (${zip.name})`);
          return;
        }
      }
      if (found.followers.length === 0 && found.following.length === 0) {
        setError(`${t.zipEmpty} (${zips[0].name})`);
        return;
      }
      const zipLabel = zips.length === 1 ? zips[0].name : `${zips.length} ${t.files}`;
      if (found.followers.length > 0) {
        const data = await parseAll(found.followers);
        if (!data) return;
        setFollowers(data);
        setFollowersFileName(zipLabel);
        updateHistory(accountFromZipName(zips[0].name), data, dateFromZipName(zips[0].name));
      }
      if (found.following.length > 0) {
        const data = await parseAll(found.following);
        if (!data) return;
        setFollowing(data);
        setFollowingFileName(zipLabel);
      }
      if (found.unfollowed.length > 0) {
        const data = await parseAll(found.unfollowed);
        if (!data) return;
        setYouUnfollowed(data);
      }
      if (plain.length === 0) return;
    }

    const data = await parseAll(plain);
    if (!data) return;
    const label = plain.length === 1 ? plain[0].name : `${plain.length} ${t.files}`;
    if (type === 'followers') {
      setFollowers(data);
      setFollowersFileName(label);
      updateHistory('_', data);
    } else {
      setFollowing(data);
      setFollowingFileName(label);
    }
  };

  const clearFiles = () => {
    setFollowers([]);
    setFollowing([]);
    setFollowersFileName('');
    setFollowingFileName('');
    setError(null);
    setHistory(null);
    setYouUnfollowed(null);
    setHistoryError(null);
    setActiveTab('notFollowingBack');
    setDateFrom('');
    setDateTo('');
  };

  const getComparison = (): ComparisonResult => {
    const followerNames = new Set(followers.map(u => u.username.toLowerCase()));
    const followingNames = new Set(following.map(u => u.username.toLowerCase()));

    const notFollowingBack = following.filter(u => !followerNames.has(u.username.toLowerCase()));
    const fans = followers.filter(u => !followingNames.has(u.username.toLowerCase()));
    const mutuals = following.filter(u => followerNames.has(u.username.toLowerCase()));

    return { notFollowingBack, fans, mutuals };
  };

  const comparison = getComparison();
  const results: Record<Tab, UserData[]> = {
    ...comparison,
    unfollowedYou: history?.unfollowedYou ?? [],
    youUnfollowed: youUnfollowed ?? []
  };
  // Local-time day bounds for the date filter (inclusive)
  const fromMs = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
  const toMs = dateTo ? new Date(`${dateTo}T23:59:59.999`).getTime() : null;
  const dateFilterActive = fromMs !== null || toMs !== null;
  const tabList = results[activeTab];
  const currentList = tabList
    .filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(u => {
      if (!dateFilterActive) return true;
      if (!u.timestamp) return false; // no date: cannot match a date range
      const ms = u.timestamp * 1000;
      return (fromMs === null || ms >= fromMs) && (toMs === null || ms <= toMs);
    })
    .sort((a, b) => {
      if (sortOrder === 'az') return a.username.localeCompare(b.username);
      // Entries without a date go last
      const ta = a.timestamp ?? (sortOrder === 'newest' ? -Infinity : Infinity);
      const tb = b.timestamp ?? (sortOrder === 'newest' ? -Infinity : Infinity);
      return sortOrder === 'newest' ? tb - ta : ta - tb;
    });
  const filtersChanged = dateFilterActive || sortOrder !== 'newest';

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button 
            onClick={clearFiles}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer text-left"
          >
            <div className="bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-1.5 rounded-xl">
              <ArrowRightLeft className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight whitespace-nowrap">{t.title}</h1>
          </button>
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              onClick={() => setGuideOpen(true)}
              aria-label={t.guide}
              title={t.guide}
              className="text-neutral-500 hover:text-purple-600 transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setLanguage(language === 'el' ? 'en' : 'el')}
              className="text-xs font-bold bg-neutral-100 px-2.5 py-1.5 rounded-lg hover:bg-neutral-200 transition-colors uppercase"
            >
              {language === 'el' ? 'EN' : 'EL'}
            </button>
            {followers.length > 0 && following.length > 0 && (
              <button 
                onClick={clearFiles}
                className="text-neutral-500 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6">
        {/* Info Card */}
        <AnimatePresence>
          {followers.length === 0 || following.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-8"
            >
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">{t.howItWorks}</h3>
                  <p 
                    className="text-sm text-blue-800 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: t.instructions }}
                  />
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <a
                      href={IG_EXPORT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                    >
                      {t.openExport}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => setGuideOpen(true)}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-900 transition-colors"
                    >
                      {t.openGuide}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <UploadCard 
            title={t.followers} 
            fileName={followersFileName} 
            count={followers.length}
            onUpload={(e) => handleFileUpload(e, 'followers')}
            icon={<Users className="w-5 h-5" />}
            placeholder={t.uploadPlaceholder}
            usersLabel={t.users}
          />
          <UploadCard 
            title={t.following} 
            fileName={followingFileName} 
            count={following.length}
            onUpload={(e) => handleFileUpload(e, 'following')}
            icon={<UserPlus className="w-5 h-5" />}
            placeholder={t.uploadPlaceholder}
            usersLabel={t.users}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Results Section */}
        {followers.length > 0 && following.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-neutral-200/50 rounded-xl">
              <TabButton 
                active={activeTab === 'notFollowingBack'} 
                onClick={() => setActiveTab('notFollowingBack')}
                label={t.notFollowingBack}
                count={results.notFollowingBack.length}
              />
              <TabButton 
                active={activeTab === 'fans'} 
                onClick={() => setActiveTab('fans')}
                label={t.fans}
                count={results.fans.length}
              />
              <TabButton 
                active={activeTab === 'mutuals'} 
                onClick={() => setActiveTab('mutuals')}
                label={t.mutuals}
                count={results.mutuals.length}
              />
              {history && (
                <TabButton
                  active={activeTab === 'unfollowedYou'}
                  onClick={() => setActiveTab('unfollowedYou')}
                  label={t.unfollowedYou}
                  count={results.unfollowedYou.length}
                />
              )}
              {youUnfollowed && (
                <TabButton
                  active={activeTab === 'youUnfollowed'}
                  onClick={() => setActiveTab('youUnfollowed')}
                  label={t.youUnfollowed}
                  count={results.youUnfollowed.length}
                />
              )}
            </div>

            {/* Short explanation of the active tab */}
            <div className="-mt-3 px-1 text-sm text-neutral-500 space-y-1">
              <p>
                {activeTab === 'notFollowingBack' && t.descNotFollowingBack}
                {activeTab === 'fans' && t.descFans}
                {activeTab === 'mutuals' && t.descMutuals}
                {activeTab === 'youUnfollowed' && t.descYouUnfollowed}
                {activeTab === 'unfollowedYou' && history && (history.cleared ? t.descHistoryCleared : history.previousAt
                  ? t.descUnfollowedYou.replace('{date}', new Date(history.previousAt).toLocaleDateString(locale))
                  : t.descUnfollowedYouFirst)}
              </p>
              {activeTab === 'unfollowedYou' && historyError && (
                <p className="flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {historyError}
                </p>
              )}
              {activeTab === 'unfollowedYou' && history && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs">
                  <ActionLink label={t.compareOlder} tip={t.tipCompareOlder} onClick={() => setPendingAction('compareOlder')} />
                  {!history.cleared && (
                    <ActionLink label={t.backupHistory} tip={t.tipBackup} onClick={() => setPendingAction('backup')} />
                  )}
                  <ActionLink label={t.restoreHistory} tip={t.tipRestore} onClick={() => setPendingAction('restore')} />
                  {!history.cleared && (
                    <ActionLink label={t.clearHistory} tip={t.tipClear} danger alignRight onClick={() => setPendingAction('clear')} />
                  )}
                  <input ref={olderInputRef} type="file" accept=".zip,.json,.html" multiple className="hidden" onChange={handleOlderExport} />
                  <input ref={restoreInputRef} type="file" accept=".json" className="hidden" onChange={handleRestore} />
                </div>
              )}
            </div>

            {/* Search + filters */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input 
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  />
                </div>
                <button
                  onClick={() => setFiltersOpen(o => !o)}
                  aria-expanded={filtersOpen}
                  aria-label={t.filters}
                  className={`relative shrink-0 flex items-center gap-2 px-3.5 rounded-xl border transition-colors ${
                    filtersOpen || filtersChanged
                      ? 'bg-purple-50 border-purple-300 text-purple-700'
                      : 'bg-white border-neutral-200 text-neutral-600 hover:border-purple-300'
                  }`}
                >
                  <SlidersHorizontal className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm font-medium">{t.filters}</span>
                  {filtersChanged && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-purple-600" />}
                </button>
              </div>

              {filtersOpen && (
                <div className="bg-white border border-neutral-200 rounded-xl p-3 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-xs font-medium text-neutral-500 space-y-1">
                      <span>{t.dateFrom}</span>
                      <input
                        type="date"
                        value={dateFrom}
                        max={dateTo || undefined}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="block w-full min-w-0 px-2.5 py-2 text-sm text-neutral-900 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-purple-500"
                      />
                    </label>
                    <label className="text-xs font-medium text-neutral-500 space-y-1">
                      <span>{t.dateTo}</span>
                      <input
                        type="date"
                        value={dateTo}
                        min={dateFrom || undefined}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="block w-full min-w-0 px-2.5 py-2 text-sm text-neutral-900 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-purple-500"
                      />
                    </label>
                  </div>
                  <label className="block text-xs font-medium text-neutral-500 space-y-1">
                    <span>{t.sortBy}</span>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                      className="block w-full px-2.5 py-2 text-sm text-neutral-900 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-purple-500"
                    >
                      <option value="newest">{t.sortNewest}</option>
                      <option value="oldest">{t.sortOldest}</option>
                      <option value="az">{t.sortAZ}</option>
                    </select>
                  </label>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">
                      {t.showing.replace('{n}', String(currentList.length)).replace('{total}', String(tabList.length))}
                    </span>
                    {filtersChanged && (
                      <button
                        onClick={() => { setDateFrom(''); setDateTo(''); setSortOrder('newest'); }}
                        className="text-purple-600 underline hover:text-purple-800"
                      >
                        {t.clearFilters}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* List */}
            <div className="space-y-3">
              {currentList.length > 0 ? (
                currentList.map((user, i) => (
                  <motion.div 
                    key={user.username + i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.5) }}
                    className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm flex items-center justify-between group hover:border-purple-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                        style={avatarColors(user.username)}
                      >
                        {user.username[0].toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-900">{user.username}</h4>
                        <p className="text-xs text-neutral-500">
                          {(() => {
                            const d = user.timestamp
                              ? new Date(user.timestamp * 1000).toLocaleString(locale, { day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
                              : user.date;
                            if (!d) return t.noDate;
                            const label = activeTab === 'fans' ? t.followsYouSince
                              : activeTab === 'unfollowedYou' ? t.followedYouSince
                              : activeTab === 'youUnfollowed' ? t.unfollowedOn
                              : t.followingSince;
                            return `${label} ${d}`;
                          })()}
                        </p>
                      </div>
                    </div>
                    <a 
                      href={user.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 text-neutral-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 text-neutral-500">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>{t.noResults}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Empty State Illustration */}
        {(followers.length === 0 || following.length === 0) && (
          <div className="flex flex-col items-center justify-center py-20 opacity-20 select-none pointer-events-none">
            <Users className="w-24 h-24 mb-4" />
            <p className="text-lg font-medium">{t.waitingFiles}</p>
          </div>
        )}
      </main>

      <Guide open={guideOpen} onClose={closeGuide} language={language} />

      <ConfirmDialog
        open={pendingAction !== null}
        title={
          pendingAction === 'compareOlder' ? t.compareOlder
          : pendingAction === 'backup' ? t.backupHistory
          : pendingAction === 'restore' ? t.restoreHistory
          : t.clearHistory
        }
        body={
          pendingAction === 'compareOlder' ? t.dlgCompareOlder
          : pendingAction === 'backup' ? t.dlgBackup
          : pendingAction === 'restore' ? t.dlgRestore
          : t.dlgClear
        }
        confirmLabel={pendingAction === 'backup' ? t.download : pendingAction === 'clear' ? t.delete : t.chooseFile}
        cancelLabel={t.cancel}
        danger={pendingAction === 'clear'}
        onConfirm={runPendingAction}
        onCancel={cancelAction}
      />

      {/* Footer */}
      <footer className="mt-auto py-8 text-center text-neutral-400 text-sm">
        <p>© 2026 {t.title} • {t.madeForFriends}</p>
        <p className="mt-1 text-xs">v{__APP_VERSION__}</p>
      </footer>
    </div>
  );
}

function UploadCard({ title, fileName, count, onUpload, icon, placeholder, usersLabel }: { 
  title: string, 
  fileName: string, 
  count: number,
  onUpload: (e: ChangeEvent<HTMLInputElement>) => void,
  icon: ReactNode,
  placeholder: string,
  usersLabel: string
}) {
  return (
    <div className={`relative overflow-hidden bg-white border-2 border-dashed rounded-2xl p-6 transition-all ${fileName ? 'border-green-500 bg-green-50/30' : 'border-neutral-200 hover:border-purple-300'}`}>
      <input 
        type="file" 
        accept=".zip,.json,.html,.txt"
        multiple
        onChange={onUpload}
        className="absolute inset-0 opacity-0 cursor-pointer z-10"
      />
      <div className="flex flex-col items-center text-center gap-2">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 ${fileName ? 'bg-green-100 text-green-600' : 'bg-neutral-100 text-neutral-500'}`}>
          {fileName ? <CheckCircle2 className="w-6 h-6" /> : icon}
        </div>
        <h3 className="font-bold text-neutral-800">{title}</h3>
        {fileName ? (
          <div className="space-y-1">
            <p className="text-xs text-green-700 font-medium truncate max-w-[150px]">{fileName}</p>
            <p className="text-lg font-bold text-green-600">{count} <span className="text-xs font-normal opacity-70">{usersLabel}</span></p>
          </div>
        ) : (
          <p className="text-xs text-neutral-400">{placeholder}</p>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label, count }: { active: boolean, onClick: () => void, label: string, count: number }) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 py-2.5 px-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-0.5 ${
        active 
          ? 'bg-white text-purple-600 shadow-sm' 
          : 'text-neutral-500 hover:text-neutral-700'
      }`}
    >
      <span>{label}</span>
      <span className={`text-[10px] px-1.5 rounded-full ${active ? 'bg-purple-100' : 'bg-neutral-200'}`}>
        {count}
      </span>
    </button>
  );
}
