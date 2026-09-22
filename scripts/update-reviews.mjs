// Aktualisiert src/data/google-reviews.json aus einer per Copy & Paste eingefügten Google-Bewertungsliste.
//
// Aufruf:  node scripts/update-reviews.mjs <datei-mit-dem-eingefügten-text> [--date=YYYY-MM-DD]
//   oder:  pbpaste | node scripts/update-reviews.mjs -
//
// Erwartet die unformatierte Kopie der Bewertungsliste aus Google Maps (Name, Meta-Zeile,
// "vor X Monaten", Text, ggf. Inhaber-Antwort). Die Liste ist immer die KOMPLETTE Liste:
// Bewertungen, die nicht mehr vorkommen, werden entfernt.
//
// Regeln:
// - Sterne stehen NICHT im kopierten Text. Standard ist 5 Sterne. Abweichungen im Paste
//   direkt unter der Zeitangabe vermerken, z. B. "4 Sterne" oder "★★★★☆"; das Skript warnt
//   bei jeder Bewertung, die auf den Standard zurückfällt.
// - Namen werden gekürzt (Vorname + Initial des Nachnamens).
// - "vor 2 Monaten" wird in ein ungefähres Datum umgerechnet. Bereits bekannte Bewertungen
//   behalten ihr früheres (genaueres) Datum, die Seite zeigt daraus die aktuelle Relativangabe.
// - Bewertungen ohne Text zählen für Durchschnitt/Anzahl, werden aber nicht als Karte gezeigt.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const OWNER = 'Hausmeisterservice Braun GbR (Inhaber)';
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data/google-reviews.json');

const args = process.argv.slice(2);
const dateArg = args.find((a) => a.startsWith('--date='));
const today = dateArg ? new Date(dateArg.slice(7) + 'T12:00:00') : new Date();
const src = args.find((a) => !a.startsWith('--'));
if (!src) {
    console.error('Bitte Datei mit dem eingefügten Text angeben (oder "-" für stdin).');
    process.exit(1);
}
const raw = readFileSync(src === '-' ? 0 : src, 'utf8');

const TIME = /^vor (einer|einem|\d+) (Stunden?|Tag(?:en)?|Woche[n]?|Monat(?:en)?|Jahr(?:en)?)\s*(?:Neu)?$/i;
const META = /^(?:Local Guide\s*·\s*)?\d+\s+Rezensionen?(?:\s*·\s*\d+\s+Fotos?)?$|^Local Guide$/i;
const NOISE = [/^Foto \d+ wird von .* überprüft$/i, /^(?:❤️|👍)\s*\d*$/, /^\d+$/, /^Antworten$/i, /^Übersetzen$/i];
const STARS_NUM = /^([1-5])\s*(?:von 5\s*)?Sternen?$/i;
const STARS_SYM = /^(★{1,5})☆*$/;

const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

const isTime = (l) => l !== undefined && TIME.test(l);
const isMeta = (l) => l !== undefined && META.test(l);
const isReviewStart = (k) => isTime(lines[k + 1]) || (isMeta(lines[k + 1]) && isTime(lines[k + 2]));

function approxDate(text) {
    const m = text.match(TIME);
    const n = /^einer|^einem/i.test(m[1]) ? 1 : Number(m[1]);
    const unit = m[2].toLowerCase();
    const d = new Date(today);
    if (unit.startsWith('stunde')) d.setHours(d.getHours() - n);
    else if (unit.startsWith('tag')) d.setDate(d.getDate() - n);
    else if (unit.startsWith('woche')) d.setDate(d.getDate() - 7 * n);
    else if (unit.startsWith('monat')) d.setMonth(d.getMonth() - n);
    else d.setFullYear(d.getFullYear() - n);
    return d.toISOString().slice(0, 10);
}

function shortName(full) {
    const t = full.replace(/\s+/g, ' ').trim().split(' ');
    const first = t[0].length === 1 ? t[0].toUpperCase() + '.' : t[0].charAt(0).toUpperCase() + t[0].slice(1);
    if (t.length === 1) return first;
    const last = t[t.length - 1];
    return `${first} ${last.charAt(0).toUpperCase()}.`;
}

const parsed = [];
const warnings = [];
let i = 0;
while (i < lines.length) {
    if (!isReviewStart(i)) {
        warnings.push(`Zeile übersprungen (kein Bewertungsanfang): "${lines[i].slice(0, 60)}"`);
        i++;
        continue;
    }
    const name = lines[i];
    let j = i + 1;
    if (isMeta(lines[j])) j++;
    const timeLine = lines[j].replace(/\s*Neu$/, '');
    j++;

    let rating = null;
    const body = [];
    while (j < lines.length && !isReviewStart(j) && lines[j] !== OWNER) {
        const l = lines[j];
        const num = l.match(STARS_NUM);
        const sym = l.match(STARS_SYM);
        if (num) rating = Number(num[1]);
        else if (sym) rating = sym[1].length;
        else if (!NOISE.some((re) => re.test(l))) body.push(l);
        j++;
    }
    // Inhaber-Antwort überspringen: Name, Zeitangabe, Antworttext bis zur nächsten Bewertung
    if (lines[j] === OWNER) {
        j++;
        if (isTime(lines[j])) j++;
        while (j < lines.length && !isReviewStart(j)) j++;
    }

    const text = body.join(' ').replace(/\s*…\s*Mehr$/i, '…').replace(/\s+/g, ' ').trim();
    parsed.push({ name, author: shortName(name), rating, defaulted: rating === null, date: approxDate(timeLine), text });
    i = j;
}

if (!parsed.length) {
    console.error('Keine Bewertungen erkannt - Format prüfen.');
    process.exit(1);
}

// Bereits bekannte Bewertungen behalten ihr Datum (nur beim ersten Auftreten wird geschätzt)
const previous = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')).reviews || [] : [];
const key = (author, text) => `${author}|${text.slice(0, 40)}`;
const known = new Map(previous.map((r) => [key(r.author, r.text), r]));

const all = parsed.map((r) => {
    const prev = known.get(key(r.author, r.text));
    return { ...r, rating: r.rating ?? prev?.rating ?? 5, defaulted: r.rating === null && !prev, date: prev?.date ?? r.date };
});

const rating = all.reduce((s, r) => s + r.rating, 0) / all.length;
const reviews = all
    .filter((r) => r.text)
    .map(({ author, rating: rt, date, text }) => ({ author, rating: rt, date, text }));

writeFileSync(OUT, JSON.stringify({ updated: today.toISOString().slice(0, 10), rating: Math.round(rating * 100) / 100, total: all.length, reviews }, null, 2) + '\n');

const defaulted = all.filter((r) => r.defaulted);
console.log(`Erkannt: ${all.length} Bewertungen (${reviews.length} mit Text), Durchschnitt ${rating.toFixed(2)}`);
console.log(`Neu gegenüber bisherigem Stand: ${all.filter((r) => !known.has(key(r.author, r.text))).length}, entfernt: ${previous.filter((p) => !all.some((r) => key(r.author, r.text) === key(p.author, p.text))).length}`);
if (defaulted.length) console.log(`Hinweis: ${defaulted.length} Bewertung(en) ohne Sterneangabe mit Standard 5 Sterne übernommen: ${defaulted.map((r) => r.author).join(', ')}`);
const truncated = all.filter((r) => r.text.endsWith('…'));
if (truncated.length) console.log(`Hinweis: Text gekürzt ("Mehr" nicht aufgeklappt) bei: ${truncated.map((r) => r.author).join(', ')}`);
warnings.forEach((w) => console.log('Warnung: ' + w));
