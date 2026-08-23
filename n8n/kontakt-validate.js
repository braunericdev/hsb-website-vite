// n8n Code-Node: "Kontakt validieren und Email vorbereiten" (Branch: Kontaktformular /webhook/kontakt)
//
// Analog zu bewerbung-validate.js, siehe dort für die ausführliche Erklärung des Aufbaus
// (bewusst eine lineare Kette ohne Verzweigung bis hierher, Honeypot wird nur markiert statt
// hart verworfen). Kein Datei-Upload auf diesem Formular, daher keine Anhang-Validierung.
//
// Baut zusätzlich zur reinen Text-Mail (emailText, Fallback für Clients ohne HTML) eine
// gestaltete HTML-Mail für die interne Benachrichtigung (emailHtml). Die Email des Anfragenden
// ist bewusst NICHT Pflicht (ältere Kunden haben teils keine) - ist keine angegeben oder war die
// Anfrage fehlerhaft/Spam-verdächtig, bleibt autoReplySenden false und der IF-Node im Workflow
// überspringt den Auto-Reply-Versand komplett (siehe README-formulare-webhook.md).

const BRAND_COLOR = '#8B4513';
const FONT_STACK = "'Roboto', Arial, sans-serif";

const THEMA_LABELS = {
    allgemein: 'Allgemeine Anfrage',
    hausmeisterservice: 'Hausmeisterservice',
    gartengrundstueckspflege: 'Garten & Grundstückspflege',
    heckenschnitt: 'Heckenschnitt',
    rasenmaehen: 'Rasenmähen',
    reinigung: 'Reinigung (Außen)',
    gestaltung: 'Gestaltung (Außen)',
    winterdienst: 'Winterdienst',
    gebaeudereinigung: 'Gebäudereinigung',
    bodenverlegen: 'Bodenverlegen',
    montageservice: 'Montageservice',
    entruempelung: 'Entrümpelung',
};

// Formulardaten landen 1:1 in der HTML-Mail (Anschriftblock, Nachricht) - ohne Escaping könnte
// jemand per Freitextfeld eigenes HTML/Script in die Mail einschleusen.
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
const body = item.json.body ?? item.json ?? {};
const field = (name) => (typeof body[name] === 'string' ? body[name].trim() : '');

const errors = [];

const name = field('name');
if (!name) errors.push('Name fehlt.');

// Email ist bewusst optional (nicht jeder Kunde hat eine) - nur das Format prüfen, falls
// überhaupt etwas eingetragen wurde.
const email = field('email');
if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Ungültige E-Mail-Adresse.');

const telefon = field('telefon');
if (!telefon) errors.push('Telefonnummer fehlt.');

const dienstleistung = field('dienstleistung');
if (!dienstleistung) errors.push('Dienstleistung fehlt.');

const plz = field('plz');
if (!/^\d{5}$/.test(plz)) errors.push('Ungültige PLZ.');

const ort = field('ort');
if (!ort) errors.push('Ort fehlt.');

const nachricht = field('nachricht');
if (!nachricht) errors.push('Nachricht fehlt.');

if (field('privacy') !== 'on') errors.push('Datenschutz-Zustimmung fehlt.');

// Honeypot: unsichtbares Feld, das nur Bots ausfüllen. Kein harter Abbruch, nur Markierung.
const isSpamSuspect = field('firma_website') !== '';

const ok = errors.length === 0;
const hatEmail = email !== '';
// Auto-Reply nur bei einer echten, sauber validierten Anfrage mit Email verschicken - nicht bei
// Spam-Verdacht oder fehlgeschlagener Validierung (sonst geht eine "Danke für Ihre Anfrage" an
// jemanden raus, dessen Absendung so gar nicht durchgehen sollte).
const autoReplySenden = hatEmail && ok && !isSpamSuspect;

const themaLabel = THEMA_LABELS[dienstleistung] || dienstleistung || 'Anfrage';
const datum = formatDatum();

let subjectPrefix = '[KONTAKT]';
if (isSpamSuspect) subjectPrefix = '[KONTAKT-VERDACHT-SPAM]';
else if (!ok) subjectPrefix = '[KONTAKT-FEHLERHAFT]';

const emailSubject = `${subjectPrefix} Anfrage: ${themaLabel}`;

const emailText = [
    `Neue Kontaktanfrage über die Webseite.`,
    ``,
    `Name: ${name}`,
    `E-Mail: ${email || '(keine angegeben)'}`,
    `Telefon: ${telefon}`,
    `Thema: ${themaLabel}`,
    `PLZ/Ort: ${plz} ${ort}`,
    `Datum: ${datum}`,
    ``,
    nachricht,
    ``,
    !ok ? `HINWEIS: Serverseitige Validierung fehlgeschlagen: ${errors.join(' ')}` : '',
    isSpamSuspect ? `HINWEIS: Honeypot-Feld war befüllt, vermutlich Bot-Spam.` : '',
].filter(Boolean).join('\n');

