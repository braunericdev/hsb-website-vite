---
title: "Design-Anleitung: Startseite"
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

Zweck: 1:1 an einen Claude-Code-Agenten übergeben, um die Startseite von hausmeisterservice-braun.de neu zu bauen bzw. zu überarbeiten. Baut direkt auf vier bestehenden Projekt-Dokumenten auf – bei Widersprüchen gilt dieses Dokument für die Startseite, die anderen bleiben die allgemeine Referenz:

- **Website-Playbook (Design, SEO, Google Ads)** – Design-/SEO-/Ads-Grundlagen
- **Wettbewerbsanalyse Top 10 Gebäudereiniger** – Struktur- und Copy-Muster der großen Konzerne
- **Wettbewerbsanalyse Kleine Gebäudereiniger (2-10 Mitarbeiter)** – Struktur- und Positionierungsmuster der echten, größenmäßig vergleichbaren Konkurrenz
- **Website-Audit hausmeisterservice-braun.de** – konkrete Mängel der aktuellen Seite, die hier behoben werden

## Overview
Die Startseite ist der Einstiegspunkt für zwei Zielgruppen gleichzeitig: Privatkunden (Garten/Haushalt) und Hausverwaltungen/WEGs (gewerbliche Objektbetreuung). Sie muss beide in unter 10 Sekunden zur richtigen Leistungsseite oder zum Kontaktformular führen. Sie ist NICHT die Seite, auf die Google-Ads-Kampagnen verlinken (dafür gibt es die separate Anleitung "Design-Anleitung Landingpages").

## Design-Tokens
Konkrete Werte statt "modern/professionell" – vermeidet Interpretationsspielraum beim Bauen.

| Token | Wert | Verwendung |
|---|---|---|
| `color-primary` | `#1F6F4A` (Waldgrün) | Logo-Akzent, Header-Unterstreichung, Icons, Links |
| `color-primary-dark` | `#164F35` | Hover-Zustand auf primären Flächen |
| `color-accent` | `#E8871E` (warmes Orange) | AUSSCHLIESSLICH für den einen Haupt-CTA-Button |
| `color-neutral-900` | `#1A1A1A` | Fließtext |
| `color-neutral-600` | `#5C6660` | Sekundärtext, Meta-Infos |
| `color-neutral-100` | `#F5F7F5` | Section-Hintergrund im Wechsel mit Weiß |
| `color-white` | `#FFFFFF` | Standard-Hintergrund |
| `font-family` | `"Inter", system-ui, sans-serif` | Eine Variable-Font-Familie für Headings und Fließtext |
| `font-heading-xl` | 40px / 700 / 1.15 | H1 |
| `font-heading-lg` | 28px / 700 / 1.2 | H2 |
| `font-heading-md` | 20px / 600 / 1.3 | H3 |
| `font-body` | 16px / 400 / 1.6 | Fließtext |
| `space-section` | 96px vertikal (48px mobil) | Abstand zwischen Sections |
| `space-md` | 24px | Innenabstand Karten |
| `radius` | 12px | Karten, Buttons, Bilder |
| `shadow-card` | `0 2px 12px rgba(0,0,0,0.08)` | Karten-Elevation |

Begründung Farbwahl: Grün statt Blau, weil Gartenpflege eine der Kernleistungen ist (thematischer Bezug) und Grün mit Nachhaltigkeit/Natur assoziiert wird (Website-Playbook Abschnitt 7.2). Kein Neon, keine Multicolor-Palette.

## Layout & Sections (in dieser Reihenfolge)

### 1. Header (sticky)
- Logo links, Telefonnummer rechts (klickbar, `tel:`-Link, immer sichtbar, auch mobil), Navigation mittig: Startseite, Leistungen (Dropdown mit allen 6 Einzelleistungen), Karriere, Kontakt
- **Fix aus Audit 2.4:** Nur EINE Telefonnummer im Header, nicht beide privaten Nummern parallel anzeigen
- Mobil: Hamburger-Menü, Telefonnummer bleibt als Icon-Button sichtbar

