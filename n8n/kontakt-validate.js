// n8n Code-Node: "Validieren & E-Mail vorbereiten (Kontakt)" (Branch: Kontaktformular /webhook/kontakt)
//
// Analog zu bewerbung-validate.js, siehe dort für die ausführliche Erklärung des Aufbaus
// (bewusst eine lineare Kette ohne Verzweigung, Honeypot wird nur markiert statt hart
// verworfen). Kein Datei-Upload auf diesem Formular, daher keine Anhang-Validierung.

const field = (name, body) => (typeof body[name] === 'string' ? body[name].trim() : '');

const item = $input.first();
const body = item.json.body ?? item.json ?? {};

const errors = [];

const name = field('name', body);
if (!name) errors.push('Name fehlt.');

const email = field('email', body);
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Ungültige E-Mail-Adresse.');

const telefon = field('telefon', body);
if (!telefon) errors.push('Telefonnummer fehlt.');

const dienstleistung = field('dienstleistung', body);
if (!dienstleistung) errors.push('Dienstleistung fehlt.');

const plz = field('plz', body);
if (!/^\d{5}$/.test(plz)) errors.push('Ungültige PLZ.');

const ort = field('ort', body);
if (!ort) errors.push('Ort fehlt.');

const nachricht = field('nachricht', body);
if (!nachricht) errors.push('Nachricht fehlt.');

if (field('privacy', body) !== 'on') errors.push('Datenschutz-Zustimmung fehlt.');

// Honeypot: unsichtbares Feld, das nur Bots ausfüllen. Kein harter Abbruch, nur Markierung.
const isSpamSuspect = field('firma_website', body) !== '';

const ok = errors.length === 0;

let subjectPrefix = '[KONTAKT]';
if (isSpamSuspect) subjectPrefix = '[KONTAKT-VERDACHT-SPAM]';
else if (!ok) subjectPrefix = '[KONTAKT-FEHLERHAFT]';

const emailSubject = `${subjectPrefix} Neue Anfrage: ${name || 'unbekannt'} - ${dienstleistung || 'unbekannte Dienstleistung'}`;

const emailText = [
    `Neue Kontaktanfrage über die Webseite.`,
    ``,
    `Name: ${name}`,
    `E-Mail: ${email}`,
    `Telefon: ${telefon}`,
    `Dienstleistung: ${dienstleistung}`,
    `PLZ/Ort: ${plz} ${ort}`,
    `Nachricht: ${nachricht}`,
    ``,
    !ok ? `HINWEIS: Serverseitige Validierung fehlgeschlagen: ${errors.join(' ')}` : '',
    isSpamSuspect ? `HINWEIS: Honeypot-Feld war befüllt, vermutlich Bot-Spam.` : '',
].filter(Boolean).join('\n');

const responseBodyJson = JSON.stringify({ ok, errors });

return [
    {
        json: { ok, errors, emailSubject, emailText, responseBodyJson, type: 'kontakt' },
    },
];
