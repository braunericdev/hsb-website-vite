// Reine Logik-Funktionen für die Navigations-Intelligenz (main.js).
// Bewusst ohne DOM-Zugriff, damit sie ohne Browser/JSDOM unit-testbar sind.

export const DIENSTLEISTUNG_MAPPING = {
    heckenschnitt: 'heckenschnitt',
    rasenmaehen: 'rasenmaehen',
    gebaeudereinigung: 'gebaeudereinigung',
    bodenverlegen: 'bodenverlegen',
    entruempelung: 'entruempelung',
    winterdienst: 'winterdienst',
    reinigung: 'reinigung',
    gartengrundstueckspflege: 'gartengrundstueckspflege',
    gestaltung: 'gestaltung',
    montageservice: 'montageservice',
    hausmeisterservice: 'hausmeisterservice',
};

// Entfernt Slash am Ende, "/index.html" und normalisiert Umlaute für sichere Vergleiche.
export const normalizePath = (path) => {
    const cleanPath = path.replace(/\/$/, '').replace('/index.html', '') || '/';
    return cleanPath.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue');
};

// Normalisiert einen Link-Href relativ (../-Präfixe auflösen) genauso wie normalizePath.
export const normalizeHref = (href) => {
    const cleanHref = href.replace(/\.\.\//g, '/').replace(/\/$/, '').replace('/index.html', '') || '/';
    return cleanHref.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue');
};

// Ermittelt anhand des (unnormalisierten) Pfads die passende Dienstleistung für den Kontakt-Link.
export const getDienstleistungFromPath = (cleanPath, mapping = DIENSTLEISTUNG_MAPPING) => {
    for (const [key, value] of Object.entries(mapping)) {
        if (cleanPath.includes(key)) return value;
    }
    return null;
};
