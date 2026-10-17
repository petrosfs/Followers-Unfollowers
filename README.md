# Followers & Unfollowers

Σύγκρινε τους followers και τους following σου στο Instagram και δες ποιοι δεν σε ακολουθούν πίσω.

**👉 [petrosfs.github.io/Followers-Unfollowers](https://petrosfs.github.io/Followers-Unfollowers/)**

Όλα γίνονται τοπικά στον browser. Τα αρχεία σου δεν ανεβαίνουν πουθενά και δεν χρειάζεται σύνδεση στο Instagram.

Στο κινητό μπορείς να την προσθέσεις στην αρχική οθόνη (Android: μενού του Chrome → *Προσθήκη στην αρχική οθόνη* · iPhone: Safari → Κοινοποίηση → *Προσθήκη στην οθόνη Αφετηρίας*) και ανοίγει σαν εφαρμογή.

## Τι δείχνει

- **Δεν σε ακολουθούν**: τους ακολουθείς, αλλά δεν σε ακολουθούν.
- **Fans**: σε ακολουθούν, αλλά δεν τους ακολουθείς.
- **Mutuals**: ακολουθείτε ο ένας τον άλλον.

Υπάρχει αναζήτηση χρήστη και επιλογή γλώσσας (Ελληνικά / English).

## Πώς παίρνεις τα αρχεία από το Instagram

1. Instagram → **Ρυθμίσεις** → **Account Center** → **Πληροφορίες και άδειες** → **Εξαγωγή δεδομένων**.
2. **Create export** → **Export to device**.
3. Στο **Επιλογή πληροφοριών** διάλεξε την κατηγορία με τους followers και following, στο **Date range** διάλεξε **All time** και στο **Format** διάλεξε **JSON**.
4. Όταν έρθει το export, ανέβασε στην εφαρμογή:
   - τα `followers_*.json` στο πλαίσιο **Followers** (αν είναι πολλά, επίλεξέ τα όλα μαζί),
   - το `following.json` στο πλαίσιο **Following**.

Υποστηρίζονται αρχεία JSON, HTML και TXT (ένα username ανά γραμμή).

## Εκτέλεση τοπικά

Χρειάζεται [Node.js](https://nodejs.org/).

```bash
npm install
npm run dev
```

Η εφαρμογή ανοίγει στο http://localhost:3000/Followers-Unfollowers/.

Για production build:

```bash
npm run build
npm run preview
```

## Τεχνολογίες

React 19 · TypeScript · Vite · Tailwind CSS · Motion · lucide-react · vite-plugin-pwa

Κάθε push στο `main` ανεβαίνει αυτόματα στο GitHub Pages μέσω GitHub Actions.

## Άδεια

[MIT](LICENSE)
