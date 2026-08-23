// n8n Code-Node: "Bewerbung validieren und Email vorbereiten" (Branch: Bewerbungsformular /webhook/bewerbung)
//
// Prüft serverseitig, was das HTML-Formular nur client-seitig erzwingt (required-Attribute,
// accept-Attribute lassen sich umgehen, wenn jemand direkt gegen den Webhook postet).
// Blockiert absichtlich NICHT hart bei einem Fehler (kein Werfen/Abbruch) - stattdessen läuft
// die Kette immer bis zur Antwort durch, damit der Browser bei einem echten Nutzerfehler eine
// verwertbare Fehlermeldung zurückbekommt. Der Honeypot-Fall wird nur im Betreff markiert,
// nicht hart verworfen - das hält den Workflow bewusst simpel (eine Kette, keine Verzweigung
// bis hierher).
//
// Erwartet als Input: die Felder aus karriere/index.html (name, telefon, email (optional),
// position, anstellungsart, privacy, firma_website als Honeypot) sowie optional bis zu 5
// Dateien unter den Binary-Properties "lebenslauf_1" bis "lebenslauf_5".
//
// Baut zusätzlich zur reinen Text-Mail (emailText, Fallback für Clients ohne HTML) eine
// gestaltete HTML-Mail für die interne Benachrichtigung (emailHtml). Die Email des Bewerbers
// ist bewusst NICHT Pflicht (nicht jeder hat eine) - ist keine angegeben oder war die Bewerbung
// fehlerhaft/Spam-verdächtig, bleibt autoReplySenden false und der IF-Node im Workflow
// überspringt den Auto-Reply-Versand komplett (siehe README-formulare-webhook.md).

const BRAND_COLOR = '#8B4513';
const FONT_STACK = "'Roboto', Arial, sans-serif";

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

// Formulardaten (inkl. Dateinamen) landen 1:1 in der HTML-Mail - ohne Escaping könnte jemand
// per Freitextfeld oder Dateiname eigenes HTML/Script in die Mail einschleusen.
function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
}

function formatDatum() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

// Textlockup (Balken + "Braun"/"Hausmeisterservice"), dieselbe Zusammensetzung wie das Logo im
// Website-Navbar (src/components/navbar.html) - nur umgefärbt für hellen Text auf der marken-
// braunen Kopfzeile statt dunklen Text auf Weiß.
function logoBlockHtml() {
    return `<table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td width="4" height="38" style="background-color:#ffffff;border-radius:2px;font-size:0;line-height:0;">&nbsp;</td>
      <td width="14" style="font-size:0;line-height:0;">&nbsp;</td>
      <td>
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr><td style="font-family:${FONT_STACK};font-size:21px;font-weight:800;text-transform:uppercase;letter-spacing:-0.02em;color:#ffffff;line-height:1.2;">Braun</td></tr>
          <tr><td style="font-family:${FONT_STACK};font-size:11px;font-weight:500;letter-spacing:0.05em;color:#f0ded0;line-height:1.4;">Hausmeisterservice</td></tr>
        </table>
      </td>
    </tr></table>`;
}

