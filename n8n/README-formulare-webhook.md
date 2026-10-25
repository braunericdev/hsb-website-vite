# n8n-Workflow: Formular-Webhooks (Formspree-Ersatz)

```
Webhook (bewerbung) → Code → IF (Spam hart blocken?) → [false] Send Email (intern) → IF (Auto-Reply senden?) → [true]  Send Email (Auto-Reply) ─┐
                                                                                                               → [false] ────────────────────────┼→ Respond to Webhook
                                                       → [true] ──────────────────────────────────────────────────────────────────────────────┘

Webhook (kontakt)    → Code → IF (Spam hart blocken?) → [false] Send Email (intern) → IF (Auto-Reply senden?) → [true]  Send Email (Auto-Reply) ─┐
                                                                                                               → [false] ────────────────────────┼→ Respond to Webhook
                                                       → [true] ──────────────────────────────────────────────────────────────────────────────┘
```

Beide Zweige komplett getrennt (kein gemeinsamer Node), beide live eingerichtet und getestet.
Beide mit identisch aufgebauter, vorgeschalteter Spam-Sperre (siehe Begründung unten) - ursprünglich
nur für Kontakt gebaut, auf Bewerbung übertragen, da baugleiche Signale sinnvoller sind als zwei
unterschiedliche Spam-Logiken zu pflegen.

## Nodes

| Bewerbung | Kontakt |
|---|---|
| Webhook_Bewerbung | Webhook_Kontakt |
| Bewerbung validieren und Email vorbereiten | Kontakt validieren und Email vorbereiten |
| If Spam hart blocken Bewerbung | If Spam hart blocken Kontakt |
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

Bei **beiden** Zweigen zusätzlich **If Spam hart blocken Bewerbung/Kontakt** direkt hinter dem
jeweiligen Code-Node einfügen (vor Send Bewerbung/Send Kontakt):
- Bedingung Boolean: `{{ $json.istHartSpam }}` ist true (direkter Vorgänger ist der Code-Node,
  also `$json` statt Node-Referenz nutzen, siehe Stolperfalle 2).
- **true-Ausgang**: direkt auf das jeweilige Respond to Webhook verbinden (Send Bewerbung/Send
  Kontakt wird übersprungen - keine interne Mail).
- **false-Ausgang**: wie bisher auf Send Bewerbung/Send Kontakt verbinden, Rest der Kette
  unverändert.

### Zeit-Falle (`_ts`) - keine Workflow-Änderung nötig

Läuft komplett innerhalb des jeweiligen Code-Nodes (Vergleich `_ts`-Feldwert gegen aktuelle
Serverzeit) und fließt direkt in `istHartSpam` mit ein - der jeweilige IF-Node oben deckt das
automatisch mit ab, keine zusätzlichen Nodes nötig. Gilt identisch für Bewerbung und Kontakt.

### Cloudflare Turnstile - Einrichtung, sobald ein Konto existiert

Code ist in **beiden** Code-Node-Dateien vorbereitet, aber inaktiv (`TURNSTILE_SITE_KEY` in
`main.js` - eine Konstante für beide Formulare - sowie je ein `TURNSTILE_SECRET_KEY` in
`kontakt-validate.js` und `bewerbung-validate.js`, alle aktuell leer). Zum Aktivieren:

1. Kostenloses Cloudflare-Konto anlegen → **Turnstile** → neue Site registrieren
   (Domain: `hausmeisterservice-braun.de`, Widget-Modus: **Managed** - das ist die Variante ohne
   Bilder-Rätsel, meist unsichtbar oder höchstens eine kurze Checkbox). Ein Sitekey reicht für
   beide Formulare, da beide auf derselben Domain laufen.
2. Liefert zwei Werte: **Site Key** (öffentlich) und **Secret Key** (geheim).
3. Site Key in `main.js` bei `TURNSTILE_SITE_KEY` eintragen, committen, deployen - gilt dann
   automatisch für beide Formulare (Widget wird in jeden `[data-turnstile-container]` gerendert).
