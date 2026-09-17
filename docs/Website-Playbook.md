---
title: "Website-Playbook: Professioneller Webauftritt für Dienstleister"
subtitle: "Referenz für Hausmeisterservice Braun GbR (www.hausmeisterservice-braun.de)"
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

## 0. Audit aktueller Stand (automatisierter Abruf, keine visuelle/PageSpeed-Prüfung)
- Struktur: Home, Leistungen (Außen-/Innenbereich), Karriere
- Vorhanden: 4 Kundenstimmen, mehrere CTAs ("Kostenlos anfragen"/"Anfrage senden"), 3 Telefonnummern, Standort Bendorf, Teamfoto
- Impressum: Namen beider Gesellschafter (Eric + Dennis Braun), Adresse, E-Mail, Telefon, Datenschutz-Link vorhanden → rechtlich im Kern okay. USt-ID/Handelsregister fehlt (nur Pflicht, falls vorhanden/eingetragen)
- Fehlt: Zertifikate/Versicherungsnachweise, ausführliches "Über uns", Preisrahmen, Content-Tiefe pro Einzelleistung
- Offen: Core Web Vitals / Ladezeit nicht geprüft → PageSpeed Insights Test nachholen

## 1. Design & Struktur (Konversion vor Ästhetik)
Pflichtabschnitte:

- Hero mit Value Proposition + Ort ("Hausmeisterservice Bendorf/Region")
- Problem/Lösung statt reiner Leistungsaufzählung
- Trust-Block direkt sichtbar (Bewertungen, Jahre am Markt, Team)
- 3–5 Kernleistungen mit Nutzen statt Stichwortliste
- Referenzen/Vorher-Nachher mit echten Fotos (keine Stockfotos)
- FAQ (typische Einwände vorwegnehmen)
- CTA-Ebenen: Telefon (mobil dauerhaft sichtbar), Kontaktformular (nur Name/Telefon/Kurzbeschreibung), optional Terminbuchung

Mobile/Performance (nicht verhandelbar):

- Click-to-Call-Button dauerhaft sichtbar
- Responsive, Single-Column mobil
- Ladezeit: FCP < 3s (siehe Core Web Vitals Ziel unten)
- SSL sichtbar

## 2. Vertrauenssignale (7 Hebel)
1. Google-Bewertungen/Sterne sichtbar einbinden
2. Gütesiegel/Zertifikate (Versicherung, Verbandsmitgliedschaft)
3. Testimonials mit echtem Namen/Foto
4. Referenzlogos (Hausverwaltungen/WEGs, falls Freigabe)
5. Team-Transparenz (Fotos, kurze Vorstellung)
6. Mehrfache, klare Kontaktmöglichkeiten
7. Transparente Leistungsbeschreibung, Preisrahmen statt Blackbox

## 3. Technische Basis / Plattform-Wahl
- WordPress + Page Builder (Elementor/Bricks): günstig, viele Plugins, aber laufender Wartungsaufwand (Updates/Sicherheit)
- Webflow: sauberes Design, kein Plugin-Wildwuchs, teurer im Abo, weniger Backend-Flexibilität
- Baukasten (Wix/Jimdo/IONOS): einfachste Bedienung, aber SEO-/Skalierungsgrenzen
- Custom-Code (z. B. eigener Vue/Supabase-Stack): volle Kontrolle, aber Zeitaufwand – nur sinnvoll wenn Website strategisch wichtig genug ist

Unabhängig von Plattform Pflicht:

- HTTPS, saubere robots.txt, XML-Sitemap
- Schema.org: Organization, LocalBusiness, BreadcrumbList
- Core Web Vitals: LCP < 2,5s, INP < 200ms, CLS < 0,1

## 4. Rechtliches (GbR-spezifisch, §5 DDG)
Impressum-Pflichtangaben:

- Namen aller Gesellschafter mit vollständiger Anschrift
- E-Mail + ein zweiter schneller Kontaktweg
- USt-ID/Handelsregister, falls vorhanden
- Verlinkung Impressum + Datenschutz im Footer auf jeder Seite
- Hinweis zur Verbraucherstreitbeilegung (§36 VSBG)

