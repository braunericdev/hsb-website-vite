# n8n-Workflow: Bewerbungsformular-Webhook (Formspree-Ersatz)

Manuelle Anleitung statt fertiger Import-JSON: Ich habe keinen Zugriff auf eure n8n-Instanz und
kann eine importierbare Workflow-Datei nicht gegen eure tatsächliche n8n-Version testen (die
Node-Formate für Bedingungen/IF-Nodes unterscheiden sich zwischen n8n-Versionen). Ein manueller
Aufbau über die Oberfläche ist dafür garantiert mit eurer Version kompatibel und dauert ca. 10
Minuten. Der Workflow ist bewusst als eine einzige lineare Kette gebaut (keine IF-Verzweigung),
das hält ihn robust und leicht nachvollziehbar.

## 1. Neuen Workflow anlegen

n8n-Oberfläche → "New Workflow" → Name z.B. `Website: Bewerbungsformular`.

## 2. Node 1: Webhook

- Node hinzufügen: **Webhook**
- **HTTP Method**: `POST`
- **Path**: `bewerbung`
- **Respond**: `Using 'Respond to Webhook' Node`
- Unter **Options** → **Allowed Origins (CORS)**: `https://www.hausmeisterservice-braun.de`
  (falls diese Option in eurer n8n-Version nicht existiert: `*` eintragen, dann klappt CORS auch,
  ist nur etwas offener)

Multipart-Datei-Uploads (der Lebenslauf) werden vom Webhook-Node automatisch als Binärdaten
erkannt, keine weitere Einstellung nötig.

## 3. Node 2: Code ("Validieren & E-Mail vorbereiten")

- Node hinzufügen: **Code** (JavaScript), direkt hinter dem Webhook
- Kompletten Inhalt von [`bewerbung-validate.js`](./bewerbung-validate.js) hineinkopieren
  (unverändert übernehmen)

## 4. Node 3: Send Email

- Node hinzufügen: **Send Email**, direkt hinter dem Code-Node
- **Credential**: neues SMTP-Credential anlegen
  - Host: `smtp.ionos.de`, Port: `465`, SSL/TLS (Secure): **aktiviert**
  - User/Passwort: euer Postfach `kontakt@hausmeisterservice-braun.de`
  - Client Hostname: leer lassen (optional, nicht relevant)
  - Port 465 mit aktiviertem SSL/TLS ist die eindeutige Kombination (direkt
    verschlüsselt von Anfang an). Port 587 + STARTTLS funktioniert bei IONOS
    zwar grundsätzlich auch, führt aber je nach n8n-Version zu
    `wrong version number`-Fehlern, wenn das SSL/TLS-Häkchen dabei
    fälschlich aktiviert wird (dann spricht n8n sofort TLS auf einem Port,
    der erst unverschlüsselt startet) - Port 465 vermeidet diese Verwechslung.
- **From Email**: `kontakt@hausmeisterservice-braun.de`
- **To Email**: `kontakt@hausmeisterservice-braun.de`
- **Subject**: Expression (auf das "fx"-Symbol neben dem Feld klicken) → `{{ $json.emailSubject }}`
- **Text**: Expression → `{{ $json.emailText }}`
- **Attachments** → **Binary Property**: `lebenslauf` (leer, falls kein Anhang mitkam - das ist
  unproblematisch, der Node überspringt Anhänge einfach, wenn die Binärdaten fehlen)

## 5. Node 4: Respond to Webhook

- Node hinzufügen: **Respond to Webhook**, direkt hinter Send Email
- **Response Code**: `200` (bewusst immer 200 - der Erfolg/Fehler-Status steckt im JSON-Body,
  das hält die Frontend-Logik einfacher als unterschiedliche HTTP-Codes zu verzweigen)
