import { test, expect } from '@playwright/test';

// Deckt genau den Fall ab, den ein grüner Build allein nicht garantiert:
// Seite lädt, zeigt Inhalt (kein Whitescreen) und wirft dabei keine eigenen JS-Fehler.
const PAGES = ['/', '/kontakt/', '/karriere/', '/hausmeisterservice/'];

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

test('Bewerbungsformular sendet an den n8n-Webhook und leitet weiter', async ({ page }) => {
    // Der echte n8n-Webhook wird hier bewusst gestubbt statt wirklich angesprochen (externe
    // Abhängigkeit, würde bei jedem CI-Lauf eine echte Mail verschicken) - stattdessen wird
    // geprüft, dass main.js die richtigen Formulardaten an die richtige URL schickt und auf
    // die simulierte Antwort korrekt reagiert. Der echte Webhook ist live verifiziert (siehe
    // n8n/README-formulare-webhook.md).
    let requestBody = null;
    await page.route('https://niewiedertelefonieren.de/webhook/bewerbung', async (route) => {
        requestBody = route.request().postData();
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, errors: [] }) });
    });

    await page.goto('/karriere/');
    await page.locator('#bewerber-name').fill('Max Mustermann');
    await page.locator('#bewerber-telefon').fill('01512345678');
    await page.locator('#position').selectOption('Hausmeister-Allrounder (w/m/d)');
    // Radio ist per Tailwind sr-only versteckt (gestyltes Label übernimmt die Optik),
    // daher force nötig - die normale Sichtbarkeitsprüfung würde sonst dauerhaft scheitern.
    await page.locator('input[name="anstellungsart"][value="Teilzeit"]').check({ force: true });
    await page.locator('#privacy-karriere').check();

    await page.locator('#submit-btn').click();

    await page.waitForURL('**/danke/**');
    expect(new URL(page.url()).searchParams.has('bewerbung')).toBe(true);
    expect(requestBody).toContain('Max Mustermann');
});

test('Bewerbungsformular: mehrere Dateien hinzufügen und wieder entfernen', async ({ page }) => {
    const { writeFileSync, mkdtempSync } = await import('fs');
    const { tmpdir } = await import('os');
    const { join } = await import('path');
    const dir = mkdtempSync(join(tmpdir(), 'lebenslauf-'));
    const dateiA = join(dir, 'a.pdf');
    const dateiB = join(dir, 'b.pdf');
    const dateiC = join(dir, 'c.pdf');
    for (const pfad of [dateiA, dateiB, dateiC]) writeFileSync(pfad, '%PDF-1.4 Test');

    let requestBody = null;
    await page.route('https://niewiedertelefonieren.de/webhook/bewerbung', async (route) => {
        requestBody = route.request().postData();
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, errors: [] }) });
    });

    await page.goto('/karriere/');
    // Kurzer Puffer: setInputFiles direkt nach goto() kann knapp vor der Listener-
    // Registrierung des (deferred) Modul-Skripts landen, obwohl goto() bereits auf
    // "load" gewartet hat - reproduzierbar beobachtet, ohne Puffer flackert dieser Test.
    await page.waitForTimeout(500);

    // Zwei Dateien auf einmal auswählen
    await page.locator('#lebenslauf').setInputFiles([dateiA, dateiB]);
    await expect(page.locator('#lebenslauf-liste li')).toHaveCount(2);

    // Eine weitere Datei nachträglich hinzufügen - soll dazukommen, nicht ersetzen
    await page.locator('#lebenslauf').setInputFiles([dateiC]);
    await expect(page.locator('#lebenslauf-liste li')).toHaveCount(3);

    // Die mittlere (b.pdf) wieder entfernen
    await page.locator('#lebenslauf-liste li', { hasText: 'b.pdf' }).locator('button').click();
    await expect(page.locator('#lebenslauf-liste li')).toHaveCount(2);
    await expect(page.locator('#lebenslauf-liste')).not.toContainText('b.pdf');
    await expect(page.locator('#lebenslauf-liste')).toContainText('a.pdf');
    await expect(page.locator('#lebenslauf-liste')).toContainText('c.pdf');

    await page.locator('#bewerber-name').fill('Datei Test');
    await page.locator('#bewerber-telefon').fill('01512345678');
    await page.locator('#position').selectOption('Mitarbeiter in der Gartenpflege (w/m/d)');
    await page.locator('input[name="anstellungsart"][value="Minijob (Aushilfe)"]').check({ force: true });
    await page.locator('#privacy-karriere').check();
    await page.locator('#submit-btn').click();

    await page.waitForURL('**/danke/**');
    // Nur die zwei verbliebenen Dateien wurden verschickt, unter fortlaufenden Feldnamen
    expect(requestBody).toContain('name="lebenslauf_1"');
    expect(requestBody).toContain('name="lebenslauf_2"');
    expect(requestBody).not.toContain('name="lebenslauf_3"');
});

test('Kontaktformular sendet an den n8n-Webhook und leitet weiter', async ({ page }) => {
    // Gleiches Prinzip wie beim Bewerbungsformular-Test oben: Webhook gestubbt, um im CI-Lauf
    // keine echte Mail zu verschicken.
    let requestBody = null;
    await page.route('https://niewiedertelefonieren.de/webhook/kontakt', async (route) => {
        requestBody = route.request().postData();
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, errors: [] }) });
    });

    await page.goto('/kontakt/');
    await page.locator('input[name="name"]').fill('Erika Musterfrau');
    await page.locator('input[name="email"]').fill('erika@example.com');
    await page.locator('input[name="telefon"]').fill('01512345678');
    await page.locator('#dienstleistung').selectOption('allgemein');
    await page.locator('#plz-input').fill('56170');
    await page.locator('#ort-input').fill('Bendorf');
    await page.locator('textarea[name="nachricht"]').fill('Testnachricht aus dem Smoke-Test.');
    await page.locator('#privacy').check();

    await page.locator('#submit-btn').click();

    await page.waitForURL('**/danke/**');
    expect(new URL(page.url()).searchParams.get('dienstleistung')).toBe('allgemein');
    expect(requestBody).toContain('Erika Musterfrau');
});
