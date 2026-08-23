# n8n-Workflow: Formular-Webhooks (Formspree-Ersatz)

```
Webhook (bewerbung) → Code → Send Email (intern) → IF (Auto-Reply senden?) → [true]  Send Email (Auto-Reply) ─┐
                                                                            → [false] ────────────────────────┴→ Respond to Webhook

Webhook (kontakt)    → Code → Send Email (intern) → IF (Auto-Reply senden?) → [true]  Send Email (Auto-Reply) ─┐
                                                                            → [false] ────────────────────────┴→ Respond to Webhook
```

Beide Zweige komplett getrennt (kein gemeinsamer Node), beide live eingerichtet und getestet.

## Nodes

| Bewerbung | Kontakt |
|---|---|
| Webhook_Bewerbung | Webhook_Kontakt |
| Bewerbung validieren und Email vorbereiten | Kontakt validieren und Email vorbereiten |
| Send Bewerbung | Send Kontakt |
| If Email enthalten Bewerbung | If Email enthalten Kontakt |
| Send Auto-Reply Bewerbung | Send Auto-Reply Kontakt |
| Respond to Webhook_Bewerbung | Respond to Webhook_Kontakt |

## Setup

1. Code-Node-Inhalt aus [`bewerbung-validate.js`](./bewerbung-validate.js) /
   [`kontakt-validate.js`](./kontakt-validate.js) einfügen.
2. Send Email (intern): Text `{{ $json.emailText }}`, HTML `{{ $json.emailHtml }}`.
3. IF-Node, Bedingung Boolean: `{{ $('<Code-Node>').item.json.autoReplySenden }}` ist true.
4. Send Email (Auto-Reply), am true-Ausgang:
   - To: `{{ $('<Code-Node>').item.json.bewerberEmail }}` (Kontakt: `kundenEmail`)
   - Subject: `{{ $('<Code-Node>').item.json.autoReplySubject }}`
   - Text: `{{ $('<Code-Node>').item.json.autoReplyText }}`
   - HTML: `{{ $('<Code-Node>').item.json.autoReplyHtml }}`
5. IF-false-Ausgang UND Send-Auto-Reply-Ausgang beide auf Respond to Webhook verbinden.
6. Respond to Webhook: Respond With `Text`, Response Body
   `{{ $('<Code-Node>').item.json.responseBodyJson }}`, Response Code `200`, Header
   `Access-Control-Allow-Origin: https://www.hausmeisterservice-braun.de`.

Bewerbung zusätzlich, Send Email (intern) → Attachments (Inline):
```
{{ $('Bewerbung validieren und Email vorbereiten').item.json.anhangProperties }}
```

## Testen

```
curl -X POST https://niewiedertelefonieren.de/webhook/bewerbung \
  -F "name=Test Bewerber" -F "telefon=0123456789" -F "email=test@example.com" \
  -F "position=Hausmeister-Allrounder (w/m/d)" \
  -F "anstellungsart=Teilzeit" -F "privacy=on" -F "firma_website="

curl -X POST https://niewiedertelefonieren.de/webhook/kontakt \
  -F "name=Test Kontakt" -F "email=test@example.com" -F "telefon=0123456789" \
  -F "dienstleistung=allgemein" -F "plz=56170" -F "ort=Bendorf" \
  -F "nachricht=Testnachricht" -F "privacy=on" -F "firma_website="
```
Erwartet: `{"ok":true,"errors":[]}`, interne HTML-Mail + (falls Email angegeben) Auto-Reply-Mail
an `test@example.com`. `-F "email=..."` weglassen → keine Auto-Reply, interne Mail zeigt "Keine
E-Mail angegeben".

## Stolperfallen

1. Kein rohes JS-Objekt (`{{ { ok: ..., errors: ... } }}`) im Response Body - wird per
   `String(...)` zu `[object Object]`. Der Code-Node liefert den fertigen String bereits unter
   `responseBodyJson`.
2. **Node-Referenz statt `$json`**, sobald der direkte Vorgänger nicht mehr der Code-Node ist -
   betrifft IF-Node, Auto-Reply-Send-Email und Respond to Webhook. Nur das HTML/Attachment-Feld
   im ersten Send-Email-Node (direkt hinter Code) darf `$json` nutzen.
3. Kein führendes `=` vor `{{ ... }}` - landet wortwörtlich in der Antwort.
4. Feld muss im **fx-Modus** sein, sonst wird `{{ }}` nicht ausgewertet.
5. `$('...')` per `$(` im Feld eintippen und aus der Vorschlagsliste wählen statt abzutippen -
   muss exakt dem Node-Namen entsprechen.

## Begründung

**Getrennte Ketten statt geteilter Nodes:** Die Antwort an den Browser soll erst "Erfolg"
melden, wenn die interne Mail tatsächlich verschickt wurde, nicht schon nach der Validierung -
Respond muss also seriell hinter Send Email hängen. Ein zwischen beiden Formularen geteilter
Send-Email- oder Respond-Node könnte in einem Lauf nicht sicher unterscheiden, welcher der
beiden Code-Nodes gerade gelaufen ist (der Bug, den wir am Bewerbungs-Zweig hatten). Volle
Trennung ist die robustere Lösung.

**`autoReplySenden` statt `hatEmail` direkt:** Die Auto-Reply-Mail soll nur bei einer echten,
sauber validierten Anfrage/Bewerbung mit Email rausgehen - nicht bei Honeypot-Spam-Verdacht oder
fehlgeschlagener Validierung. Der Code-Node kombiniert das serverseitig
(`hatEmail && ok && !isSpamSuspect`), der IF-Node prüft nur noch dieses eine Flag.

**Beide Postfach-Rollen:** Interne Mail geht an `kontakt@hausmeisterservice-braun.de` (Absender =
Empfänger, unterschieden per Betreff-Präfix `[BEWERBUNG]`/`[KONTAKT]`, da IONOS keine
zusätzlichen Aliase erlaubt). Die Auto-Reply-Mail geht an die Adresse aus dem Formular
(`kundenEmail`/`bewerberEmail`).

**Execution-Log-Aufbewahrung (Datenschutz, Bewerbungs-Anhänge):** Der Lebenslauf wird nirgends
dauerhaft gespeichert, nur direkt an die Mail angehängt und durchgereicht - das funktioniert nur,
wenn n8n die Ausführung nicht selbst inklusive Anhang aufbewahrt. Workflow **Settings** → **Save
Successful Executions** auf `None` oder kurze Frist stellen; instanzweit ggf.
`EXECUTIONS_DATA_PRUNE=true` + `EXECUTIONS_DATA_MAX_AGE` kurz halten.

**Bewusste Vereinfachungen:** Honeypot-Fall wird nicht hart verworfen, nur im Betreff markiert
(`[...-VERDACHT-SPAM]`) - spart eine weitere Verzweigung, Auto-Reply wird trotzdem korrekt
unterdrückt. Kein Virenscan der Bewerbungs-Anhänge - vertretbar, da nicht dauerhaft gespeichert
und Mail-Provider eingehende Anhänge meist ohnehin scannen.