- **Response Body**: Expression → `={{ $json.responseBodyJson }}`
  (**nicht** `{{ { ok: $json.ok, errors: $json.errors } }}` eintragen - n8n wandelt ein dort
  eingesetztes JS-Objekt nur per `String(...)` um, das ergibt `[object Object]` statt echtem
  JSON und führt zu `Invalid JSON in 'Response Body' field`. Der Code-Node baut den fertigen,
  garantiert gültigen JSON-String bereits selbst unter `responseBodyJson`.)
- Unter **Options** → **Response Headers** hinzufügen:
  - `Access-Control-Allow-Origin`: `https://www.hausmeisterservice-braun.de` (oder `*`, siehe oben)

## 6. Verbinden & aktivieren

Alle vier Nodes in der Reihenfolge Webhook → Code → Send Email → Respond to Webhook verbinden.

**Wichtig:** Den Workflow oben rechts auf **Active** stellen. Die Test-URL (`/webhook-test/...`,
die während des Bearbeitens im Editor angezeigt wird) funktioniert nur, solange der Editor-Tab
offen ist und "Listen for Test Event" aktiv ist - für den produktiven Einsatz braucht ihr die
**Production-URL** (`/webhook/bewerbung`), die erst nach dem Aktivieren gilt.

## 7. Execution-Log-Aufbewahrung prüfen (wichtig für Datenschutz)

Der Lebenslauf wird bewusst nirgends dauerhaft gespeichert, sondern nur direkt an die E-Mail
angehängt und durchgereicht ("relay-only") - damit entfällt die Notwendigkeit eines
Lösch-Jobs für die 6-Monats-Frist. Das funktioniert aber nur, wenn n8n die Ausführung nicht
selbst inklusive Anhang aufbewahrt:

- Im Workflow: **Settings** (⋯-Menü oben rechts) → **Save Successful Executions** auf `None`
  (oder minimal) stellen.
- Instanzweit (falls ihr Zugriff auf die n8n-Umgebungsvariablen habt): `EXECUTIONS_DATA_PRUNE=true`
  und `EXECUTIONS_DATA_MAX_AGE` auf einen kurzen Wert (z.B. 720 = 30 Tage) prüfen/setzen - sonst
  bleibt der Lebenslauf trotzdem im n8n-eigenen Ausführungsverlauf liegen.

## 8. Testen

Nach dem Aktivieren:
```
curl -X POST https://niewiedertelefonieren.de/webhook/bewerbung \
  -F "name=Test Bewerber" -F "telefon=0123456789" \
  -F "position=Hausmeister-Allrounder (w/m/d)" \
  -F "anstellungsart=Teilzeit" -F "privacy=on" -F "firma_website="
```
Erwartete Antwort: `{"ok":true,"errors":[]}`, und eine Test-Mail sollte bei
`kontakt@hausmeisterservice-braun.de` ankommen.

## Produktions-Webhook-URL

`https://niewiedertelefonieren.de/webhook/bewerbung`

(Diese URL ist bereits in `karriere/index.html` als Formular-`action` eingetragen. Funktioniert
erst, sobald das TLS-Zertifikat der Domain erneuert und dieser Workflow aktiviert ist.)

## Bekannte, bewusste Vereinfachungen (spätere Ausbaustufe)

- Der Honeypot-Fall wird nicht hart verworfen, nur im Betreff markiert (`[BEWERBUNG-VERDACHT-SPAM]`) -
  spart eine IF-Verzweigung, kostet höchstens etwas mehr Rauschen im Posteingang.
- Kein Virenscan der Anhänge (z.B. ClamAV) - vertretbar für den Start, da Dateien nicht dauerhaft
  gespeichert werden und die meisten Mail-Provider (auch IONOS) eingehende Anhänge ohnehin scannen.
- Kontaktformular (`kontakt/index.html`) läuft weiterhin über Formspree, unverändert - Migration
  auf denselben n8n-Workflow ist Phase 2, nachdem dieser Webhook sich im Betrieb bewährt hat.
