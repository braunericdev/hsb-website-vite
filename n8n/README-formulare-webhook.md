# n8n-Workflow: Formular-Webhooks (Formspree-Ersatz)

Ein n8n-Workflow mit zwei unabhängigen Eingängen (je ein eigener Webhook-Node, eigener Pfad,
eigener Validierungs-Code), die sich beide dieselben zwei Ausgangs-Nodes teilen:

```
Webhook (bewerbung) → Code (Bewerbung) ─┬→ Send Email (gemeinsam)
                                          └→ Respond to Webhook (gemeinsam)

Webhook (kontakt)    → Code (Kontakt)   ─┘  (dieselben zwei Nodes, kein zweites Paar)
```

- **Bewerbung** (`/webhook/bewerbung`) - Karriereseite, mit Datei-Upload.
- **Kontakt** (`/webhook/kontakt`) - Kontaktformular, ohne Datei-Upload.

Send Email und Respond to Webhook werden bewusst geteilt (ein Node kann mehrere eingehende
Verbindungen haben) - beide Code-Nodes liefern dieselben Feldnamen (`emailSubject`, `emailText`,
`responseBodyJson`), sodass die gemeinsamen Nodes einfach `$json` verwenden können, ohne zu
wissen, welcher der beiden Zweige gerade gefeuert hat. **Wichtig für die Verdrahtung:** Respond to
Webhook hängt direkt an den Code-Nodes (parallel zu Send Email), nicht seriell hinter Send Email -
sonst würde Send Email die Felder durch sein eigenes Versand-Ergebnis ersetzen und Respond liefe
wieder ins Leere (das war der Bug, den wir beim ersten Aufbau hatten). Als netter Nebeneffekt
hängt die Antwort an den Browser dadurch auch nicht mehr davon ab, dass der Mailversand zuerst
durchläuft.

Beide Zweige senden an dasselbe Postfach `kontakt@hausmeisterservice-braun.de` (Absender =
Empfänger), unterschieden per Betreff-Präfix (`[BEWERBUNG]` / `[KONTAKT]`), da das IONOS-Paket
keine zusätzlichen E-Mail-Aliase erlaubt.

Manuelle Anleitung statt fertiger Import-JSON: kein Zugriff auf eure n8n-Instanz, daher nicht
gegen eure tatsächliche Version testbar. Ein manueller Aufbau über die Oberfläche ist garantiert
kompatibel.

## 1. Node: Webhook (Bewerbung) - bereits vorhanden

- **HTTP Method**: `POST`, **Path**: `bewerbung`, **Respond**: `Using 'Respond to Webhook' Node`
- **Options** → **Allowed Origins (CORS)**: `https://www.hausmeisterservice-braun.de`

## 2. Node: Code "Validieren & E-Mail vorbereiten" (Bewerbung) - bereits vorhanden

Inhalt von [`bewerbung-validate.js`](./bewerbung-validate.js), unverändert.

## 3. Node: Webhook (Kontakt) - neu

- **HTTP Method**: `POST`, **Path**: `kontakt`, **Respond**: `Using 'Respond to Webhook' Node`
- **Options** → **Allowed Origins (CORS)**: `https://www.hausmeisterservice-braun.de`

## 4. Node: Code "Validieren & E-Mail vorbereiten (Kontakt)" - neu

- Node hinzufügen: **Code** (JavaScript), direkt hinter dem Kontakt-Webhook
- Inhalt von [`kontakt-validate.js`](./kontakt-validate.js), unverändert

## 5. Node: Send Email - gemeinsam für beide Zweige

Falls beim ersten Aufbau bereits ein separater Send-Email-Node existiert: diesen einen Node
behalten, den zweiten (falls vorhanden) löschen und stattdessen den Kontakt-Code-Node zusätzlich
mit demselben Node verbinden (zweite eingehende Verbindung).

- **Credential**: SMTP, Host `smtp.ionos.de`, Port `465`, SSL/TLS aktiviert, Postfach
  `kontakt@hausmeisterservice-braun.de` (Port 587 + STARTTLS vermeiden, führt zu
  `wrong version number`-Fehlern)
- **From Email**: `kontakt@hausmeisterservice-braun.de`
- **To Email**: `kontakt@hausmeisterservice-braun.de`
- **Subject**: Expression → `{{ $json.emailSubject }}`
- **Text**: Expression → `{{ $json.emailText }}`
- **Attachments** → **Binary Property**: `lebenslauf` (bleibt leer/wird übersprungen bei
  Kontakt-Anfragen, die haben kein Binary)