Datenschutzerklärung muss abdecken: Server-Logs, Kontaktformular, ggf. Newsletter/Cookies mit Rechtsgrundlage, Nutzerrechte (Art. 15–21 DSGVO), zuständige Aufsichtsbehörde.

Cookie-Banner: nur nötig bei nicht-essenziellen Cookies/Tracking (z. B. GA4, Google Ads Remarketing) – dann Einwilligung vor Setzen der Cookies.

## 5. SEO-Checkliste (priorisiert)
**Technisch:** HTTPS überall, Mobile First, Core Web Vitals grün, saubere URLs, XML-Sitemap, robots.txt, Schema.org, Canonical Tags

**On-Page:** Title mit Hauptkeyword vorne (<60 Zeichen), Meta Description (140–160 Zeichen), ein H1/Seite, logische H2/H3, Bilder als WebP/AVIF <200KB, interne Verlinkung (3–5/Seite)

**Content:** eigene Leistungsseite pro Service (Büroreinigung, Gartenpflege, Winterdienst etc.) statt Sammelseite, 1.500–3.000 Wörter bei wichtigen Seiten, FAQ mit Schema-Markup

**Local SEO** (zentral fürs Geschäftsmodell):

- Google Business Profile vollständig pflegen: alle Leistungskategorien, Fotos, Öffnungszeiten
- Aktives Bewertungsmanagement (nach Auftragsabschluss gezielt um Bewertung bitten)
- Local Citations: IHK/HWK-Verzeichnis, ProvenExpert, Branchenportale
- Keyword-Formel: [Leistung] + [Ort] – z. B. "Hausmeisterservice Bendorf", "Büroreinigung [Region]"

**Off-Page:** Backlinks von regionalen/branchenrelevanten Seiten, lokale Presse (Meilensteine, Neueröffnung)

## 6. Google Ads
- Kampagnenstruktur: getrennte Kampagnen/Anzeigengruppen pro Leistungsart
- Keyword-Formel: [Leistung] + [Ort] + [Intent]; Start nur mit Leistung+Ort- und Angebots-Keywords, keine Info-Keywords
- Negative Keywords: "selbst machen", "Anleitung", "Ausbildung", "Jobs", "kostenlos", Orte außerhalb Einzugsgebiet
- Budget: mind. ~500€/Monat für auswertbare Daten; ca. 150 Klicks/Monat bei 5–15% Conversion Rate realistisch
- Landingpage-Pflicht (nicht die Homepage verlinken): eigene Landingpage pro Leistung mit klickbarer Telefonnummer, Einzugsgebiet, Bewertungen, Preisrahmen, Minimal-Formular
- Targeting: "Presence Only" statt "Presence or Interest" (reduziert Streuverlust 20–40%), Radius 20–30km je nach Leistung, Anzeigenzeiten auf Geschäftszeiten begrenzen
- Tracking: Google Ads Call-Tracking + Website-Call-Tracking (z. B. matelso, CallTrackingMetrics) – 60–70% der Leads im Handwerk laufen übers Telefon, nicht übers Formular

## 7. Moderne Design-Elemente & Effekte 2026 (mit Code)
Kritischer Filter zuerst: die meisten "2026 Trend"-Listen sind für Portfolios/Tech-Startups geschrieben, nicht für einen lokalen Handwerksbetrieb. Trust und Ladezeit schlagen Coolness. Unten steht was jeweils gilt.

