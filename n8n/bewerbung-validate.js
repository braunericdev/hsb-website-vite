// n8n Code-Node: "Validieren & E-Mail vorbereiten" (Branch: Bewerbungsformular /webhook/bewerbung)
//
// Prüft serverseitig, was das HTML-Formular nur client-seitig erzwingt (required-Attribute,
// accept-Attribute lassen sich umgehen, wenn jemand direkt gegen den Webhook postet).
// Blockiert absichtlich NICHT hart bei einem Fehler (kein Werfen/Abbruch) - stattdessen läuft
// die Kette immer bis zur Antwort durch, damit der Browser bei einem echten Nutzerfehler eine
// verwertbare Fehlermeldung zurückbekommt. Der Honeypot-Fall wird nur im Betreff markiert,
// nicht hart verworfen - das hält den Workflow bewusst simpel (eine Kette, keine Verzweigung).
//
// Erwartet als Input: die Felder aus karriere/index.html (name, telefon, position,
// anstellungsart, privacy, firma_website als Honeypot) sowie optional die Datei unter
// dem Binary-Property "lebenslauf".

const ALLOWED_POSITIONS = [
    'Reinigungskraft / Gebäudereinigung (w/m/d)',
    'Hausmeister-Allrounder (w/m/d)',
    'Mitarbeiter in der Gartenpflege (w/m/d)',
];
const ALLOWED_ANSTELLUNGSART = ['Minijob (Aushilfe)', 'Teilzeit'];
const ALLOWED_FILE_MIMETYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
];
const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB

const item = $input.first();
// n8n legt Multipart-Textfelder je nach Version/Konfiguration entweder direkt unter $json
// oder unter $json.body ab - deshalb hier defensiv beides prüfen.
const body = item.json.body ?? item.json ?? {};
const field = (name) => (typeof body[name] === 'string' ? body[name].trim() : '');

const errors = [];

const name = field('name');
if (!name) errors.push('Name fehlt.');

const telefon = field('telefon');
if (!telefon) errors.push('Telefonnummer fehlt.');

const position = field('position');
if (!ALLOWED_POSITIONS.includes(position)) errors.push('Ungültige Position.');

const anstellungsart = field('anstellungsart');
if (!ALLOWED_ANSTELLUNGSART.includes(anstellungsart)) errors.push('Ungültige Anstellungsart.');

if (field('privacy') !== 'on') errors.push('Datenschutz-Zustimmung fehlt.');

// Honeypot: unsichtbares Feld, das nur Bots ausfüllen. Kein harter Abbruch, nur Markierung.
const isSpamSuspect = field('firma_website') !== '';

const file = item.binary && item.binary.lebenslauf;
if (file) {
    if (!ALLOWED_FILE_MIMETYPES.includes(file.mimeType)) {
        errors.push(`Dateityp nicht erlaubt: ${file.mimeType}`);
    }
    const fileSize = file.fileSize ? Number(file.fileSize) : (file.data ? Buffer.byteLength(file.data, 'base64') : 0);
    if (fileSize > MAX_FILE_BYTES) {
        errors.push(`Datei zu groß (${Math.round(fileSize / 1024 / 1024)}MB, Limit 8MB).`);
    }
}

const ok = errors.length === 0;

let subjectPrefix = '[BEWERBUNG]';
if (isSpamSuspect) subjectPrefix = '[BEWERBUNG-VERDACHT-SPAM]';
else if (!ok) subjectPrefix = '[BEWERBUNG-FEHLERHAFT]';

const emailSubject = `${subjectPrefix} Neue Bewerbung: ${name || 'unbekannt'} - ${position || 'unbekannte Position'}`;

const emailText = [
    `Neue Bewerbung über die Karriereseite.`,
    ``,
    `Name: ${name}`,
    `Telefon: ${telefon}`,
    `Position: ${position}`,
    `Anstellungsart: ${anstellungsart}`,
    file ? `Anhang: ${file.fileName || 'lebenslauf'} (${file.mimeType})` : `Kein Anhang hochgeladen.`,
    ``,
    !ok ? `HINWEIS: Serverseitige Validierung fehlgeschlagen: ${errors.join(' ')}` : '',
    isSpamSuspect ? `HINWEIS: Honeypot-Feld war befüllt, vermutlich Bot-Spam.` : '',
].filter(Boolean).join('\n');

return [
    {
        json: { ok, errors, emailSubject, emailText, type: 'bewerbung' },
        binary: item.binary,
    },
];