const nameSafe = escapeHtml(name);
const emailSafe = escapeHtml(email);
const telefonSafe = escapeHtml(telefon);
const themaSafe = escapeHtml(themaLabel);
const ortSafe = escapeHtml(`${plz} ${ort}`.trim());
const datumSafe = escapeHtml(datum);
const nachrichtSafeHtml = escapeHtml(nachricht).replace(/\n/g, '<br>');

// Interne Benachrichtigung: Anschriftblock, dann Thema (links) / Datum (rechts), dann die
// Nachricht - ersetzt das bisherige "Neue Anfrage über..." (steht ohnehin schon im Betreff).
const internalBodyHtml = `<tr><td style="padding:28px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border-radius:8px;margin-bottom:22px;">
    <tr><td style="padding:16px 18px;font-family:${FONT_STACK};font-size:14px;color:#374151;line-height:1.7;">
      <span style="font-size:16px;font-weight:bold;color:#111827;">${nameSafe}</span><br>
      Tel: ${telefonSafe}<br>
      ${hatEmail ? `E-Mail: ${emailSafe}<br>` : `<span style="color:#9ca3af;">Keine E-Mail angegeben</span><br>`}
      ${ortSafe}
    </td></tr>
  </table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
    <tr>
      <td style="font-family:${FONT_STACK};font-size:15px;font-weight:bold;color:${BRAND_COLOR};">${themaSafe}</td>
      <td align="right" style="font-family:${FONT_STACK};font-size:13px;color:#6b7280;">${datumSafe}</td>
    </tr>
  </table>
  <p style="font-family:${FONT_STACK};font-size:14px;color:#374151;line-height:1.7;margin:0;">${nachrichtSafeHtml}</p>
  ${!ok ? `<p style="font-family:${FONT_STACK};font-size:12.5px;color:#b91c1c;margin:16px 0 0;">Hinweis: Serverseitige Validierung fehlgeschlagen: ${escapeHtml(errors.join(' '))}</p>` : ''}
  ${isSpamSuspect ? `<p style="font-family:${FONT_STACK};font-size:12.5px;color:#b91c1c;margin:8px 0 0;">Hinweis: Honeypot-Feld war befüllt, vermutlich Bot-Spam.</p>` : ''}
</td></tr>`;

const emailHtml = emailShell(emailSubject, internalBodyHtml);

// Automatische Antwort an den Anfragenden - Inhalt wird immer gebaut, aber nur verschickt
// (siehe README, IF-Node im Workflow), wenn autoReplySenden true ist.
const autoReplySubject = 'Vielen Dank für Ihre Anfrage!';
const autoReplyText = [
    `Hallo ${name},`,
    ``,
    `vielen Dank für Ihre Anfrage zum Thema ${themaLabel}! Wir haben Ihre Nachricht erhalten und melden uns garantiert innerhalb der nächsten 24 Stunden bei Ihnen.`,
    ``,
    `Bei dringenden Anliegen erreichen Sie uns auch direkt telefonisch unter +49 163 2925153.`,
    ``,
    `Braun Hausmeisterservice GbR`,
    `Bernhard-Henrich Str. 15, 56170 Bendorf`,
].join('\n');

const autoReplyBodyHtml = `<tr><td style="padding:32px 28px;">
  <p style="font-family:${FONT_STACK};font-size:15px;color:#111827;margin:0 0 16px;">Hallo ${nameSafe},</p>
  <p style="font-family:${FONT_STACK};font-size:14.5px;color:#374151;line-height:1.7;margin:0 0 20px;">vielen Dank für Ihre Anfrage zum Thema <b>${themaSafe}</b>! Wir haben Ihre Nachricht erhalten und melden uns garantiert innerhalb der nächsten 24 Stunden bei Ihnen.</p>
  <p style="font-family:${FONT_STACK};font-size:14.5px;color:#374151;line-height:1.7;margin:0;">Bei dringenden Anliegen erreichen Sie uns auch direkt telefonisch unter <a href="tel:+491632925153" style="color:${BRAND_COLOR};text-decoration:none;font-weight:bold;">+49 163 2925153</a>.</p>
</td></tr>`;

const autoReplyHtml = emailShell(autoReplySubject, autoReplyBodyHtml);

const responseBodyJson = JSON.stringify({ ok, errors });

return [
    {
        json: {
            ok, errors, emailSubject, emailText, emailHtml, responseBodyJson, type: 'kontakt',
            hatEmail, autoReplySenden, kundenEmail: email,
            autoReplySubject, autoReplyText, autoReplyHtml,
        },
    },
];