4. Secret Key **nicht** ins Repo - direkt in **beiden** n8n-Code-Nodes einfügen
   (`TURNSTILE_SECRET_KEY` in `kontakt-validate.js` UND `bewerbung-validate.js`, dort beim
   Einfügen in n8n jeweils überschreiben) oder besser als n8n-Credential/Environment-Variable
   hinterlegen, falls eure n8n-Instanz das unterstützt.
5. Keine neuen Nodes nötig - die Verifizierung läuft per `this.helpers.httpRequest(...)` direkt in
   den Code-Nodes (muss beim ersten Einfügen in n8n kurz getestet werden, falls diese n8n-Version
   das anders handhabt als angenommen).

**Rollback, falls unterwegs doch zu streng:** `TURNSTILE_SECRET_KEY` im jeweiligen Code-Node
wieder auf `''` setzen - Prüfung ist dann sofort wieder komplett inaktiv, ohne Node-Umbau.

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

Spam-Sperre testen (Kontakt):
```
curl -X POST https://niewiedertelefonieren.de/webhook/kontakt \
  -F "name=Test Spam" -F "telefon=0123456789" \
  -F "dienstleistung=allgemein" -F "plz=56170" -F "ort=Bendorf" \
  -F "nachricht=Нужен кредит срочно" -F "privacy=on" -F "firma_website="
```
Erwartet: weiterhin `{"ok":true,"errors":[]}`, aber **keine** interne Mail (Send Kontakt wird
übersprungen).

Zeit-Falle testen (ohne `_ts` → kein Block, s. Fail-safe; mit zu aktuellem `_ts` → Block):
```
curl -X POST https://niewiedertelefonieren.de/webhook/kontakt \
  -F "name=Test Zu Schnell" -F "telefon=0123456789" \
  -F "dienstleistung=allgemein" -F "plz=56170" -F "ort=Bendorf" \
  -F "nachricht=Testnachricht" -F "privacy=on" -F "firma_website=" \
  -F "_ts=$(($(date +%s%N)/1000000))"
```
Erwartet: `{"ok":true,"errors":[]}`, **keine** interne Mail (`_ts` = jetzt, Differenz ≈ 0ms, unter
den 3000ms).

Link-Spam testen (gilt für jedes Muster in SPAM_LINK_MUSTER, z.B. share.google oder search.app):
```
curl -X POST https://niewiedertelefonieren.de/webhook/kontakt \
  -F "name=Test Link" -F "telefon=0123456789" \
  -F "dienstleistung=allgemein" -F "plz=56170" -F "ort=Bendorf" \
  -F "nachricht=schau dir das an https://share.google/abc123" -F "privacy=on" -F "firma_website="
```
Erwartet: `{"ok":true,"errors":[]}`, **keine** interne Mail.

Dieselben vier Spam-Sperren gelten identisch für Bewerbung (nur `name` statt `name`+`nachricht` als
Prüffeld für Kyrillisch/Link-Spam, da kein Freitext-Nachrichtenfeld existiert) - z.B.:
```
curl -X POST https://niewiedertelefonieren.de/webhook/bewerbung \
  -F "name=Тест Спам" -F "telefon=0123456789" -F "email=test@example.com" \
  -F "position=Hausmeister-Allrounder (w/m/d)" \
  -F "anstellungsart=Teilzeit" -F "privacy=on" -F "firma_website="
```
Erwartet: `{"ok":true,"errors":[]}`, **keine** interne Mail.

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

**`istHartSpam` (Kontakt und Bewerbung):** Ab Oktober 2026 eskalierender Formular-Spam (erst
russischsprachig mit Stichwort "Кредит", nach dessen Blockierung englischsprachig weiter) füllte
trotz Honeypot weiterhin das Postfach, weil der Honeypot-Fall die interne Mail nur markiert statt
unterdrückt (s.o.). Die Antwort an den Browser (`responseBodyJson`, `ok`) bleibt bei allen vier
Signalen unten unberührt, damit der Bot keinen Hinweis auf die Sperre bekommt und es nicht erneut
versucht. Ursprünglich nur für Kontakt gebaut (dort zuerst eskaliert), nachträglich 1:1 auf
Bewerbung übertragen statt eine zweite, abweichende Spam-Logik zu pflegen - auch wenn der Spam dort
noch kein akutes Problem war, ist das Formular derselben Angriffsfläche ausgesetzt. Einzige
Abweichung: Bewerbung hat kein `nachricht`-Feld, Kyrillisch- und Link-Spam-Check laufen dort nur
gegen `name`.

