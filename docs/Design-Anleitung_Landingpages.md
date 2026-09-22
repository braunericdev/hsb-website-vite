---
title: "Design-Anleitung: Landingpages"
subtitle: "Handoff-Spec für Claude"
date: "Stand: 2026-09-17"
lang: de
mainfont: "DejaVu Sans"
monofont: "DejaVu Sans Mono"
geometry: margin=2.2cm
fontsize: 10.5pt
colorlinks: true
linkcolor: blue
urlcolor: blue
toc: true
toc-depth: 2
---

Zweck: 1:1 an einen Claude-Code-Agenten übergeben, um pro Leistung eine eigene, kampagnenfähige Landingpage zu bauen (Ziel primär: Google Ads, siehe Website-Playbook Abschnitt 6). Diese Seiten sind NICHT die normale Website-Navigation – sie sind Conversion-Instrumente. Baut auf denselben Design-Tokens wie die Startseite auf (siehe "Design-Anleitung Startseite"), aber mit anderer Struktur-Logik. Referenziert zusätzlich die **Wettbewerbsanalyse Kleine Gebäudereiniger (2-10 Mitarbeiter)** für die Positionierungs- und Preismodell-Punkte in Abschnitt 2 und 6.

## Overview
Eine Landingpage bekommt genau EIN Ziel: den Klick auf einen Anzeigen-Link in eine Anfrage umwandeln. Jede Ablenkung (Navigation zu anderen Leistungen, mehrere Angebote, externe Links) senkt die Conversion Rate – Grundprinzip bezahlter Kampagnen, im Website-Playbook Abschnitt 6 als "eigene Landingpage pro Leistung, nicht die Homepage verlinken" festgehalten. Es gibt 6 Varianten dieser Vorlage, eine pro Leistung (Gartenpflege, Heckenschnitt, Rasenmähen, Außenreinigung, Gebäudereinigung, Entrümpelung).

## Unterschied zur Startseite (wichtig für den Coding-Agenten)

| | Startseite | Landingpage |
|---|---|---|
| Navigation | Vollständig (Header-Menü) | **Keine** – nur Logo + Telefonnummer im Header, kein Link zu anderen Seiten außer Impressum/Datenschutz im Footer |
| Ziel | Orientierung über alle Leistungen | Eine einzige Handlung: Anfrage/Anruf zu GENAU dieser Leistung |
| Ton | Überblick, Vertrauen aufbauen | Sofortige Übereinstimmung mit dem Anzeigentext, das genau nachliefern, was das Keyword versprochen hat |
| Angebote | Ein CTA, aber Seite darf mehrere Themen zeigen | Ein CTA, EIN Thema, keine Abzweigung |

