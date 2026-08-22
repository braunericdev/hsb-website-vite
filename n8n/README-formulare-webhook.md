# n8n-Workflow: Formular-Webhooks (Formspree-Ersatz)

Ein n8n-Workflow mit zwei parallelen Zweigen (jeweils eigener Webhook-Node, eigener Pfad):

- **Bewerbung** (`/webhook/bewerbung`) - Karriereseite, mit Datei-Upload. **Steht bereits, live
  getestet.**
- **Kontakt** (`/webhook/kontakt`) - Kontaktformular, ohne Datei-Upload. Neu hinzuzufügen.

Beide Zweige laufen unabhängig nebeneinander im selben Workflow (kein gemeinsamer Endpoint mit
Verzweigung) - eine spätere Änderung am einen Zweig kann den anderen nicht versehentlich anfassen.
Beide senden an dasselbe Postfach `kontakt@hausmeisterservice-braun.de` (Absender = Empfänger),
unterschieden per Betreff-Präfix (`[BEWERBUNG]` / `[KONTAKT]`), da das IONOS-Paket keine
zusätzlichen E-Mail-Aliase erlaubt.

Manuelle Anleitung statt fertiger Import-JSON: kein Zugriff auf eure n8n-Instanz, daher nicht
gegen eure tatsächliche Version testbar. Ein manueller Aufbau über die Oberfläche ist garantiert
kompatibel. Jeder Zweig ist bewusst eine einzige lineare Kette ohne IF-Verzweigung.

## Zweig A: Bewerbung (bereits eingerichtet)

Webhook (Path `bewerbung`) → Code (`bewerbung-validate.js`) → Send Email → Respond to Webhook.
Fertig eingerichtet und live verifiziert (Text, Datei-Upload, Validierung, Honeypot laufen alle
korrekt). Details siehe Git-Historie dieser Datei, falls der Aufbau mal neu nachvollzogen werden
muss - der Aufbau von Zweig B unten ist identisch im Muster, nur mit anderen Feldern.

## Zweig B: Kontakt (neu einrichten)

### 1. Node 1: Webhook

- Node hinzufügen: **Webhook**
- **HTTP Method**: `POST`
- **Path**: `kontakt`
- **Respond**: `Using 'Respond to Webhook' Node`
- Unter **Options** → **Allowed Origins (CORS)**: `https://www.hausmeisterservice-braun.de`

### 2. Node 2: Code ("Validieren & E-Mail vorbereiten (Kontakt)")

- Node hinzufügen: **Code** (JavaScript), direkt hinter diesem Webhook
- Kompletten Inhalt von [`kontakt-validate.js`](./kontakt-validate.js) hineinkopieren
  (unverändert übernehmen)

### 3. Node 3: Send Email

- Node hinzufügen: **Send Email**, direkt hinter dem Code-Node
- **Credential**: dieselbe SMTP-Credential wie beim Bewerbungs-Zweig wiederverwenden
  (Host `smtp.ionos.de`, Port `465`, SSL/TLS aktiviert, Postfach
  `kontakt@hausmeisterservice-braun.de` - siehe Zweig A, falls diese noch nicht existiert:
  Port 587 + STARTTLS vermeiden, führt zu `wrong version number`-Fehlern)
- **From Email**: `kontakt@hausmeisterservice-braun.de`
- **To Email**: `kontakt@hausmeisterservice-braun.de`
- **Subject**: Expression → `{{ $json.emailSubject }}`
- **Text**: Expression → `{{ $json.emailText }}`
- Kein Attachment-Feld nötig (dieses Formular hat keinen Datei-Upload)

### 4. Node 4: Respond to Webhook