function emailShell(title, bodyHtml) {
    return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;800&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background-color:#f5f5f4;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f4;">
<tr><td align="center" style="padding:28px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:10px;overflow:hidden;font-family:${FONT_STACK};">
<tr><td style="background-color:${BRAND_COLOR};padding:22px 28px;">${logoBlockHtml()}</td></tr>
${bodyHtml}
<tr><td style="background-color:#f5f5f4;padding:18px 28px;font-family:${FONT_STACK};font-size:11.5px;color:#6b7280;border-top:1px solid #e5e7eb;line-height:1.6;">
Braun Hausmeisterservice GbR &middot; Bernhard-Henrich Str. 15 &middot; 56170 Bendorf<br>
<a href="https://www.hausmeisterservice-braun.de" style="color:${BRAND_COLOR};text-decoration:none;">hausmeisterservice-braun.de</a>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

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

// Email ist bewusst optional (nicht jeder Bewerber hat eine) - nur das Format prüfen, falls
// überhaupt etwas eingetragen wurde.
const email = field('email');
if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Ungültige E-Mail-Adresse.');

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
const hatEmail = email !== '';
// Auto-Reply nur bei einer echten, sauber validierten Bewerbung mit Email verschicken - nicht
// bei Spam-Verdacht oder fehlgeschlagener Validierung (sonst geht eine "Danke für Ihre
// Bewerbung" an jemanden raus, dessen Absendung so gar nicht durchgehen sollte).
const autoReplySenden = hatEmail && ok && !isSpamSuspect;

const datum = formatDatum();

let subjectPrefix = '[BEWERBUNG]';
if (isSpamSuspect) subjectPrefix = '[BEWERBUNG-VERDACHT-SPAM]';
else if (!ok) subjectPrefix = '[BEWERBUNG-FEHLERHAFT]';

const emailSubject = `${subjectPrefix} Bewerbung: ${position || 'unbekannte Position'}`;

const emailText = [
    `Neue Bewerbung über die Karriereseite.`,
    ``,
    `Name: ${name}`,
    `Telefon: ${telefon}`,
    `E-Mail: ${email || '(keine angegeben)'}`,
    `Position: ${position}`,
    `Anstellungsart: ${anstellungsart}`,
    `Datum: ${datum}`,
    dateien.length
        ? `Anhänge (${dateien.length}): ` + dateien.map((d) => d.fileName || '?').join(', ')
        : `Keine Anhänge hochgeladen.`,
    ``,
    !ok ? `HINWEIS: Serverseitige Validierung fehlgeschlagen: ${errors.join(' ')}` : '',
    isSpamSuspect ? `HINWEIS: Honeypot-Feld war befüllt, vermutlich Bot-Spam.` : '',
].filter(Boolean).join('\n');

const nameSafe = escapeHtml(name);
const telefonSafe = escapeHtml(telefon);
const emailSafe = escapeHtml(email);
const positionSafe = escapeHtml(position);
const anstellungsartSafe = escapeHtml(anstellungsart);
const datumSafe = escapeHtml(datum);
const anhangListeSafe = dateien.length ? escapeHtml(dateien.map((d) => d.fileName || '?').join(', ')) : '';

// Interne Benachrichtigung: Anschriftblock, dann Position (links) / Datum (rechts), dann
// Anstellungsart + Anhänge - ersetzt das bisherige "Neue Bewerbung über..." (steht ohnehin
// schon im Betreff).
const internalBodyHtml = `<tr><td style="padding:28px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border-radius:8px;margin-bottom:22px;">
    <tr><td style="padding:16px 18px;font-family:${FONT_STACK};font-size:14px;color:#374151;line-height:1.7;">
      <span style="font-size:16px;font-weight:bold;color:#111827;">${nameSafe}</span><br>
      Tel: ${telefonSafe}<br>
      ${hatEmail ? `E-Mail: ${emailSafe}` : `<span style="color:#9ca3af;">Keine E-Mail angegeben</span>`}
    </td></tr>
  </table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
    <tr>
      <td style="font-family:${FONT_STACK};font-size:15px;font-weight:bold;color:${BRAND_COLOR};">${positionSafe}</td>
      <td align="right" style="font-family:${FONT_STACK};font-size:13px;color:#6b7280;">${datumSafe}</td>
    </tr>
  </table>
  <p style="font-family:${FONT_STACK};font-size:14px;color:#374151;line-height:1.7;margin:0 0 16px;">Anstellungsart: <b>${anstellungsartSafe}</b></p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border-radius:8px;">
    <tr><td style="padding:14px 18px;font-family:${FONT_STACK};font-size:13.5px;color:#374151;">
      ${dateien.length ? `<b>Anhänge (${dateien.length}):</b> ${anhangListeSafe}` : `Keine Anhänge hochgeladen.`}
    </td></tr>
  </table>
  ${!ok ? `<p style="font-family:${FONT_STACK};font-size:12.5px;color:#b91c1c;margin:16px 0 0;">Hinweis: Serverseitige Validierung fehlgeschlagen: ${escapeHtml(errors.join(' '))}</p>` : ''}
  ${isSpamSuspect ? `<p style="font-family:${FONT_STACK};font-size:12.5px;color:#b91c1c;margin:8px 0 0;">Hinweis: Honeypot-Feld war befüllt, vermutlich Bot-Spam.</p>` : ''}
</td></tr>`;

const emailHtml = emailShell(emailSubject, internalBodyHtml);

// Automatische Antwort an den Bewerber - Inhalt wird immer gebaut, aber nur verschickt (siehe
// README, IF-Node im Workflow), wenn autoReplySenden true ist.
const autoReplySubject = 'Vielen Dank für Ihre Bewerbung!';
const autoReplyText = [
    `Hallo ${name},`,
    ``,
    `vielen Dank für Ihre Bewerbung als ${position}! Wir haben Ihre Unterlagen erhalten und melden uns garantiert innerhalb der nächsten 24 Stunden persönlich bei Ihnen.`,
    ``,
    `Bis dahin wünschen wir Ihnen eine schöne Zeit!`,
    ``,
    `Braun Hausmeisterservice GbR`,
    `Bernhard-Henrich Str. 15, 56170 Bendorf`,
].join('\n');

const autoReplyBodyHtml = `<tr><td style="padding:32px 28px;">
  <p style="font-family:${FONT_STACK};font-size:15px;color:#111827;margin:0 0 16px;">Hallo ${nameSafe},</p>
  <p style="font-family:${FONT_STACK};font-size:14.5px;color:#374151;line-height:1.7;margin:0 0 20px;">vielen Dank für Ihre Bewerbung als <b>${positionSafe}</b>! Wir haben Ihre Unterlagen erhalten und melden uns garantiert innerhalb der nächsten 24 Stunden persönlich bei Ihnen.</p>
  <p style="font-family:${FONT_STACK};font-size:14.5px;color:#374151;line-height:1.7;margin:0;">Bis dahin wünschen wir Ihnen eine schöne Zeit!</p>
</td></tr>`;

const autoReplyHtml = emailShell(autoReplySubject, autoReplyBodyHtml);

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
        json: {
            ok, errors, emailSubject, emailText, emailHtml, responseBodyJson, anhangProperties, type: 'bewerbung',
            hatEmail, autoReplySenden, bewerberEmail: email,
            autoReplySubject, autoReplyText, autoReplyHtml,
        },
        binary: item.binary,
    },
];
