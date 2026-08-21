import { test, expect } from '@playwright/test';

// Deckt genau den Fall ab, den ein grüner Build allein nicht garantiert:
// Seite lädt, zeigt Inhalt (kein Whitescreen) und wirft dabei keine eigenen JS-Fehler.
const PAGES = ['/', '/kontakt/', '/hausmeisterservice/'];

// Drittanbieter (Cookiebot-Consent, Google Ads/Analytics) laden extern und können
// abhängig von Domain-Freigaben/Netzwerk fehlschlagen, ohne dass unsere Seite kaputt ist.
// Ein Smoke-Test soll das eigene Deployment prüfen, keine fremde Infrastruktur.
const isOwnResource = (url) => new URL(url).hostname === 'localhost';

for (const path of PAGES) {
    test(`${path} lädt ohne Whitescreen und ohne eigene Fehler`, async ({ page }) => {
        const failedOwnRequests = [];
        page.on('requestfailed', (req) => {
            if (isOwnResource(req.url())) {
                failedOwnRequests.push(`${req.url()} (${req.failure()?.errorText})`);
            }
        });
        page.on('response', (res) => {
            if (isOwnResource(res.url()) && !res.ok()) {
                failedOwnRequests.push(`${res.url()} → ${res.status()}`);
            }
        });
        const pageErrors = [];
        page.on('pageerror', (err) => pageErrors.push(err.message));

        const response = await page.goto(path);
        expect(response.ok()).toBeTruthy();
        await expect(page).not.toHaveTitle('');

        // Kernstruktur muss vorhanden, sichtbar und nicht leer sein, nicht nur "irgendein DOM".
        await expect(page.locator('header nav')).toBeVisible();
        const h1 = page.locator('h1').first();
        await expect(h1).toBeVisible();
        await expect(h1).not.toHaveText('');

        expect(failedOwnRequests, `Fehlgeschlagene eigene Ressourcen auf ${path}`).toEqual([]);
        expect(pageErrors, `JS-Fehler auf ${path}: ${pageErrors.join(', ')}`).toEqual([]);
    });
}

test('mobiles Menü öffnet sich auf der Startseite', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const openBtn = page.locator('#menu-open-btn');
    await openBtn.click();

    await expect(page.locator('#mobile-menu')).toBeVisible();
    await expect(page.locator('#mobile-menu')).not.toHaveClass(/translate-x-full/);
});