### 2. Hero
- H1 (genau einer, konkret): Beispiel „Zuverlässiger Hausmeisterservice für Haus, Garten & Objekt – Bendorf und Umgebung"
- Sub-Headline: Ein-Ansprechpartner-Versprechen mit expliziter Anti-Callcenter-Botschaft, z. B. „Kein Callcenter, kein Vertreter – ein Anruf bei Eric oder Dennis Braun persönlich, die sich um Ihr Objekt kümmern." Begründung: Erdan Glas- und Gebäudereinigung (Koblenz/Neuwied, siehe Wettbewerbsanalyse Kleine Gebäudereiniger) nutzt exakt diese Positionierung erfolgreich, und sie ist bei einer 2-Personen-GbR wörtlich wahr
- EIN primärer CTA-Button (`color-accent`): „Kostenloses Angebot anfordern"
- Hero-Bild: echtes Foto von Eric/Dennis bei der Arbeit, kein Stockfoto (Audit 1.4/3.1)
- **Kein** paralleles Rabatt-/Bonus-Angebot in der Hero-Sektion (Audit 2.3)

### 3. Vertrauens-Leiste (direkt unter Hero)
3–4 Fakten nebeneinander, Icon + Kurztext, echte Zahlen:

- „Kein Callcenter – direkter Draht zu Eric & Dennis" (ersetzt die vorherige, schwächere Formulierung „Persönlich vor Ort" – siehe Wettbewerbsanalyse Kleine Gebäudereiniger, Abschnitt 2: das ist die Formulierung, die eure echte Konkurrenz aktiv und erfolgreich nutzt)
- „Festpreis vor Arbeitsbeginn"
- „Antwort innerhalb von 24h" (schließt Audit-Lücke 2.1)
- „[X] Jahre am Markt" bzw. Gründungsjahr

### 4. Leistungsübersicht – Bento-Grid
- Technische Umsetzung: siehe Website-Playbook Abschnitt 7.3 (fertiger CSS-Code)
- 6 Kacheln (Gartenpflege, Heckenschnitt, Rasenmähen, Außenreinigung, Gebäudereinigung, Entrümpelung), größte Kachel = wichtigste Leistung
- Jede Kachel: Icon/Bild, Leistungsname, EIN Benefit-Satz nach Formel „[Leistung] → [Nutzen für Auftraggeber]", Link-Text spezifisch: „Mehr zur Gartenpflege" etc.
- **Fix aus Audit 1.3:** NIE „Mehr erfahren" mehrfach identisch verwenden (WCAG 2.4.4)

### 5. So arbeiten wir (Prozess-Transparenz)
4 Schritte horizontal (mobil vertikal gestapelt): Anfrage → Vor-Ort-Termin & Festpreis → Ausführung → Kurze Nachkontrolle/Rückmeldung.

### 6. Referenzen (Vorher/Nachher + Testimonials)
- Vorher/Nachher-Slider (Code-Bibliotheken: Website-Playbook Abschnitt 7.4) mit echten Baustellenfotos, mindestens 3 Beispiele
- **Ergänzung:** zusätzlich ein kurzes (10–30 Sek.) echtes Arbeitsvideo (z. B. Rasenmähen, Kehren, Fensterputzen) einbetten, sobald vorhanden. Vorbild: Tairovic Gebäudeservice (Neuwied, siehe Wettbewerbsanalyse Kleine Gebäudereiniger), die über 10 solcher Kurzvideos einsetzen – laut Analyse der überzeugendste Trust-Baustein im gesamten Vergleich kleiner Anbieter. Technisch: einfaches HTML5 `<video>` oder eingebettetes YouTube/Vimeo
- 4+ Testimonials mit Namen/Initialen + Datum
- Google-Bewertungen-Widget/Sterne einbinden, sobald Google Business Profile genug Bewertungen hat

