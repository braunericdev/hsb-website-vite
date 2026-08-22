# n8n-Workflow: Formular-Webhooks (Formspree-Ersatz)

Ein n8n-Workflow mit zwei komplett getrennten Ketten (kein Node wird zwischen den Zweigen
geteilt):

```
Webhook (bewerbung) → Code (Bewerbung) → Send Email (Bewerbung) → Respond to Webhook (Bewerbung)
Webhook (kontakt)    → Code (Kontakt)   → Send Email (Kontakt)   → Respond to Webhook (Kontakt)
```

- **Bewerbung** (`/webhook/bewerbung`) - Karriereseite, mit Datei-Upload. **Steht bereits, live
  getestet.**
- **Kontakt** (`/webhook/kontakt`) - Kontaktformular, ohne Datei-Upload. Neu hinzuzufügen.

**Wichtig, bewusste Entscheidung gegen geteilte Nodes:** Die Antwort an den Browser soll erst
"Erfolg" melden, wenn die E-Mail tatsächlich verschickt wurde (nicht schon nach der Validierung) -
Respond to Webhook muss also seriell HINTER Send Email hängen, nicht parallel dazu. Ein
Send-Email- oder Respond-Node, der zwischen beiden Zweigen geteilt würde, könnte in einem
gegebenen Lauf nicht sicher unterscheiden, welcher der beiden Code-Nodes gerade tatsächlich
gelaufen ist (das war der Bug, den wir am Bewerbungs-Zweig hatten). Volle Trennung ist hier die
robustere, leicht nachvollziehbare Lösung - kostet nur zwei zusätzliche Nodes.

Beide Zweige senden an dasselbe Postfach `kontakt@hausmeisterservice-braun.de` (Absender =
Empfänger), unterschieden per Betreff-Präfix (`[BEWERBUNG]` / `[KONTAKT]`), da das IONOS-Paket
keine zusätzlichen E-Mail-Aliase erlaubt.

Manuelle Anleitung statt fertiger Import-JSON: kein Zugriff auf eure n8n-Instanz, daher nicht
gegen eure tatsächliche Version testbar. Ein manueller Aufbau über die Oberfläche ist garantiert
kompatibel.

## Zweig A: Bewerbung (bereits eingerichtet, live verifiziert)

Webhook (Path `bewerbung`) → Code (`bewerbung-validate.js`) → Send Email → Respond to Webhook,
alle vier Nodes nur für diesen Zweig. Funktionierende Respond-to-Webhook-Konfiguration (siehe
Zweig B unten für die identische Vorgehensweise) - falls hier noch Reste vom
Node-Teilungs-Versuch existieren (z.B. eine Verbindung von diesem Send-Email-Node zum
Kontakt-Zweig), diese Verbindung entfernen, sodass der Zweig wieder komplett eigenständig ist.

## Zweig B: Kontakt (neu einrichten)

### 1. Node: Webhook

- **HTTP Method**: `POST`, **Path**: `kontakt`, **Respond**: `Using 'Respond to Webhook' Node`
- **Options** → **Allowed Origins (CORS)**: `https://www.hausmeisterservice-braun.de`

### 2. Node: Code ("Kontakt validieren und Email vorbereiten")

- Node hinzufügen: **Code** (JavaScript), direkt hinter diesem Webhook
- Inhalt von [`kontakt-validate.js`](./kontakt-validate.js), unverändert

### 3. Node: Send Email (eigener Node, nicht geteilt)

- Neuen **Send Email**-Node hinzufügen, direkt hinter dem Kontakt-Code-Node
- **Credential**: dieselbe SMTP-Credential wie beim Bewerbungs-Zweig wiederverwenden (Host
  `smtp.ionos.de`, Port `465`, SSL/TLS aktiviert, Postfach `kontakt@hausmeisterservice-braun.de`)
- **From Email**: `kontakt@hausmeisterservice-braun.de`
- **To Email**: `kontakt@hausmeisterservice-braun.de`
- **Subject**: Expression → `{{ $json.emailSubject }}`
- **Text**: Expression → `{{ $json.emailText }}`
- Kein Attachment-Feld nötig (dieses Formular hat keinen Datei-Upload)

### 4. Node: Respond to Webhook (eigener Node, nicht geteilt)

- Neuen **Respond to Webhook**-Node hinzufügen, direkt hinter diesem Send-Email-Node
- **Respond With**: `All Incoming Items` (gibt das komplette JSON des direkten Vorgängers zurück -
  das ist hier Send Email, dessen Versand-Ergebnis zwar auch `ok`/`errors` nicht enthält, siehe
  Hinweis unten)
- **Response Code**: `200`
- Unter **Options** → **Response Headers**: `Access-Control-Allow-Origin` →
  `https://www.hausmeisterservice-braun.de`

**Achtung, wichtiger Unterschied zu vorher:** Da Respond jetzt hinter Send Email hängt (nicht
mehr direkt hinter Code), enthalten die "All Incoming Items" nur noch Send Emails eigenes
Versand-Ergebnis (`accepted`, `messageId`, ...), nicht mehr `ok`/`errors` aus dem Code-Node. Damit
das Frontend trotzdem weiß, ob die serverseitige Validierung ok war, **Response Body stattdessen
explizit setzen** statt "All Incoming Items":
- **Respond With**: `Text`
- **Response Body**: Expression →
  ```
  {{ $('Kontakt validieren und Email vorbereiten').item.json.responseBodyJson }}
  ```
  (exakten Node-Namen des Code-Nodes verwenden, per `$(` im Feld tippen zeigt die Auswahl - kein
  führendes `=` davor, siehe Stolperfalle unten)

**Drei Stolperfallen, alle bereits beim Bewerbungs-Zweig live bestätigt:**
1. Kein rohes JS-Objekt (`{{ { ok: ..., errors: ... } }}`) eintragen - wird nur per `String(...)`
   umgewandelt (`[object Object]`), nicht per JSON.stringify. Der Code-Node liefert den fertigen
   String bereits unter `responseBodyJson`.
2. **Node-Referenz zwingend**, nicht bloßes `$json` - `$json` bezieht sich auf den direkten
   Vorgänger **Send Email**, der die Felder durch sein eigenes Versand-Ergebnis ersetzt.
3. **Kein führendes `=`** vor `{{ ... }}` - landet bei diesem Feld/dieser n8n-Version (2.35.7)
   wortwörtlich als erstes Zeichen der Antwort, macht sie zu ungültigem JSON.

### 5. Verbinden & aktivieren

Webhook (kontakt) → Code → Send Email → Respond to Webhook verbinden, workflow-weit **Active**
bleibt bestehen. Production-URL: `https://niewiedertelefonieren.de/webhook/kontakt`.

## Testen

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
Erwartete Antwort jeweils: `{"ok":true,"errors":[]}`, Test-Mail mit passendem Betreff-Präfix
(`[BEWERBUNG]` / `[KONTAKT]`) bei `kontakt@hausmeisterservice-braun.de`.

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
