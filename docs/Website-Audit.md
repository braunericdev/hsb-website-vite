---
title: "Website-Audit: hausmeisterservice-braun.de"
subtitle: "Zur Übergabe an einen Coding-Agent"
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

Jeder Befund mit Beleg (was konkret beobachtet wurde), Begründung (warum das ein Problem ist – Standard/Prinzip/Datenquelle, nicht Geschmack) und Konfidenz-Label, damit intern (Eric/Dennis) klar ist, welche Punkte hart belegt sind und welche Experten-Einschätzung/Diskussionsbasis sind.

**Konfidenz-Label:**

- **[FAKT]** – direkt auf der Seite verifizierbar (Quelltext/Struktur), kein Interpretationsspielraum
- **[STANDARD]** – verstößt gegen einen dokumentierten Standard (WCAG, Google Search-Central-Richtlinien, etablierte CRO-Prinzipien)
- **[EINSCHÄTZUNG]** – begründete fachliche Bewertung, aber diskutierbar; hier transparent als solche gekennzeichnet

**Hinweis zur Methodik:** Analyse erfolgte per automatisiertem Seitenabruf (Struktur, Text, Meta-Daten, Navigation). PageSpeed/Core-Web-Vitals-Messung war aus dieser Umgebung technisch nicht möglich (Netzwerk-Restriktion) – das ist NICHT geprüft und muss manuell nachgeholt werden (pagespeed.web.dev). Alles unten Genannte ist aus dem tatsächlichen Seiteninhalt, nicht erfunden.

## 1. SEO-technisch (härteste Kategorie)

### 1.1 Identische Meta-Description auf mind. 3 Seiten [FAKT]
**Befund:** Startseite, `/hausmeisterservice/` und `/reinigung/` haben wortgleich dieselbe Meta-Description: *"Professioneller Hausmeisterservice für Haus & Garten. Wir kümmern uns um Gartenpflege, Reinigung und Instandhaltung. Zuverlässig & kompetent!"* Vermutlich ein nie angepasster Default-Text des Seitenbaukastens.

**Warum relevant [STANDARD]:** Google Search Central rät explizit zu einzigartigen Meta-Descriptions pro Seite – bei Duplikaten entscheidet Google oft selbst, welchen Text es in den Suchergebnissen anzeigt, was die Klickrate senkt. Direkt nachprüfbar: Seitenquelltext von zwei beliebigen der drei URLs vergleichen.

**Empfehlung:** Für jede der 9 Content-Seiten eine eigene, leistungsspezifische Meta-Description (140–160 Zeichen) schreiben.

**Priorität:** Hoch, aber trivialer Aufwand (reiner Text-Fix, kein Redesign).

### 1.2 Startseite und /hausmeisterservice/ konkurrieren um dieselbe Suchintention [EINSCHÄTZUNG, gut belegt]
**Befund:** Beide Seiten haben nahezu identische Meta-Description, die Startseite hat H2 "Hausmeisterservice als Gesamtlösung", die Unterseite behandelt denselben Themenkern nochmal auf ca. 1.200 Wörtern.

**Warum relevant:** Klassisches Keyword-Kannibalisierungsrisiko – zwei eigene URLs, die für dasselbe Hauptkeyword ranken wollen, schwächen sich gegenseitig statt sich zu ergänzen.

**Empfehlung:** Klare Aufgabenteilung: Startseite = Überblick + Einstieg in alle Leistungen; `/hausmeisterservice/` entweder auf einen spezifischeren Unter-Aspekt umschreiben (z. B. Zielgruppen-Landingpage für Hausverwaltungen/WEGs) oder zusammenlegen/redirecten.

**Priorität:** Mittel – erst nach 1.1 angehen.

### 1.3 Sieben identische Link-Texte "Mehr erfahren" [FAKT + STANDARD]
**Befund:** Auf der Startseite verlinken 7 verschiedene CTAs mit demselben Text "Mehr erfahren" auf 7 verschiedene Leistungsseiten.

**Warum relevant [STANDARD]:** WCAG 2.1 Erfolgskriterium 2.4.4 (Link Purpose in Context) verlangt erkennbare Linkziele – Screen-Reader-Nutzer bekommen Links oft isoliert als Liste vorgelesen, identische Texte sind für sie nicht unterscheidbar. Zusätzlich nutzt Google Ankertext als Rankingsignal für die Zielseite – 7× derselbe generische Text verschenkt dieses Signal komplett.

**Empfehlung:** Jeden Button leistungsspezifisch beschriften: "Mehr zur Gartenpflege", "Mehr zum Winterdienst" usw.

