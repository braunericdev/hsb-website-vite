# n8n-Workflow: Google-Bewertungen (Live-Karussell + Durchschnitt)

Liefert dem Frontend (`setupGoogleReviews()` in `main.js`) die aktuellen Google-Bewertungen als JSON.
Die Seite berechnet nichts selbst außer der Sternfüllung: Durchschnitt und Anzahl kommen von Google.

```
Webhook (GET /google-reviews) → HTTP Request (Places API) → Code (mappen) → Respond to Webhook
```

## Einrichtung (manuell im n8n, nicht Teil des Repos)

1. **Google Cloud:** Projekt anlegen → "Places API (New)" aktivieren → API-Key erstellen.
   Key einschränken: nur "Places API (New)" und nach IP des n8n-Servers.
2. **Place ID** des Google-Unternehmensprofils heraussuchen (Place-ID-Finder von Google).
3. **Webhook-Node:** Methode GET, Pfad `google-reviews`, Response Mode "Using Respond to Webhook Node".
4. **HTTP-Request-Node:**
   - GET `https://places.googleapis.com/v1/places/<PLACE_ID>?languageCode=de`
   - Header `X-Goog-Api-Key`: der API-Key (am besten als n8n-Credential)
   - Header `X-Goog-FieldMask`: `rating,userRatingCount,reviews.rating,reviews.text,reviews.relativePublishTimeDescription,reviews.authorAttribution.displayName`
5. **Code-Node:** Inhalt von `google-reviews-map.js`.
6. **Respond-to-Webhook-Node:** JSON, Header
   - `Access-Control-Allow-Origin: https://www.hausmeisterservice-braun.de` (für lokale Tests zusätzlich `http://localhost:5173` erlauben)
   - `Cache-Control: public, max-age=3600`

## Antwortformat (Vertrag mit dem Frontend)

```json
{
  "rating": 4.8,
  "total": 23,
  "reviews": [
    { "author": "Katrin R.", "rating": 5, "time": "vor 3 Wochen", "text": "..." }
  ]
}
```

## Wichtig zu wissen

- Die Places API liefert **nur bis zu 5 Bewertungen** (Google wählt sie aus). `rating`/`total` beziehen sich dagegen auf **alle** Bewertungen, deshalb hat der Google-Wert im Frontend Vorrang vor einem aus den 5 Karten errechneten Schnitt.
- Der Abruf zählt zum kostenpflichtigen Places-Kontingent (Details mit Bewertungen). Durch `Cache-Control` cached der Browser eine Stunde; wer den Verbrauch weiter drücken will, ruft die API per Schedule-Trigger stündlich ab und liefert die zuletzt gespeicherte Antwort aus.
- Ist der Endpoint nicht erreichbar oder liefert Fehler, bleibt der Karussell-Bereich auf der Seite ausgeblendet und die Kopfzeilen-Anzeige zeigt den festen Wert 5,0. Es werden nie Ersatz-Bewertungen angezeigt.
- Bewertungstexte werden im Frontend ausschließlich als Text eingesetzt (kein HTML), Google-Inhalte können also keinen Code einschleusen.
