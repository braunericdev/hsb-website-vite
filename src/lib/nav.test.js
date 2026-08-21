import { describe, it, expect } from 'vitest';
import { normalizePath, normalizeHref, getDienstleistungFromPath } from './nav.js';

describe('normalizePath', () => {
    it('lässt einfache Pfade unverändert', () => {
        expect(normalizePath('/kontakt')).toBe('/kontakt');
    });

    it('entfernt einen abschließenden Slash', () => {
        expect(normalizePath('/kontakt/')).toBe('/kontakt');
    });

    it('entfernt ein abschließendes index.html', () => {
        expect(normalizePath('/kontakt/index.html')).toBe('/kontakt');
    });

    it('normalisiert Umlaute (ä/ö/ü)', () => {
        expect(normalizePath('/gartengrundstückspflege')).toBe('/gartengrundstueckspflege');
    });

    it('behandelt die Wurzel als "/"', () => {
        expect(normalizePath('/')).toBe('/');
        expect(normalizePath('')).toBe('/');
    });
});

describe('normalizeHref', () => {
    it('löst relative ../-Präfixe zu absoluten Pfaden auf', () => {
        expect(normalizeHref('../kontakt/')).toBe('/kontakt');
    });

    it('normalisiert Umlaute genauso wie normalizePath', () => {
        expect(normalizeHref('../gartengrundstückspflege/')).toBe('/gartengrundstueckspflege');
    });

    it('behandelt die Wurzel als "/"', () => {
        expect(normalizeHref('../')).toBe('/');
    });
});

describe('getDienstleistungFromPath', () => {
    it('findet die passende Dienstleistung anhand des Pfads', () => {
        expect(getDienstleistungFromPath('/heckenschnitt')).toBe('heckenschnitt');
        expect(getDienstleistungFromPath('/gebaeudereinigung')).toBe('gebaeudereinigung');
    });

    it('gibt null zurück, wenn keine Dienstleistung zum Pfad passt', () => {
        expect(getDienstleistungFromPath('/impressum')).toBeNull();
        expect(getDienstleistungFromPath('/')).toBeNull();
    });

    it('erkennt Dienstleistungen auch als Teilstring des Pfads', () => {
        expect(getDienstleistungFromPath('/hausmeisterservice/')).toBe('hausmeisterservice');
    });
});