**Priorität:** Hoch, trivialer Aufwand.

### 1.4 Nur ein Bild auf der gesamten Startseite [FAKT]
**Befund:** Die Startseite enthält genau ein Bild (Team-Foto). Die einzelnen Leistungsseiten haben je 2 Bilder.

**Warum relevant:** Bild-Alt-Texte sind ein SEO-Rankingfaktor; wichtiger noch: laut eigener Wettbewerbsanalyse ist Bildmaterial von echter Arbeit der am stärksten wiederkehrende Trust-Baustein bei allen analysierten Wettbewerbern – hier praktisch nicht vorhanden.

**Empfehlung:** Siehe Abschnitt 3.1 (Bildmaterial).

**Priorität:** Hoch.

## 2. Conversion / Formular-Logik

### 2.1 Inkonsistentes Antwortzeit-Versprechen zwischen Bewerber- und Kunden-Formular [FAKT, Argument-Logik EINSCHÄTZUNG]
**Befund:** Die Karriere-Seite verspricht Bewerbern explizit "Antwort innerhalb von 24 Stunden". Das Kontaktformular für zahlende Kunden macht KEIN vergleichbares Versprechen.

**Warum relevant:** Wenn eine Reaktionszeit-Zusage für Bewerber möglich ist, ist sie es auch für Kunden – und Reaktionszeit senkt die wahrgenommene Unsicherheit vor dem Absenden eines Formulars. "Wir können es Bewerbern versprechen, aber nicht Kunden" ist intern schwer zu rechtfertigen.

**Empfehlung:** Gleiches oder ähnliches Versprechen ("Rückmeldung innerhalb von 24h") auch am Kontaktformular ergänzen.

**Priorität:** Hoch, kein Entwicklungsaufwand, nur Text + Prozess-Commitment.

### 2.2 Kein Einzugsgebiet/Karte auf der Kontaktseite [FAKT]
**Befund:** Die Kontaktseite hat kein Kartenmaterial und keine explizite Nennung des Einzugsgebiets.

**Warum relevant:** Bereits im Website-Playbook als Pflichtelement für lokale Dienstleister-Landingpages dokumentiert ("lokales Einsatzgebiet erkennbar machen"). Ein Interessent, der nicht sofort sieht "arbeitet ihr auch in meinem Ort", bricht eher ab.

**Empfehlung:** Kurze Liste/Karte der bedienten Orte/PLZ-Bereiche auf der Kontaktseite ergänzen.

**Priorität:** Mittel.

### 2.3 Drei konkurrierende Angebots-Mechaniken gleichzeitig [EINSCHÄTZUNG]
**Befund:** Auf `/hausmeisterservice/` laufen parallel: "Kostenloses Angebot anfragen", "Bonus jetzt sichern" und (auf der Gebäudereinigungs-Seite) "10% Rabatt auf die Testphase" / "Testphase starten".

**Warum relevant:** Ein bekanntes CRO-Grundprinzip (Attention Ratio: möglichst ein Hauptangebot pro Seite) besagt, dass mehrere gleichzeitige Angebote eher verwirren als überzeugen. Zusätzlich wirkt eine Rabatt-/Testphasen-Mechanik (bekannt von SaaS-Abos) auf eine Hausverwaltung, die eine Vertrauensentscheidung für die Objektbetreuung trifft, potenziell eher unpassend – das ist Experten-Einschätzung, aber durch den Abgleich mit der Wettbewerbsanalyse gestützt (keiner der 9 großen Anbieter arbeitet mit Rabatt-Mechaniken auf der Startseite).

**Empfehlung:** Auf EIN klares Hauptangebot konsolidieren ("Kostenloses, unverbindliches Angebot"), Rabatt-Mechanik optional nur auf einer spezifischen Google-Ads-Landingpage testen.

**Priorität:** Mittel – Diskussionspunkt, nicht einfach umsetzen.

### 2.4 Zwei Telefonnummern ohne erkennbare Zuordnung [FAKT]
**Befund:** Auf der Seite stehen zwei Mobilnummern ohne Kennzeichnung, wer/wofür erreichbar ist.

**Warum relevant:** Nutzer, die anrufen wollen, müssen raten, welche Nummer die richtige ist – unnötige Reibung kurz vor der Kontaktaufnahme.

**Empfehlung:** Beschriften: z. B. "Eric Braun (Büro/Anfragen)" / "Dennis Braun (vor Ort)", oder eine zentrale Hotline führen.

**Priorität:** Niedrig, trivialer Aufwand.

## 3. Content / Bildmaterial