- Eingehende Verbindungen: **von beiden** Code-Nodes (Bewerbung und Kontakt)

## 6. Node: Respond to Webhook - gemeinsam für beide Zweige

**Eingehende Verbindung: direkt von beiden Code-Nodes**, NICHT von Send Email aus verbinden.

- **Respond With**: `All Incoming Items` - gibt einfach das komplette JSON des jeweiligen
  Code-Node-Outputs zurück (inkl. `ok`, `errors` und ein paar zusätzlichen, für den Browser
  irrelevanten Feldern wie `emailText`). Kein Response-Body-Feld nötig, kein Ausdruck zum
  Vertippen - vermeidet die ganze Stolperfalle von vorhin (führendes `=`, JSON-Validierung)
  komplett, weil der Node gar nicht mehr selbst etwas zusammenbaut.
- **Response Code**: `200` (immer, unabhängig von ok/errors - der Status steckt im JSON-Body,
  das hält die Frontend-Logik einfacher)
- Unter **Options** → **Response Headers** (falls in diesem Modus noch vorhanden - kurz prüfen):
  - `Access-Control-Allow-Origin`: `https://www.hausmeisterservice-braun.de`
- Eingehende Verbindungen: **von beiden** Code-Nodes (Bewerbung und Kontakt), NICHT von Send Email

## 7. Verbinden & aktivieren

Beide Code-Nodes jeweils mit **beiden** gemeinsamen Nodes (Send Email und Respond to Webhook)
verbinden - macht insgesamt vier ausgehende Verbindungen von den beiden Code-Nodes (je zwei pro
Code-Node), keine Verbindung von Send Email zu Respond to Webhook. Workflow **Active** stellen.

Production-URLs:
- `https://niewiedertelefonieren.de/webhook/bewerbung` (in `karriere/index.html` eingetragen)
- `https://niewiedertelefonieren.de/webhook/kontakt` (in `kontakt/index.html` eingetragen)

## 8. Testen

```
curl -X POST https://niewiedertelefonieren.de/webhook/bewerbung \
  -F "name=Test Bewerber" -F "telefon=0123456789" \
  -F "position=Hausmeister-Allrounder (w/m/d)" \
  -F "anstellungsart=Teilzeit" -F "privacy=on" -F "firma_website="

curl -X POST https://niewiedertelefonieren.de/webhook/kontakt \
  -F "name=Test Kontakt" -F "email=test@example.com" -F "telefon=0123456789" \
  -F "dienstleistung=allgemein" -F "plz=56170" -F "ort=Bendorf" \
  -F "nachricht=Testnachricht" -F "privacy=on" -F "firma_website="
```
Erwartete Antwort jeweils: JSON mit `"ok":true,"errors":[]` (plus ein paar weiteren Feldern wie
`emailSubject`/`emailText` - "All Incoming Items" gibt den ganzen Code-Node-Output zurück, das
Frontend liest nur `ok`/`errors` daraus und ignoriert den Rest). Test-Mail mit passendem
Betreff-Präfix (`[BEWERBUNG]` / `[KONTAKT]`) bei `kontakt@hausmeisterservice-braun.de`.

## Execution-Log-Aufbewahrung (wichtig für Datenschutz, Bewerbungs-Anhänge)

Der Lebenslauf wird nirgends dauerhaft gespeichert, sondern nur direkt an die E-Mail angehängt
und durchgereicht ("relay-only") - damit entfällt ein Lösch-Job für die 6-Monats-Frist. Das
funktioniert aber nur, wenn n8n die Ausführung nicht selbst inklusive Anhang aufbewahrt:

- Workflow **Settings** (⋯-Menü oben rechts) → **Save Successful Executions** auf `None` oder
  kurze Frist stellen.
- Instanzweit (falls Zugriff auf n8n-Umgebungsvariablen besteht): `EXECUTIONS_DATA_PRUNE=true`
  + `EXECUTIONS_DATA_MAX_AGE` auf einen kurzen Wert (z.B. 720 = 30 Tage).

## Bekannte, bewusste Vereinfachungen (spätere Ausbaustufe)

- Honeypot-Fall wird nicht hart verworfen, nur im Betreff markiert (`[...-VERDACHT-SPAM]`) - spart
  eine IF-Verzweigung, kostet höchstens etwas mehr Rauschen im Posteingang.
- Kein Virenscan der Bewerbungs-Anhänge (z.B. ClamAV) - vertretbar, da Dateien nicht dauerhaft
  gespeichert werden und Mail-Provider eingehende Anhänge meist ohnehin scannen.
