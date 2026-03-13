# Hausmeisterservice Braun – Ultra-Performance Website (Vanilla JS Version)

Dies ist die technologisch am stärksten optimierte Version der Web-Präsenz für den Hausmeisterservice Braun. Die Anwendung wurde bewusst ohne Frameworks (No-Framework / Vanilla JS) entwickelt, um die absolut minimale Bundle-Größe und maximale Ladegeschwindigkeit zu erreichen.

## Projekt-Kontext und Motivation

Nachdem die erste Version auf Basis von Next.js erfolgreich den Betrieb etablierte, wurde diese Neuentwicklung als "Pure-Web"-Ansatz konzipiert. Durch den Verzicht auf React und Next.js wurde jeglicher Framework-Overhead eliminiert. Das Ergebnis ist eine Seite, die nahezu ohne Verzögerung lädt (Time-to-Interactive), was die Conversion-Rate von Google-Ads-Kampagnen auf mobilen Endgeräten optimiert.

## Technischer Stack

* **Build-Tool:** Vite (High-Speed Build & Dev-Server)
* **Frontend:** Vanilla JavaScript (ES6+ Module)
* **Templating:** vite-plugin-html-inject (für modulare, wiederverwendbare HTML-Komponenten ohne Library-Overhead)
* **Styling:** Tailwind CSS v4 (Modernstes Utility-First CSS)
* **Icons:** FontAwesome 7 (via @fortawesome/fontawesome-free)

## Besondere Merkmale

* **Zero Framework Overhead:** Keine Client-seitigen Libraries wie React oder Vue notwendig.
* **Modularer Aufbau:** Trotz Verzicht auf Frameworks wurde eine wartbare Struktur durch HTML-Injection realisiert.
* **Maximale Performance:** Extrem kleine Assets führen zu Bestwerten bei den Google Core Web Vitals.
* **Marketing-Fokus:** Speziell für die Anforderungen von Landingpages im Bereich Performance-Marketing entwickelt.

## Vergleich zur Vorgängerversion

Dieses Repository ist die technologische Antwort auf die ursprüngliche Next.js-Version. Während dort der Fokus auf Framework-Features lag, wurde hier ein radikaler "Performance-First"-Ansatz gewählt. Dies beweist die Fähigkeit, für unterschiedliche Business-Anforderungen (SEO vs. Speed/Conversion) die jeweils passende Architektur zu wählen.