### 7.1 Trend-Katalog mit Einordnung für euch
- Bento-Grid-Layouts → **passt**: gut für Leistungsübersicht statt langweiliger Liste
- Vorher/Nachher-Vergleich (Slider) → **passt am meisten**: einziger Effekt mit direktem Verkaufsargument
- Dezentes Glassmorphism (`backdrop-filter: blur()`) → **passt, sparsam**: z. B. Sticky-Header, Formular-Card
- Leichte Scroll-Reveal-Animationen → **passt**: wirkt modern, kostet kaum Performance
- Dark Mode als Option → **optional**: netter Zusatz, kein Muss
- Kinetic Typography / variable Fonts → **Vorsicht**: sparsam einsetzen, sonst wirkt es verspielt statt seriös
- 3D/WebGL-Hero (Three.js, Spline) → **nicht sinnvoll**: hoher Aufwand, schlecht für Mobile-Ladezeit
- KI-Personalisierung serverseitig → **nicht sinnvoll**: Overkill für Kleinunternehmen
- Auffällige Neon-/Bold-Paletten → **nicht sinnvoll**: passt nicht zur Seriositäts-Positionierung

### 7.2 Farbe – Empfehlung statt Trend-Liste
Aktuelle Trends: Dark Mode, kräftiges Blau, Pastell, Schwarz/Weiß-Minimalismus, kräftiges Rot, Grün (Nachhaltigkeit), Erdtöne, Neon, bunte Paletten, Verläufe/entsättigte Farben.

Für euch passend: **Grün oder Blau als Markenfarbe (Vertrauen, Sauberkeit/Natur) + neutrales Grau/Weiß + ein Akzentton für CTA-Buttons.** Keine Neon-/Multicolor-Palette.

### 7.3 Bento-Grid – Code
```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  grid-auto-rows: minmax(140px, auto);
}
.bento-hero { grid-column: span 2; grid-row: span 2; }

@media (max-width: 768px) {
  .bento-grid { grid-template-columns: 1fr; }
  .bento-hero { grid-column: span 1; grid-row: span 1; }
}
```
Einsatz: Leistungsübersicht (Gartenpflege groß, Winterdienst/Büroreinigung/Entrümpelung kleiner).

### 7.4 Vorher/Nachher-Slider
Fertige, leichtgewichtige Optionen (kein großes Framework nötig):

- before-after.js (vanilla JS, GitHub jotform): `https://github.com/jotform/before-after.js/`
- image-comparison-slider (Paul-Browne, pure JS): `https://github.com/Paul-Browne/image-comparison-slider`
- Touch-friendly Vanilla-JS-Variante (CSS Script): `https://www.cssscript.com/touch-image-comparison-before-after/`

Auf jeder Leistungsseite mit eigenen Baustellenfotos einsetzen (keine Stockfotos).

### 7.5 Scroll-Animationen – Entscheidungsregel
- **Einfaches Einblenden** → Intersection Observer + CSS-Transition. Praktisch kostenlos, reicht für 90% der Fälle.
- **Reines CSS ohne JS** (`animation-timeline: view()`) → Browser-Unterstützung 2026 noch nicht vollständig, nur als Progressive Enhancement.
- **Komplexe/gestaffelte Sequenzen, Pinning, Parallax** → erst dann GSAP + ScrollTrigger (~50KB gzip) rechtfertigen sich.
- **Sanftes Scrollgefühl (Lenis)** nur kombinieren, wenn GSAP ohnehin im Einsatz ist.

GSAP + Lenis Setup (nur falls Punkt 3 zutrifft):
```js
// npm install lenis gsap
import Lenis from 'lenis'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

const lenis = new Lenis({
  duration: 1.2,
  smoothWheel: window.innerWidth > 768,
})
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)
```
In Vue: Initialisierung in `onMounted()`, `lenis.destroy()` in `onUnmounted()`. Interne Anchor-Links über `lenis.scrollTo(target)` führen.

### 7.6 Glassmorphism – Code (sparsam einsetzen)
```css
.card-glass {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
```
Einsatz: Sticky-Header, Kontaktformular-Card über einem Hintergrundbild.

### 7.7 Priorität für die Umsetzung
1. Vorher/Nachher-Slider mit echten Baustellenfotos
2. Bento-Grid für Leistungsübersicht statt Liste
3. Intersection-Observer-Scroll-Reveal für Sections
4. Dezentes Glassmorphism an 1–2 Stellen
5. GSAP/Lenis nur wenn 1–4 stehen UND Core Web Vitals das erlauben

