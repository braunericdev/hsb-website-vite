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
// anstellungsart, privacy, firma_website als Honeypot) sowie optional bis zu 5 Dateien
// unter den Binary-Properties "lebenslauf_1" bis "lebenslauf_5".

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
const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB pro Datei
const MAX_TOTAL_BYTES = 20 * 1024 * 1024; // 20 MB insgesamt
const MAX_DATEIEN = 5;

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

const binary = item.binary || {};
const dateiFelder = Array.from({ length: MAX_DATEIEN }, (_, i) => `lebenslauf_${i + 1}`);
const dateien = dateiFelder.map((feld) => binary[feld]).filter(Boolean);

let gesamtgroesse = 0;
for (const datei of dateien) {
    if (!ALLOWED_FILE_MIMETYPES.includes(datei.mimeType)) {
        errors.push(`Dateityp nicht erlaubt: ${datei.fileName || '?'} (${datei.mimeType})`);
    }
    const dateigroesse = datei.fileSize ? Number(datei.fileSize) : (datei.data ? Buffer.byteLength(datei.data, 'base64') : 0);
    if (dateigroesse > MAX_FILE_BYTES) {
        errors.push(`Datei zu groß: ${datei.fileName || '?'} (${Math.round(dateigroesse / 1024 / 1024)}MB, Limit 8MB).`);
    }
    gesamtgroesse += dateigroesse;
}
if (gesamtgroesse > MAX_TOTAL_BYTES) {
    errors.push(`Gesamtgröße aller Anhänge zu groß (${Math.round(gesamtgroesse / 1024 / 1024)}MB, Limit 20MB).`);
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
    dateien.length
        ? `Anhänge (${dateien.length}): ` + dateien.map((d) => d.fileName || '?').join(', ')
        : `Keine Anhänge hochgeladen.`,
    ``,
    !ok ? `HINWEIS: Serverseitige Validierung fehlgeschlagen: ${errors.join(' ')}` : '',
    isSpamSuspect ? `HINWEIS: Honeypot-Feld war befüllt, vermutlich Bot-Spam.` : '',
].filter(Boolean).join('\n');

// Fertig serialisiert statt als Objekt zurückgeben: der Respond-to-Webhook-Node
// wandelt ein per {{ }}-Ausdruck eingesetztes JS-Objekt nur per String(...) um
// ("[object Object]"), nicht per JSON.stringify - das führt sonst zu
// "Invalid JSON in 'Response Body' field". Hier wird der fertige, garantiert
// gültige JSON-String gebaut, der Respond-Node muss ihn nur noch einsetzen.
const responseBodyJson = JSON.stringify({ ok, errors });

// Send Email wirft "The item has no binary field 'lebenslauf_X'", wenn im
// Attachments-Feld ein Property-Name steht, der für diese Bewerbung gar nicht
// existiert (z.B. nur 2 von 5 möglichen Dateien hochgeladen). Deshalb hier die
// tatsächlich vorhandenen Felder als kommagetrennte Liste vorbereiten - Send
// Email referenziert dann nur noch diese Liste statt einer festen Aufzählung.
const anhangProperties = dateiFelder.filter((feld) => binary[feld]).join(',');

return [
    {
        json: { ok, errors, emailSubject, emailText, responseBodyJson, anhangProperties, type: 'bewerbung' },
        binary: item.binary,
    },
];
