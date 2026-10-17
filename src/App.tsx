import { useState, useCallback, ChangeEvent, ReactNode } from 'react';
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
  ChevronRight
} from 'lucide-react';
import Guide from './Guide';
import { unzip } from 'fflate';

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

const translations = {
  el: {
    title: 'Followers & Unfollowers',
    howItWorks: 'Πώς λειτουργεί;',
    instructions: 'Κατέβασε από το Instagram την εξαγωγή με τους <b>followers</b> και <b>following</b> σου (μορφή <b>JSON</b>, εύρος <b>All time</b>) και ανέβασε εδώ το <b>.zip</b> όπως είναι. Η εφαρμογή βρίσκει μόνη της τα αρχεία.',
    openGuide: 'Δες αναλυτικά τα βήματα',
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
  const [activeTab, setActiveTab] = useState<'notFollowingBack' | 'fans' | 'mutuals'>('notFollowingBack');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
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
  const extractFromZip = async (zipFile: File): Promise<{ followers: File[]; following: File[] }> => {
    const buffer = new Uint8Array(await zipFile.arrayBuffer());
    const isFollowers = (name: string) => /^followers(_\d+)?\.(json|html)$/i.test(name);
    const isFollowing = (name: string) => /^following\.(json|html)$/i.test(name);
    const baseName = (path: string) => path.split('/').pop() || '';

    const entries = await new Promise<Record<string, Uint8Array>>((resolve, reject) => {
      unzip(buffer, { filter: f => { const n = baseName(f.name); return isFollowers(n) || isFollowing(n); } },
        (err, data) => (err ? reject(err) : resolve(data)));
    });

    const toFiles = (match: (n: string) => boolean) => {
      const all = Object.entries(entries)
        .filter(([path]) => match(baseName(path)))
        .map(([path, data]) => new File([data], baseName(path)));
      const json = all.filter(f => f.name.toLowerCase().endsWith('.json'));
      return json.length > 0 ? json : all;
    };

    return { followers: toFiles(isFollowers), following: toFiles(isFollowing) };
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
      const found = { followers: [] as File[], following: [] as File[] };
      for (const zip of zips) {
        try {
          const r = await extractFromZip(zip);
          found.followers.push(...r.followers);
          found.following.push(...r.following);
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
      }
      if (found.following.length > 0) {
        const data = await parseAll(found.following);
        if (!data) return;
        setFollowing(data);
        setFollowingFileName(zipLabel);
      }
      if (plain.length === 0) return;
    }

    const data = await parseAll(plain);
    if (!data) return;
    const label = plain.length === 1 ? plain[0].name : `${plain.length} ${t.files}`;
    if (type === 'followers') {
      setFollowers(data);
      setFollowersFileName(label);
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
  };

  const getComparison = (): ComparisonResult => {
    const followerNames = new Set(followers.map(u => u.username.toLowerCase()));
    const followingNames = new Set(following.map(u => u.username.toLowerCase()));

    const notFollowingBack = following.filter(u => !followerNames.has(u.username.toLowerCase()));
    const fans = followers.filter(u => !followingNames.has(u.username.toLowerCase()));
    const mutuals = following.filter(u => followerNames.has(u.username.toLowerCase()));

    return { notFollowingBack, fans, mutuals };
  };

  const results = getComparison();
  const currentList = results[activeTab].filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                  <button
                    onClick={() => setGuideOpen(true)}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-900 transition-colors"
                  >
                    {t.openGuide}
                    <ChevronRight className="w-4 h-4" />
                  </button>
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
            <div className="flex p-1 bg-neutral-200/50 rounded-xl">
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
            </div>

            {/* Short explanation of the active tab */}
            <p className="-mt-3 px-1 text-sm text-neutral-500">
              {activeTab === 'notFollowingBack' ? t.descNotFollowingBack : activeTab === 'fans' ? t.descFans : t.descMutuals}
            </p>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input 
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
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
                      <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 font-bold">
                        {user.username[0].toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-900">{user.username}</h4>
                        <p className="text-xs text-neutral-500">{user.date || t.noDate}</p>
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