## 8. Priorisierte Gesamt-Roadmap
1. Google Business Profile vollständig optimieren (kostenlos, höchster Hebel fürs lokale Geschäft)
2. Trust-Elemente ergänzen (Zertifikate, mehr/aktuelle Bewertungen, Team-Seite, Preisrahmen)
3. Eigene Leistungsseiten mit lokalem SEO statt Sammelseite
4. Vorher/Nachher-Slider + Bento-Grid einbauen
5. Core Web Vitals / technische Basis prüfen (PageSpeed Insights Test)
6. Erst danach: Google Ads (setzt saubere Landingpages voraus)

## Quellen
- Webdesign Leitfaden für Handwerker in 2026 (blumango): `https://blumango.agency/blog/webdesign-leitfaden-fuer-handwerker/`
- Webdesign für Handwerker (Weboa): `https://weboa.de/webdesign-handwerker/`
- Local SEO für Reinigungsfirmen (Seomaxx): `https://www.seomaxx.com/local-seo/reinigung-hausmeister/`
- Gewerblicher Reinigungsservice SEO (Ranktracker): `https://www.ranktracker.com/de/blog/commercial-cleaning-service-seo/`
- Google Business Profile for Cleaners: 2026 Playbook (CleanerHQ): `https://cleanerhq.com/how-to-use-google-my-business-to-get-more-local-cleaning-clients/`
- Google Ads für Handwerker 2026 (Ostend Digital): `https://ostend.digital/google-ads-handwerker/`
- Google Ads für B2B-Reinigungsfirmen (United Ads): `https://unitedads.de/blog/google-ads-fuer-b2b-reinigungsfirmen/`
- Impressum Pflichtangaben 2026 (KI WebSichtbar): `https://ki-websichtbar.de/blog/impressum-pflichtangaben/`
- Datenschutzerklärung 2026: Pflichtangaben (next-levels.de): `https://next-levels.de/blog/datenschutzerklarung-fur-websites-and-shops-was-2026-wirklich-reinmuss`
- Cookie-Banner-Pflicht 2026 (BuntDigital): `https://buntdigital.de/blog/cookie-banner-dsgvo-selbststaendige.html`
- Trust-Elemente für Websites: 7 Signale (TwoPixels): `https://webagentur-twopixels.de/blog-post.php?slug=trust-elemente-website-conversion-optimierung`
- SEO-Checkliste 2026: 25 Punkte für KMU & lokale Dienstleister (Kunden-Navigator): `https://kunden-navigator.de/blog/seo-checkliste-kmu`
- Core Web Vitals 2026 (Growsta): `https://growsta.de/blog/core-web-vitals/`
- Web Design Trends 2026: 12 Developments + Code Examples (studiomeyer.io): `https://studiomeyer.io/en/blog/webdesign-trends-2026`
- Farbtrends im Webdesign 2026 (Webdesign Journal): `https://www.webdesign-journal.de/farbtrends-im-webdesign/`
- GSAP + Lenis Setup Guide (dev.to/thebitforge): `https://dev.to/thebitforge/your-scroll-animations-look-amateur-heres-the-gsap-lenis-setup-that-fixes-it-48ni`
- Lenis – Smooth Scroll (offizielle Docs): `https://lenis.dev/`
- Bento Grid CSS: Complete Tutorial (dev.to): `https://dev.to/imran_khan_a3cc224344dbcf/bento-grid-css-complete-tutorial-free-examples-2026-2ci`
- Scroll-Based Text Reveal mit reinem CSS (dev.to): `https://dev.to/pawar-shivam7/scroll-based-text-reveal-effect-using-pure-css-no-js-no-motion-library-34oa`
- Intersection Observer vs. GSAP – Entscheidungshilfe (clcreative.co): `https://www.clcreative.co/blog/should-you-use-the-intersection-observer-api-or-gsap-for-scroll-animations`
- before-after.js Vorher/Nachher-Slider (jotform, GitHub): `https://github.com/jotform/before-after.js/`
- image-comparison-slider, vanilla JS (Paul-Browne, GitHub): `https://github.com/Paul-Browne/image-comparison-slider`
