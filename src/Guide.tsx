import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink } from 'lucide-react';

// Direct links into Instagram's Accounts Center (open in the browser; may ask to log in)
export const IG_INFO_URL = 'https://accountscenter.instagram.com/info_and_permissions/';
export const IG_EXPORT_URL = 'https://accountscenter.instagram.com/info_and_permissions/dyi/';

type Language = 'el' | 'en';

interface GuideStep {
  title: string;
  body: string;
  /** Optional screenshot, path relative to the site root (e.g. 'guide/step-1.jpg') */
  image?: string;
  /** Optional direct link that skips to this screen */
  link?: string;
}

const content: Record<Language, { heading: string; intro: string; close: string; tip: string; steps: GuideStep[]; dataTitle: string; dataItems: string[]; shortcutTitle: string; shortcutBody: string; shortcutButton: string; openLink: string }> = {
  el: {
    heading: 'Αναλυτικός οδηγός',
    intro: 'Το Instagram δεν δίνει τη λίστα απευθείας. Ζητάς ένα αρχείο εξαγωγής των δεδομένων σου και το ανεβάζεις εδώ. Τα αρχεία διαβάζονται μόνο στη συσκευή σου και δεν στέλνονται πουθενά.',
    close: 'Κλείσιμο',
    shortcutTitle: 'Συντόμευση',
    shortcutBody: 'Άνοιξε κατευθείαν τη σελίδα εξαγωγής του Instagram και συνέχισε από το βήμα 4 (<b>Create export</b>). Ανοίγει στον browser· αν σου ζητήσει, συνδέσου στο Instagram.',
    shortcutButton: 'Άνοιξε την εξαγωγή',
    openLink: 'Άνοιγμα',
    tip: 'Οι εικόνες είναι από το Instagram στα αγγλικά. Τα ονόματα των μενού μπορεί να διαφέρουν λίγο ανάλογα με την έκδοση και τη γλώσσα.',
    dataTitle: 'Πού αποθηκεύονται τα δεδομένα',
    dataItems: [
      'Τα αρχεία σου διαβάζονται <b>μόνο στη συσκευή σου</b> και δεν ανεβαίνουν πουθενά.',
      'Για την καρτέλα <b>Σε έκαναν unfollow</b>, η λίστα των followers σου κρατιέται <b>μόνο σε αυτόν τον browser</b>, ώστε την επόμενη φορά να γίνει σύγκριση. Οι νέες εκδόσεις της εφαρμογής δεν τη σβήνουν.',
      '<b>Χάνεται</b> αν διαγράψεις τα δεδομένα του browser ή του site, αν χρησιμοποιείς ιδιωτική περιήγηση, ή αν ανοίξεις την εφαρμογή σε άλλο browser ή άλλη συσκευή. Στο iPhone (Safari) μπορεί να σβηστεί αν δεν ανοίξεις την εφαρμογή για περίπου 7 μέρες, εκτός αν την έχεις προσθέσει στην αρχική οθόνη.',
      '<b>Για να μη χάσεις τη σύγκριση:</b> πάτα <b>Αποθήκευση ιστορικού</b> και κράτα το αρχείο, για να το ανεβάσεις αργότερα με <b>Επαναφορά ιστορικού</b>. Ή κράτα τα παλιά σου exports από το Instagram: με <b>Σύγκριση με παλιότερο export</b> η εφαρμογή συγκρίνει απευθείας το παλιό με το νέο.',
    ],
    steps: [
      {
        title: 'Άνοιξε το Κέντρο λογαριασμών',
        body: 'Στο Instagram πήγαινε στο <b>προφίλ</b> σου → μενού <b>☰</b> (πάνω δεξιά) → <b>Accounts Center</b> (Κέντρο λογαριασμών). Μπορεί να εμφανίζεται και ως <b>Meta Account</b>. Από υπολογιστή: <b>accountscenter.instagram.com</b>.',
      },
      {
        title: 'Your information and permissions',
        body: 'Πάτα <b>Your information and permissions</b> (Οι πληροφορίες και οι άδειές σου).',
        image: 'guide/step-1.png',
        link: IG_INFO_URL,
      },
      {
        title: 'Export your information',
        body: 'Πάτα <b>Export your information</b> (Εξαγωγή των πληροφοριών σου).',
        image: 'guide/step-2.png',
        link: IG_EXPORT_URL,
      },
      {
        title: 'Create export',
        body: 'Πάτα <b>Create export</b> (Δημιουργία εξαγωγής).',
        image: 'guide/step-3.png',
      },
      {
        title: 'Διάλεξε το προφίλ Instagram',
        body: 'Διάλεξε τον λογαριασμό σου με την ένδειξη <b>Instagram</b>, όχι το Threads.',
        image: 'guide/step-4.png',
      },
      {
        title: 'Export to device',
        body: 'Πάτα <b>Export to device</b> (Εξαγωγή στη συσκευή).',
        image: 'guide/step-5.png',
      },
      {
        title: 'Άλλαξε τις 3 ρυθμίσεις και ξεκίνα',
        body: '<b>Customize information</b>: κράτησε μόνο το <b>Followers and following</b>. <b>Date range</b>: <b>All time</b>, αλλιώς θα λείπουν άτομα. <b>Format</b>: <b>JSON</b>. Μετά πάτα <b>Start export</b>. Μπορεί να σου ζητήσει τον κωδικό σου.',
        image: 'guide/step-6.png',
      },
      {
        title: 'Περίμενε και κατέβασε',
        body: 'Η εξαγωγή μπορεί να πάρει από λίγα λεπτά έως αρκετές ώρες. Όταν είναι έτοιμη θα λάβεις ειδοποίηση. Γύρνα στο <b>Export your information</b> και κατέβασε το αρχείο <b>.zip</b>. Έχεις <b>4 μέρες</b> για να το κατεβάσεις.',
        image: 'guide/step-7.png',
        link: IG_EXPORT_URL,
      },
      {
        title: 'Ανέβασέ το εδώ',
        body: 'Ανέβασε το <b>.zip</b> όπως το κατέβασες, σε οποιοδήποτε από τα δύο πλαίσια. Η εφαρμογή βρίσκει μόνη της τους followers και τους following, χωρίς να χρειάζεται αποσυμπίεση.',
      },
      {
        title: 'Εναλλακτικά: χωριστά αρχεία',
        body: 'Αν έχεις ήδη αποσυμπιέσει το zip, τα αρχεία είναι συνήθως στον φάκελο <b>connections/followers_and_following</b>. Στο πλαίσιο <b>Followers</b> ανέβασε το <b>followers_1.json</b> (και τα <b>followers_2.json</b> κ.λπ., όλα μαζί) και στο <b>Following</b> το <b>following.json</b>.',
      },
    ],
  },
  en: {
    heading: 'Step-by-step guide',
    intro: "Instagram doesn't show this list directly. You request an export of your data and upload it here. Files are read only on your device and are never sent anywhere.",
    close: 'Close',
    shortcutTitle: 'Shortcut',
    shortcutBody: 'Open Instagram\'s export page directly and continue from step 4 (<b>Create export</b>). It opens in your browser; log in to Instagram if asked.',
    shortcutButton: 'Open the export page',
    openLink: 'Open',
    tip: 'Screenshots are from Instagram in English. Menu names may differ slightly depending on the version and language.',
    dataTitle: 'Where your data is kept',
    dataItems: [
      'Your files are read <b>only on your device</b> and are never uploaded anywhere.',
      'For the <b>Unfollowed you</b> tab, your followers list is kept <b>only in this browser</b>, so it can be compared next time. New versions of the app do not delete it.',
      '<b>It is lost</b> if you clear the browser or site data, use private browsing, or open the app in another browser or device. On iPhone (Safari) it may be deleted if you do not open the app for about 7 days, unless you added it to your home screen.',
      '<b>To keep the comparison:</b> tap <b>Save history</b> and keep the file, then load it later with <b>Restore history</b>. Or keep your old Instagram exports: with <b>Compare with an older export</b> the app compares the old one with the new one directly.',
    ],
    steps: [
      {
        title: 'Open Accounts Center',
        body: 'In Instagram go to your <b>profile</b> → <b>☰</b> menu (top right) → <b>Accounts Center</b>. It may also appear as <b>Meta Account</b>. On a computer: <b>accountscenter.instagram.com</b>.',
      },
      {
        title: 'Your information and permissions',
        body: 'Tap <b>Your information and permissions</b>.',
        image: 'guide/step-1.png',
        link: IG_INFO_URL,
      },
      {
        title: 'Export your information',
        body: 'Tap <b>Export your information</b>.',
        image: 'guide/step-2.png',
        link: IG_EXPORT_URL,
      },
      {
        title: 'Create export',
        body: 'Tap <b>Create export</b>.',
        image: 'guide/step-3.png',
      },
      {
        title: 'Choose your Instagram profile',
        body: 'Pick your account marked <b>Instagram</b>, not Threads.',
        image: 'guide/step-4.png',
      },
      {
        title: 'Export to device',
        body: 'Tap <b>Export to device</b>.',
        image: 'guide/step-5.png',
      },
      {
        title: 'Change 3 settings and start',
        body: '<b>Customize information</b>: keep only <b>Followers and following</b>. <b>Date range</b>: <b>All time</b>, otherwise people will be missing. <b>Format</b>: <b>JSON</b>. Then tap <b>Start export</b>. You may be asked for your password.',
        image: 'guide/step-6.png',
      },
      {
        title: 'Wait and download',
        body: 'The export can take from a few minutes to several hours. You will get a notification when it is ready. Go back to <b>Export your information</b> and download the <b>.zip</b> file. You have <b>4 days</b> to download it.',
        image: 'guide/step-7.png',
        link: IG_EXPORT_URL,
      },
      {
        title: 'Upload it here',
        body: 'Upload the <b>.zip</b> as you downloaded it, into either box. The app finds the followers and following files on its own, no extracting needed.',
      },
      {
        title: 'Alternatively: separate files',
        body: 'If you have already extracted the zip, the files are usually in the <b>connections/followers_and_following</b> folder. In the <b>Followers</b> box upload <b>followers_1.json</b> (and <b>followers_2.json</b> etc., all at once) and in <b>Following</b> upload <b>following.json</b>.',
      },
    ],
  },
};

