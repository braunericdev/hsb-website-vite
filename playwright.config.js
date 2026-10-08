import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    retries: process.env.CI ? 1 : 0,
    // Ein Worker in CI: geteilte Runner-Ressourcen führten mit 2 parallelen
    // Workern zu vereinzelten Timeouts bei Klick-Interaktionen.
    workers: process.env.CI ? 1 : undefined,
    // Etwas Puffer nur in CI (lokal bleibt der strikte 30s-Default für schnelles Feedback) -
    // behebt das eigentliche CI-only-Hängenbleiben NICHT (siehe trace/video unten, zur Diagnose),
    // schadet aber auch nicht.
    timeout: process.env.CI ? 60000 : undefined,
    reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
    use: {
        baseURL: 'http://localhost:4173',
        // Nur bei Fehlschlag aufbewahren - zur Diagnose des CI-only-Hängenbleibens, das lokal
        // nicht reproduzierbar ist (siehe PR #43).
        trace: 'retain-on-failure',
        video: 'retain-on-failure',
    },
    webServer: {
        command: 'npm run preview -- --port 4173',
        port: 4173,
        reuseExistingServer: !process.env.CI,
    },
});