- Node hinzufügen: **Respond to Webhook**, direkt hinter Send Email
- **Respond With**: `Text` (nicht `JSON`, siehe Stolperfalle unten)
- **Response Code**: `200`
- **Response Body**: Expression →
  ```
  {{ $('Validieren & E-Mail vorbereiten (Kontakt)').item.json.responseBodyJson }}
  ```
  **Drei Stolperfallen, alle bereits beim Bewerbungs-Zweig live bestätigt - hier von Anfang an
  richtig machen:**
  1. Kein rohes JS-Objekt (`{{ { ok: ..., errors: ... } }}`) eintragen - wird nur per `String(...)`
     umgewandelt (`[object Object]`), nicht per JSON.stringify. Der Code-Node liefert den fertigen
     String bereits unter `responseBodyJson`.
  2. **Node-Referenz zwingend nötig**, nicht bloßes `$json` - `$json` würde sich auf den direkten
     Vorgänger **Send Email** beziehen, der die Felder durch sein eigenes Versand-Ergebnis ersetzt.
     Exakten Node-Namen verwenden (per `$(` im Feld tippen, aus der Vorschlagsliste wählen, falls
     der Node bei euch anders heißt).
  3. **Kein führendes `=` vor `{{ ... }}`** - landet bei diesem Feld/dieser n8n-Version (2.35.7)
     wortwörtlich als erstes Zeichen der Antwort statt als Ausdrucks-Markierung interpretiert zu
     werden, macht die Antwort zu ungültigem JSON.
- Unter **Options** → **Response Headers** hinzufügen:
  - `Access-Control-Allow-Origin`: `https://www.hausmeisterservice-braun.de`

### 5. Verbinden & aktivieren

Webhook (kontakt) → Code → Send Email → Respond to Webhook verbinden, workflow-weit **Active**
bleibt bestehen (gilt für den ganzen Workflow, nicht pro Zweig). Production-URL:
`https://niewiedertelefonieren.de/webhook/kontakt`.

### 6. Testen

```
curl -X POST https://niewiedertelefonieren.de/webhook/kontakt \
  -F "name=Test Kontakt" -F "email=test@example.com" -F "telefon=0123456789" \
  -F "dienstleistung=allgemein" -F "plz=56170" -F "ort=Bendorf" \
  -F "nachricht=Testnachricht" -F "privacy=on" -F "firma_website="
```
Erwartete Antwort: `{"ok":true,"errors":[]}`, Test-Mail sollte bei
`kontakt@hausmeisterservice-braun.de` mit Betreff-Präfix `[KONTAKT]` ankommen.

## Execution-Log-Aufbewahrung (gilt für beide Zweige)

Für Zweig A (Bewerbung) wegen der Lebenslauf-Anhänge datenschutzrelevant (siehe dort), für Zweig B
weniger kritisch (keine Anhänge, aber trotzdem Kontaktdaten). Empfehlung für den ganzen Workflow:

- **Settings** (⋯-Menü oben rechts) → **Save Successful Executions** auf `None` oder eine kurze
  Frist stellen.
- Instanzweit `EXECUTIONS_DATA_PRUNE=true` + `EXECUTIONS_DATA_MAX_AGE` auf einen kurzen Wert
  (z.B. 720 = 30 Tage) prüfen, falls Zugriff auf die n8n-Umgebungsvariablen besteht.

## Produktions-Webhook-URLs

- `https://niewiedertelefonieren.de/webhook/bewerbung` (in `karriere/index.html` eingetragen)
- `https://niewiedertelefonieren.de/webhook/kontakt` (in `kontakt/index.html` eingetragen)

## Bekannte, bewusste Vereinfachungen (spätere Ausbaustufe, beide Zweige)

- Honeypot-Fall wird nicht hart verworfen, nur im Betreff markiert (`[...-VERDACHT-SPAM]`) - spart
  eine IF-Verzweigung, kostet höchstens etwas mehr Rauschen im Posteingang.
- Kein Virenscan der Bewerbungs-Anhänge (z.B. ClamAV) - vertretbar, da Dateien nicht dauerhaft
  gespeichert werden und Mail-Provider eingehende Anhänge meist ohnehin scannen.
