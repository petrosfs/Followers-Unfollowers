import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

type Language = 'el' | 'en';

interface GuideStep {
  title: string;
  body: string;
  /** Optional screenshot, path relative to the site root (e.g. 'guide/step-1.jpg') */
  image?: string;
}

const content: Record<Language, { heading: string; intro: string; close: string; tip: string; steps: GuideStep[] }> = {
  el: {
    heading: 'Αναλυτικός οδηγός',
    intro: 'Το Instagram δεν δίνει τη λίστα απευθείας. Ζητάς ένα αρχείο εξαγωγής των δεδομένων σου και το ανεβάζεις εδώ. Τα αρχεία διαβάζονται μόνο στη συσκευή σου και δεν στέλνονται πουθενά.',
    close: 'Κλείσιμο',
    tip: 'Τα ονόματα των μενού μπορεί να διαφέρουν λίγο ανάλογα με την έκδοση της εφαρμογής και τη γλώσσα.',
    steps: [
      {
        title: 'Άνοιξε το Κέντρο λογαριασμών',
        body: 'Στο Instagram πήγαινε στο <b>προφίλ</b> σου → μενού <b>☰</b> (πάνω δεξιά) → <b>Κέντρο λογαριασμών</b> (<i>Accounts Center</i>).',
      },
      {
        title: 'Βρες την εξαγωγή δεδομένων',
        body: '<b>Οι πληροφορίες και οι άδειές σου</b> (<i>Your information and permissions</i>) → <b>Εξαγωγή των πληροφοριών σου</b> (<i>Export your information</i>).',
      },
      {
        title: 'Δημιούργησε εξαγωγή',
        body: '<b>Δημιουργία εξαγωγής</b> (<i>Create export</i>) → διάλεξε τον λογαριασμό Instagram → <b>Εξαγωγή στη συσκευή</b> (<i>Export to device</i>).',
      },
      {
        title: 'Διάλεξε μόνο τα απαραίτητα',
        body: 'Στο <b>Προσαρμογή πληροφοριών</b> (<i>Customize information</i>) κράτησε μόνο το <b>Followers and following</b>. Έτσι το αρχείο είναι μικρό και έρχεται πιο γρήγορα.',
      },
      {
        title: 'Ρύθμισε εύρος και μορφή',
        body: '<b>Εύρος ημερομηνιών</b> (<i>Date range</i>): <b>All time</b>, αλλιώς θα λείπουν άτομα. <b>Μορφή</b> (<i>Format</i>): <b>JSON</b>. Πάτα <b>Έναρξη εξαγωγής</b> (<i>Start export</i>). Μπορεί να σου ζητήσει τον κωδικό σου.',
      },
      {
        title: 'Περίμενε και κατέβασε',
        body: 'Η εξαγωγή μπορεί να πάρει από λίγα λεπτά έως αρκετές ώρες. Όταν είναι έτοιμη θα λάβεις ειδοποίηση. Γύρνα στην ίδια σελίδα και πάτα <b>Λήψη</b> (<i>Download</i>). Θα κατέβει ένα αρχείο <b>.zip</b>.',
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
    tip: 'Menu names may differ slightly depending on the app version and language.',
    steps: [
      {
        title: 'Open Accounts Center',
        body: 'In Instagram go to your <b>profile</b> → <b>☰</b> menu (top right) → <b>Accounts Center</b>.',
      },
      {
        title: 'Find the data export',
        body: '<b>Your information and permissions</b> → <b>Export your information</b>.',
      },
      {
        title: 'Create an export',
        body: '<b>Create export</b> → choose your Instagram account → <b>Export to device</b>.',
      },
      {
        title: 'Select only what is needed',
        body: 'In <b>Customize information</b> keep only <b>Followers and following</b>. The file stays small and arrives faster.',
      },
      {
        title: 'Set range and format',
        body: '<b>Date range</b>: <b>All time</b>, otherwise people will be missing. <b>Format</b>: <b>JSON</b>. Tap <b>Start export</b>. You may be asked for your password.',
      },
      {
        title: 'Wait and download',
        body: 'The export can take from a few minutes to several hours. You will get a notification when it is ready. Go back to the same page and tap <b>Download</b>. You will get a <b>.zip</b> file.',
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
                      {step.image && (
                        <img
                          src={`${import.meta.env.BASE_URL}${step.image}`}
                          alt={step.title}
                          loading="lazy"
                          className="w-full max-w-[260px] rounded-xl border border-neutral-200"
                        />
                      )}
                    </div>
                  </li>
                ))}
              </ol>

              <p className="text-xs text-neutral-400">{c.tip}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