### 7. Warum Braun Hausmeisterservice
- Brüder-Narrativ ausformulieren: kurzer Text + Foto von Eric und Dennis
- 3–4 Werte-Kacheln, darunter explizit als eigene Kachel: „Kein Callcenter" (nicht nur implizit über die Vertrauens-Leiste, sondern als eigenständiger Wertepfeiler ausformuliert), sowie z. B. Partnerschaftlich, Zuverlässig, Persönlich

### 8. FAQ
5–8 Fragen zu typischen Einwänden (Kosten, Vertragsbindung, Einzugsgebiet, Reaktionszeit, Versicherung). Als Akkordeon mit FAQ-Schema-Markup.

### 9. Karriere-Teaser (klein, NICHT gleichwertig zum Kunden-CTA)
Bewusste Abweichung vom Konzern-Muster: schmale Zeile „Wir suchen Verstärkung – Reinigung, Garten, Hausmeisterei" mit Link zur Karriereseite.

### 10. Kontakt/CTA-Block (Seitenende)
- Formular: Name, Telefon (Pflicht), E-Mail (optional), Dienstleistung (Dropdown), PLZ/Ort, Nachricht
- **Fix aus Audit 2.1:** Direkt am Absenden-Button „Antwort innerhalb von 24h" wiederholen
- **Fix aus Audit 2.2:** Liste/Karte der bedienten PLZ-Bereiche neben dem Formular
- Telefonnummer(n) beschriftet

### 11. Footer
Impressum, Datenschutz, Kontaktdaten, Social-Media-Links. Keine Änderung nötig.

## 4a. Preismodell – Diskussionspunkt, kein Pflicht-Feature
Die Zwei Brüder (Bergisch Gladbach/Köln, siehe Wettbewerbsanalyse Kleine Gebäudereiniger) bieten statt Einzelangeboten transparente, gestaffelte Pakete an (Paket L/XL/XXL, ca. 49–119 €/Monat), direkt auf der Website einsehbar, ohne vorherige Angebotsanfrage. Das ist bei keinem der Top-10-Konzerne zu finden, aber bei überschaubarer Leistungstiefe wie bei euch technisch und strategisch machbar und könnte die Anfrage-Hemmschwelle zusätzlich senken (besonders für Hausverwaltungen/WEGs mit wiederkehrendem Bedarf).

**Das ist ausdrücklich KEINE Bauanweisung für den Coding-Agenten.** Ob ein Paketpreis-Modell eingeführt wird, ist eine strategische Entscheidung, die zuerst zwischen Eric und Dennis geklärt werden muss (Preisgestaltung, Kalkulation, ob das zur eigenen Auftragsstruktur passt). Bis zu dieser Klärung bleibt die Startseite ohne sichtbare Preise, wie bisher geplant.

## Meta-Daten dieser Seite (SEO)
- **Title:** „Hausmeisterservice Bendorf – Braun Hausmeisterservice"
- **Meta Description (eigenständig, nicht wie bisher mit Unterseiten identisch – Audit 1.1):** z. B. „Hausmeisterservice in Bendorf und Umgebung: Gartenpflege, Reinigung, Winterdienst und mehr – persönlich, zuverlässig, zum Festpreis. Jetzt unverbindlich anfragen."
- Genau ein H1, siehe Hero

## Interaktion & States