export default function Guide({ open, onClose, language }: { open: boolean; onClose: () => void; language: Language }) {
  const c = content[language];

  // Close on Escape and lock background scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="guide-heading"
            className="bg-white w-full sm:max-w-lg max-h-[90vh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
              <h2 id="guide-heading" className="text-lg font-bold">{c.heading}</h2>
              <button
                onClick={onClose}
                aria-label={c.close}
                className="p-2 -mr-2 text-neutral-500 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-5 space-y-5">
              <p className="text-sm text-neutral-600 leading-relaxed">{c.intro}</p>

              <div className="rounded-2xl border border-purple-200 bg-purple-50 p-4 space-y-3">
                <p className="text-sm text-purple-900 leading-relaxed">
                  <b>{c.shortcutTitle}:</b> <span dangerouslySetInnerHTML={{ __html: c.shortcutBody }} />
                </p>
                <a
                  href={IG_EXPORT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 transition-colors"
                >
                  {c.shortcutButton}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <ol className="space-y-5">
                {c.steps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white text-sm font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div className="space-y-2 min-w-0">
                      <h3 className="font-semibold text-neutral-900 leading-7">{step.title}</h3>
                      <p
                        className="text-sm text-neutral-600 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: step.body }}
                      />
                      {step.link && (
                        <a
                          href={step.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-semibold text-purple-600 hover:text-purple-800"
                        >
                          {c.openLink}
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {step.image && (
                        <img
                          src={`${import.meta.env.BASE_URL}${step.image}`}
                          alt={step.title}
                          loading="lazy"
                          className="w-full max-w-[320px] rounded-xl border border-neutral-200 shadow-sm"
                        />
                      )}
                    </div>
                  </li>
                ))}
              </ol>

              <p className="text-xs text-neutral-400">{c.tip}</p>

              <section className="rounded-2xl bg-neutral-50 border border-neutral-100 p-4 space-y-2">
                <h3 className="font-semibold text-neutral-900">{c.dataTitle}</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-neutral-600 leading-relaxed">
                  {c.dataItems.map((item, i) => (
                    <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                  ))}
                </ul>
              </section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