## Design-Tokens
Identisch zur Startseite (siehe „Design-Anleitung Startseite" – Abschnitt Design-Tokens), mit einer Ergänzung:

| Token | Wert | Verwendung |
|---|---|---|
| `sticky-cta-bar` | Höhe 56px, `color-accent`-Hintergrund, fixiert unten | Nur mobil, nur auf Landingpages – Klick-zum-Anrufen-Leiste immer sichtbar (siehe Playbook: 60–70% der Leads laufen telefonisch) |

## Layout & Sections (Template, in dieser Reihenfolge)

### 1. Minimal-Header
- Nur Logo + klickbare Telefonnummer. **Keine Navigation, kein Menü.** Das ist bewusst kein Fehler, sondern Absicht: jeder Ausgang von der Seite senkt die Conversion.

### 2. Hero (Keyword-Match)
- H1 = exakte oder nahezu exakte Übereinstimmung mit dem Anzeigentext/Google-Ads-Keyword, Formel: „{{Leistung}} in {{Ort}} – {{Kernversprechen}}"
  - Beispiel für Winterdienst: „Winterdienst in Bendorf – zuverlässig geräumt, bevor Sie aus dem Haus gehen"
- Sub-Headline: konkretes Leistungsversprechen + Festpreis-Hinweis
- EIN CTA-Button direkt im Hero, sichtbar ohne Scrollen: „Jetzt kostenloses Angebot anfordern"
- Trust-Mini-Bar direkt unter dem CTA: Sterne-Bewertung (sobald vorhanden) + „Festpreis" + „Seit [Jahr]" + „Kein Callcenter – direkter Draht zu Eric & Dennis"
  - Begründung: Erdan Glas- und Gebäudereinigung (Koblenz/Neuwied, siehe Wettbewerbsanalyse Kleine Gebäudereiniger) stellt genau diesen Punkt heraus, weil er bei einer 2-Personen-GbR wörtlich wahr ist und sich auf einer Ads-Landingpage genauso knapp unterbringen lässt wie „Festpreis" – kein zusätzlicher Platzbedarf, aber ein Differenzierungspunkt gegenüber Konzern-Wettbewerbern mit Zentrale/Hotline
- Hero-Bild: echtes Foto DIESER Leistung (kein generisches Team-/Stockfoto – Audit 3.1 gilt hier doppelt, weil die Landingpage die Kaufentscheidung direkt beeinflusst)

### 3. Bildbeweis: Vorher/Nachher (optional ergänzt um kurzes Arbeitsvideo)
- Vorher/Nachher-Slider (Code: Website-Playbook Abschnitt 7.4), zeigt AUSSCHLIESSLICH Arbeiten zu genau dieser Leistung, nicht gemischt
- Mindestens 1, idealerweise 2–3 Beispiele
- **Optional, falls vorhanden:** zusätzlich oder alternativ ein kurzes (10–30 Sek.) echtes Arbeitsvideo zu genau dieser Leistung statt/neben dem Slider. Vorbild: Tairovic Gebäudeservice (Neuwied, siehe Wettbewerbsanalyse Kleine Gebäudereiniger), die pro Leistung mehrere kurze Arbeitsvideos einbetten statt nur Fotos. Auf einer Landingpage ist das noch wirksamer als auf der Startseite, weil der Besucher schon eine konkrete Kaufabsicht zu genau dieser Leistung hat. Technisch: einfaches HTML5 `<video>` oder eingebettetes YouTube/Vimeo, kein Autoplay mit Ton (siehe Interaktion & States)
- Kein Stockfoto/-video als Lückenfüller, falls für diese Leistung noch nichts existiert (siehe Edge Cases)

### 4. Leistungsbeschreibung – Benefit-Formel
- 3–5 Stichpunkte nach dem Muster „[Teilleistung] → [Nutzen für den Auftraggeber]" (Wettbewerbsanalyse 3.2), KEIN Fließtext-Block
- Beispiel Winterdienst: „Räumung vor 7 Uhr → keine Haftungsrisiken für Eigentümer", „Streuung mit umweltschonendem Material → kein Flächenschaden", „Bereitschaft bei Wetterwarnung → keine Überraschungen am Wochenende"

### 5. Einzugsgebiet
- Kurze Liste bedienter Orte/PLZ-Bereiche ODER kleine eingebettete Karte
- Direkt beantworten: „Arbeitet ihr auch bei mir?" – Audit 2.2 gilt hier genauso wie auf der Startseite, aber auf einer Ads-Landingpage noch wichtiger, weil Streuverluste bares Geld kosten

### 6. Preisrahmen / Festpreis-Erklärung
- Keine Blackbox „Kontaktieren Sie uns für ein Angebot" – stattdessen kurz erklären, wovon der Preis abhängt (Fläche, Häufigkeit, Zugänglichkeit) und dass ein Festpreis vor Arbeitsbeginn feststeht
- Falls Preisspannen kommuniziert werden sollen: als Richtwert-Range, nicht als exakte Zahl (rechtlich/strategisch vorher intern klären – kein reiner Coding-Entscheid)
- **Diskussionspunkt, kein Pflicht-Feature:** Die Zwei Brüder (Bergisch Gladbach/Köln, siehe Wettbewerbsanalyse Kleine Gebäudereiniger) bieten statt Einzelpreisen gestaffelte Pakete (Paket L/XL/XXL, ca. 49–119 €/Monat) an – transparent auf der Website einsehbar, ohne Angebotsanfrage. Für Landingpages, die speziell Hausverwaltungen/WEGs ansprechen (wiederkehrende Objektbetreuung statt Einzelauftrag), wäre das eine mögliche Alternative zu „Kontaktieren Sie uns". Das ist wie in der Startseiten-Anleitung (Abschnitt 4a) ausdrücklich KEINE Bauanweisung, sondern ein Punkt, der zuerst zwischen Eric und Dennis geklärt werden muss, bevor ein Coding-Agent ihn umsetzt. Bis zu dieser Klärung gilt die generische Festpreis-Erklärung oben

### 7. Formular + CTA (zentral, nicht am Seitenende versteckt)
- Felder: Name (Pflicht), Telefon (Pflicht), PLZ (Pflicht), Nachricht (optional) – E-Mail optional, analog zum bestehenden Kontaktformular-Muster, das im Audit als bereits richtig bewertet wurde (telefonorientiert)
- Direkt am Absenden-Button: „Antwort innerhalb von 24h" (Audit-Fix 2.1, hier von Anfang an korrekt umsetzen)
- Datenschutz-Checkbox wie im bestehenden Formular

### 8. FAQ (leistungsspezifisch)
3–5 Fragen NUR zu dieser Leistung, keine allgemeinen Firmen-FAQ. Beispiel Winterdienst: „Was passiert bei plötzlichem Schneefall am Wochenende?", „Haften wir bei einem Sturz trotz Winterdienst?", „Ab welcher Schneemenge räumt ihr?"

### 9. Schluss-Footer (minimal)
Nur: Impressum, Datenschutz, Firmenname/Adresse. Kein Link zurück zur vollen Website-Navigation, kein Link zu anderen Leistungen – bewusster Unterschied zur Startseite.

## Meta-Daten (pro Landingpage individuell – Audit 1.1 darf sich hier nicht wiederholen)
- **Title-Formel:** „{{Leistung}} {{Ort}} – Festpreis & schnelle Terminvergabe | Braun Hausmeisterservice"
- **Meta-Description-Formel:** „{{Leistung}} in {{Ort}}: zuverlässig, zum Festpreis, Antwort innerhalb von 24h. Jetzt unverbindlich anfragen." – für jede der 6 Varianten eigenständig ausformulieren, NICHT den Startseiten-Text kopieren

## Interaktion & States

| Element | Zustand | Verhalten |
|---|---|---|
| Sticky-CTA-Bar (mobil) | Beim Scrollen | Erscheint nach Verlassen des Hero-Bereichs, bleibt fixiert am unteren Rand |
| Formular | Absenden erfolgreich | Redirect `/danke/`, im Idealfall mit Conversion-Tracking-Event (siehe unten) |
| Formular | Fehler | Inline-Fehlertext je Feld, Fokus springt zum ersten fehlerhaften Feld |
| Vorher/Nachher-Slider | Interaktion | Touch- und Maus-fähig, siehe Playbook 7.4 |
| Arbeitsvideo (falls vorhanden) | Standard | Kein Autoplay mit Ton; entweder Klick-zum-Abspielen oder stummes Autoplay mit sichtbarem Mute-Icon |
| CTA-Button | Hover/Active | Wie Startseite: `color-accent`, 10% abdunkeln bei Hover |

## Responsive Verhalten

| Breakpoint | Änderungen |
|---|---|
| Desktop (>1024px) | Hero zweispaltig: Text links, Bild rechts |
| Tablet | Hero einspaltig, Bild unter Text |
| Mobil (<768px) | Sticky-CTA-Bar aktiv, Formular-Felder untereinander, Trust-Mini-Bar bricht auf 2 Zeilen um |

## Technische Anforderungen (über Design hinaus, aber für den Coding-Agenten relevant)
- **Ladezeit strenger als Startseite:** Ziel LCP < 2s (nicht nur < 2,5s wie allgemein im Playbook), weil Google Ads den Qualitätsfaktor u. a. über die Landingpage-Erfahrung bewertet und ein hoher Qualitätsfaktor den Klickpreis senkt (Website-Playbook Abschnitt 6)
- **Conversion-Tracking-Platzhalter einbauen:** Google-Ads-Conversion-Tag auf der `/danke/`-Seite, Platzhalter für Call-Tracking-Rufnummer (dynamische Rufnummerneinblendung), sobald ein Anbieter wie matelso/CallTrackingMetrics angebunden wird (Playbook Abschnitt 6)
- **UTM-Parameter:** Formular soll `utm_source`/`utm_campaign` aus der URL mitloggen (versteckte Formularfelder), damit spätere Auswertung möglich ist
- **Keine Sitemap-Aufnahme der Ads-spezifischen Variante zwingend nötig**, falls dieselbe URL sowohl organisch als auch für Ads genutzt wird – das ist eine Entscheidung, die vor dem Bau geklärt werden sollte (SEO- vs. Ads-Landingpage können identisch oder getrennt sein, siehe Playbook Abschnitt 5 vs. 6)

## Edge Cases
- **Leistung ohne Vorher/Nachher-Fotos:** Landingpage für diese Leistung nicht launchen, bevor mindestens 1 Beispielfoto existiert – bei einer Ads-Landingpage ist Bildbeweis kein "nice to have", sondern zentral
- **Noch kein Arbeitsvideo vorhanden:** Abschnitt 3 läuft ohne Video, ausschließlich mit dem Vorher/Nachher-Slider – kein Stock-/Platzhaltervideo einbauen
- **Kein Preisrahmen intern festgelegt:** Abschnitt 6 durch generische, aber ehrliche Formulierung ersetzen ("transparent nach Aufwand, immer vorab als Festpreis"), nicht eine Zahl erfinden

## Was NICHT umgesetzt werden soll (Guardrails)
- Keine Navigation zu anderen Leistungen oder zur Startseite (bewusster Unterschied zur normalen Website-Anleitung)
- Kein zweites Angebot neben dem Hauptformular (kein Rabatt-Countdown, keine "Testphase" – Audit 2.3, hier besonders wichtig, weil Ads-Traffic bezahlt ist und jede Verwässerung direkt Geld kostet)
- Keine schweren Animationseffekte (GSAP/Lenis/3D) – Ladezeit hat hier noch höhere Priorität als auf der Startseite
- Kein Paketpreis-Modell (Abschnitt 6) ohne vorherige interne Freigabe durch Eric und Dennis – siehe Design-Anleitung Startseite, Abschnitt 4a

## Definition of Done
- [ ] Genau eine Handlung möglich (Formular/Anruf), keine Navigation nach außen außer Impressum/Datenschutz
- [ ] H1 spiegelt exakt das Keyword/Anzeigenversprechen wider
- [ ] Eigene, leistungsspezifische Meta-Description (nicht kopiert)
- [ ] Mindestens ein echtes Vorher/Nachher-Beispiel zu genau dieser Leistung
- [ ] „Kein Callcenter"-Trust-Element in der Trust-Mini-Bar sichtbar
- [ ] Antwortzeit-Versprechen direkt am Formular
- [ ] Einzugsgebiet sichtbar
- [ ] Falls Paketpreis-Modell diskutiert wurde: Entscheidung von Eric und Dennis dokumentiert, bevor umgesetzt
- [ ] LCP < 2s geprüft (PageSpeed Insights, mobil)
- [ ] Sticky-CTA-Bar auf Mobilgeräten getestet