| Element | Zustand | Verhalten |
|---|---|---|
| CTA-Button „Angebot anfordern" | Hover | Hintergrund `color-accent` 10% dunkler, keine Formveränderung |
| CTA-Button | Klick (mobil) | Sofortiges Feedback (Scale-Down 0.97), kein Delay |
| Kontaktformular | Absenden erfolgreich | Redirect auf `/danke/` |
| Kontaktformular | Validierungsfehler | Rote Umrandung + Fehlertext unter dem Feld, kein Alert-Popup |
| Bento-Kachel | Hover (Desktop) | `translateY(-4px)` + `shadow-card` verstärken, 200ms ease-out |
| Vorher/Nachher-Slider | Interaktion | Ziehbarer Handle, touch-fähig |
| Arbeitsvideo (falls vorhanden) | Standard | Kein Autoplay mit Ton; Klick-zum-Abspielen oder stummes Autoplay mit sichtbarem Mute-Icon |
| Scroll-Reveal (Sections 3–8) | Beim Eintritt in Viewport | Fade + Slide-up (16px), Intersection Observer, kein GSAP nötig |

## Responsive Verhalten

| Breakpoint | Änderungen |
|---|---|
| Desktop (>1024px) | Bento-Grid 4 Spalten, Prozess-Schritte horizontal |
| Tablet (768–1024px) | Bento-Grid 2 Spalten |
| Mobil (<768px) | Bento-Grid 1 Spalte, Hamburger-Menü, Prozess-Schritte vertikal, Click-to-Call-Button fixiert unten |

## Edge Cases
- **Noch keine Google-Bewertungen:** Sterne-Widget ausblenden, Testimonial-Zitate priorisieren
- **Noch keine Vorher/Nachher-Fotos für eine Leistung:** Kachel zeigt neutrales Icon, kein Stockfoto als Lückenfüller
- **Noch kein Arbeitsvideo vorhanden:** Abschnitt 6 läuft ohne Video, ausschließlich mit dem Vorher/Nachher-Slider – kein Stock-/Platzhaltervideo einbauen
- **Sehr lange Ortsnamen/PLZ-Liste:** Auf 2 Zeilen umbrechen, nicht abschneiden
- **Formular ohne JavaScript:** Server-seitiges Fallback muss funktionieren

## Barrierefreiheit
- Alle Bilder mit beschreibendem Alt-Text
- Kein Linktext mehrfach identisch ohne Kontext (WCAG 2.4.4)
- Formularfelder mit sichtbaren `<label>`-Elementen
- Farbkontrast Text/Hintergrund mindestens 4.5:1
- Fokus-Reihenfolge: Header-Nav → Hero-CTA → Sections in Lesereihenfolge → Footer
- Video mit gesprochenem Inhalt: Untertitel/Transkript vorsehen

## Was NICHT umgesetzt werden soll (Guardrails)
- Kein 3D/WebGL-Hero (Three.js/Spline)
- Keine serverseitige KI-Personalisierung
- Keine Neon-/Multicolor-Paletten
- Kein GSAP/Lenis, solange Core Web Vitals nicht geprüft sind
- Kein zweites/drittes paralleles Rabatt-Angebot neben dem Haupt-CTA
- Kein Paketpreis-Modell ohne vorherige interne Freigabe (siehe Abschnitt 4a)

## Definition of Done
- [ ] Meta-Description ist einzigartig, nicht identisch mit `/hausmeisterservice/` oder anderen Unterseiten
- [ ] Kein Linktext "Mehr erfahren" ohne Kontext mehr vorhanden
- [ ] Mindestens 3 echte Arbeitsfotos zusätzlich zum Teamfoto eingebunden
- [ ] „Kein Callcenter" ist sowohl in der Vertrauens-Leiste als auch im Abschnitt „Warum Braun Hausmeisterservice" sichtbar
- [ ] Antwortzeit-Versprechen steht am Kontaktformular
- [ ] Einzugsgebiet auf der Seite erkennbar
- [ ] Genau ein Hauptangebot/CTA, keine konkurrierenden Rabatt-Mechaniken
- [ ] Telefonnummern sind beschriftet, falls mehrere angezeigt werden
- [ ] Falls Paketpreis-Modell diskutiert wurde: Entscheidung von Eric und Dennis dokumentiert, bevor umgesetzt