- **Kyrillisch:** Da das Geschäft rein lokal und deutschsprachig ist, enthält eine echte Anfrage
  praktisch nie kyrillische Zeichen - anders als beim Honeypot ist das Risiko eines False
  Positives hier vernachlässigbar, daher harter Abbruch statt nur Markierung. Erkennung bewusst
  auf das Schriftsystem (`/[Ѐ-ӿ]/` auf Name und Nachricht), nicht auf das Wort "Кредит" selbst -
  robuster gegen Wortvarianten.
- **Zeit-Falle (`_ts`, seit dem englischsprachigen Spam ergänzt):** Deckt Bots ab, die zwar JS
  ausführen (Honeypot und Kyrillisch-Filter allein reichen nicht gegen alle), das Formular aber in
  Sekundenbruchteilen statt in mehreren Sekunden ausfüllen. 3000ms-Schwelle bewusst konservativ
  gewählt (auch mit Browser-Autofill muss die Pflicht-Checkbox noch manuell angeklickt werden,
  das kostet selbst im schnellsten Fall spürbar Zeit) - lieber ein paar schnelle Spam-Mails
  durchlassen als eine hastig, aber echt ausgefüllte Anfrage blocken. Fehlt `_ts` (altes Caching,
  Bot ohne JS) oder ist die Differenz negativ (Client-Uhr falsch eingestellt), wird nicht
  geblockt - Fail-safe zugunsten echter Anfragen.
- **Cloudflare Turnstile:** Generischste der drei Prüfungen, deckt auch Spam-Muster ab, die weder
  kyrillisch noch ungewöhnlich schnell ausgefüllt sind. Bewusst **fail-open** bei
  Cloudflare-Fehler/Timeout (Netzwerkproblem bei Cloudflare darf nicht dazu führen, dass legitime
  Anfragen geblockt werden) und standardmäßig **komplett inaktiv**, bis ein echter Secret Key
  hinterlegt ist (s. Setup-Abschnitt oben) - bewusst als Opt-in gebaut, nicht automatisch
  scharfgeschaltet.
- **Link-Spam (`SPAM_LINK_MUSTER`, aktuell `share.google` und `search.app`):** Einfacher, aber
  wirksamer Substring-Check - diese Kurzlink-Dienste tauchen ausschließlich in Spam-Nachrichten
  auf, eine echte Anfrage hat keinen Grund, sowas zu verlinken. Bewusst nicht generalisiert (z.B.
  "jeder Link blockt"), um Kunden nicht zu riskieren, die z.B. einen Link zu einem
  Immobilien-Exposé oder Grundriss teilen wollen - Liste statt Regex, damit sich neue bekannte
  Spam-Linkmuster einfach ergänzen lassen.

**Prüfung ganz am Anfang des Code-Nodes (vor Validierung/HTML-Aufbau):** Der Mail-Block allein
verhindert nur den Versand, nicht die n8n-Ausführung selbst - jede Anfrage, auch Spam, erreicht
den Webhook und startet eine Execution, das lässt sich serverseitig nicht vermeiden (siehe
Abschnitt "Kann man den Server nicht so schützen..." - CORS/Origin-Prüfung wird nur vom Browser
durchgesetzt, ein Bot, der direkt POSTet, umgeht sie trivial). Alle vier Prüfungen laufen daher
als Erstes im Code-Node und brechen bei Treffer sofort ab, bevor Validierung und die beiden
HTML-Mail-Templates (deutlich der teuerste Teil) überhaupt laufen - spart n8n Rechenzeit pro
Spam-Anfrage, auch wenn die Anzahl der Anfragen/Executions selbst dadurch nicht sinkt (dafür
bräuchte es eine Sperre vor dem Server, z. B. Cloudflare - aktuell nicht vorhanden, eigene
Entscheidung).