### 3.1 Kein Arbeits-Bildmaterial (Vorher/Nachher, Baustellenfotos) [FAKT]
**Befund:** Die einzigen Bilder sind ein Team-/Portraitfoto und ein generisches "Gartenpflege Referenz"-Bild. Kein einziges Vorher/Nachher-Bild, keine Fotos abgeschlossener Aufträge.

**Warum relevant:** Direkt aus der Wettbewerbsanalyse: Bildbeweis der eigenen Arbeit ist bei einer Dienstleistung, die man vorab nicht "testen" kann, der wirksamste Vertrauenshebel.

**Empfehlung:** Bei den nächsten 5–10 Aufträgen aktiv Vorher/Nachher-Fotos machen (Handy reicht) und sukzessive auf den jeweiligen Leistungsseiten einbauen.

**Priorität:** Hoch in der Wirkung, aber abhängig von Foto-Beschaffung (keine reine Coding-Aufgabe).

### 3.2 Karriere-Seite: Tonalität passt nicht zur Zielgruppe der Anzeigen [EINSCHÄTZUNG]
**Befund:** Die ausgeschriebenen Stellen sind Minijob/Teilzeit Reinigungskraft, Hausmeister-Allrounder, Gartenpflege-Mitarbeiter. Die Ansprache lautet: "Jung und modern", "kreative Freiheit", "Trust-based management ohne Micromanagement", "Work-Life-Balance".

**Warum relevant:** Das ist die Werte-Sprache für Wissensarbeiter/Tech-Talent. Bewerber auf Minijob/Teilzeit-Stellen in Reinigung/Garten/Hausmeisterei entscheiden erfahrungsgemäß eher nach: verlässliche, pünktliche Bezahlung, klare planbare Arbeitszeiten, Nähe zum Wohnort, unkomplizierter Einstieg. Das ist eine fachliche Einschätzung (Message-Market-Fit), kein Naturgesetz.

**Empfehlung:** Copy Richtung: klare Stundenlöhne/Spannen, planbare Schichten, Nähe zum Wohnort, schnelle unkomplizierte Einstellung, digitale Zeiterfassung als "kein Papierkram" statt "modern" verkaufen.

**Priorität:** Mittel – Diskussionspunkt, kein reiner Bug-Fix.

## 4. Was bereits gut funktioniert (nicht anfassen)
- Telefonnummer als Pflichtfeld, E-Mail optional im Kontaktformular – passt zur Realität, dass die meisten Anfragen im Handwerk telefonisch laufen
- Datenschutz-Checkbox direkt am Formular vorhanden – rechtlich sauber gelöst
- "Festpreis" wird als Begriff auf der Außenreinigungs-Seite bereits verwendet – deckt sich mit der Empfehlung aus dem Website-Playbook
- Eigene URL/Seite pro Einzelleistung ist bereits vorhanden (6 Leistungsseiten) – die empfohlene Grundstruktur existiert schon
- Vier echte Kundenstimmen mit Initialen/Datum auf der Gebäudereinigungs-Seite vorhanden

## 5. Nicht geprüft (ehrlich offen, nicht geraten)
- Core Web Vitals / Ladezeit (LCP, CLS, INP) – technisch aus dieser Umgebung nicht messbar, bitte manuell via pagespeed.web.dev prüfen
- Tatsächliche Farbgebung/visuelle Gestaltung/Typografie – Analyse basiert auf Text-/Strukturabruf, nicht auf visuellem Screenshot
- Mobile Darstellung konkret (Responsive-Verhalten) – nicht visuell geprüft

## Priorisierte Reihenfolge für den Coding-Agent
1. Meta-Descriptions vereinheitlichen/individualisieren (1.1) – reiner Text-Fix
2. "Mehr erfahren"-Links spezifisch beschriften (1.3) – reiner Text-Fix
3. Antwortzeit-Versprechen im Kontaktformular ergänzen (2.1) – Text + Commitment
4. Einzugsgebiet/Karte auf Kontaktseite (2.2)
5. Telefonnummern beschriften (2.4)
6. Hausmeisterservice-Seite vs. Startseite neu zuschneiden (1.2) – braucht vorher eure Entscheidung zur Content-Strategie
7. Bildmaterial-Aufbau (3.1) – laufender Prozess, kein einmaliger Task
8. Karriere-Copy überarbeiten (3.2) – Diskussion mit Dennis, da Zielgruppen-Frage
9. Angebots-Mechanik konsolidieren (2.3) – Diskussion, da Marketing-Strategie-Entscheidung

Siehe auch: **Website-Playbook (Design, SEO, Google Ads)** und **Wettbewerbsanalyse Top 10 Gebäudereiniger** im selben Projekt.
