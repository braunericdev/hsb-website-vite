import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    retries: process.env.CI ? 1 : 0,
    // Ein Worker in CI: geteilte Runner-Ressourcen führten mit 2 parallelen
    // Workern zu vereinzelten Timeouts bei Klick-Interaktionen.
    workers: process.env.CI ? 1 : undefined,
    // Höheres Timeout nur in CI: externe Skripte (GTM, Cookiebot), die beim Laden der Seite
    // mitladen, reagieren von GitHub-Actions-IPs aus spürbar langsamer als lokal - lokal bleibt
    // der Default (30s) für schnelles Feedback bei echten Regressionen.
    timeout: process.env.CI ? 60000 : undefined,
    use: {
        baseURL: 'http://localhost:4173',
    },
    webServer: {
        command: 'npm run preview -- --port 4173',
        port: 4173,
        reuseExistingServer: !process.env.CI,
    },
});
