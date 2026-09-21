import '@fortawesome/fontawesome-free/css/all.min.css';
import './src/style.css';
import { normalizePath, normalizeHref, getDienstleistungFromPath } from './src/lib/nav.js';

// Google-Ads-Conversion-Labels pro Dienstleistung (Konto: Braun Hausmeisterservice, AW-17931737581).
// Feuert beim Klick auf "Absenden", unabhängig vom n8n-Webhook/Redirect - siehe submitFormAjax().
const CONVERSION_LABELS = {
    heckenschnitt: 'AW-17931737581/F2sECJHo5vkcEO2zwuZC',
    gebaeudereinigung: 'AW-17931737581/M9GPCNjm4fkcEO2zwuZC',
    hausmeisterservice: 'AW-17931737581/6tevCOTT4vkcEO2zwuZC',
    leerstandsbetreuung: 'AW-17931737581/aMIXCK3F9_scEO2zwuZC',
};
const BEWERBUNG_CONVERSION_LABEL = 'AW-17931737581/Okr3CJPo4vkcEO2zwuZC';

// 1. Mobile Menü (Vollständig)
const setupMobileMenu = () => {
    const menu = document.getElementById('mobile-menu');
    const overlay = document.getElementById('mobile-overlay');
    const openBtn = document.getElementById('menu-open-btn');
    const closeBtn = document.getElementById('menu-close-btn');
    if (!menu || !openBtn) return;
    const toggle = () => {
        const isHidden = menu.classList.contains('hidden');
        if (isHidden) {
            menu.classList.remove('hidden');
            overlay.classList.remove('hidden');
            setTimeout(() => {
                menu.classList.remove('translate-x-full');
                overlay.classList.add('opacity-100');
                document.body.style.overflow = 'hidden';
            }, 10);
        } else {
            menu.classList.add('translate-x-full');
            overlay.classList.remove('opacity-100');
            document.body.style.overflow = '';
            setTimeout(() => {
                menu.classList.add('hidden');
                overlay.classList.add('hidden');
            }, 300);
        }
    };
    openBtn.addEventListener('click', toggle);
    if (closeBtn) closeBtn.addEventListener('click', toggle);
    if (overlay) overlay.addEventListener('click', toggle);
};

// 2. Hero-Slider (Vollständig)
const setupHeroSlider = () => {
    const sliderContainer = document.getElementById('hero-slider');
    if (!sliderContainer) return;
    const slides = sliderContainer.querySelectorAll('.slide');
    const dots = sliderContainer.querySelectorAll('#slider-dots button');
    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');
    let currentSlide = 0;
    const showSlide = (index) => {
        if (index >= slides.length) currentSlide = 0;
        else if (index < 0) currentSlide = slides.length - 1;
        else currentSlide = index;
        slides.forEach((slide, i) => {
            slide.classList.toggle('opacity-100', i === currentSlide);
            slide.classList.toggle('z-10', i === currentSlide);
            slide.classList.toggle('opacity-0', i !== currentSlide);
            slide.classList.toggle('z-0', i !== currentSlide);
        });
        dots.forEach((dot, i) => {
            dot.classList.toggle('bg-white', i === currentSlide);
            dot.classList.toggle('bg-white/50', i !== currentSlide);
        });
    };
    if (prevBtn) prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));
    dots.forEach((dot, index) => dot.addEventListener('click', () => showSlide(index)));
    setInterval(() => showSlide(currentSlide + 1), 5000);
};

// 3. Navigation Intelligenz (Die Lösung für das Styling & Parameter)
const setupNavigationIntelligence = () => {
    const path = window.location.pathname;
    const cleanPath = path.replace(/\/$/, "").replace("/index.html", "") || "/";
    const normalizedPath = normalizePath(path);

    const navLinks = document.querySelectorAll('header nav a, #mobile-menu nav a');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;

        const cleanHref = normalizeHref(href);

        // Prüfen auf Übereinstimmung
        if (normalizedPath === cleanHref) {
            // Desktop Styling
            if (link.closest('.lg\\:flex')) {
                // Ist es ein Dropdown-Link oder Top-Level?
                if (link.closest('.absolute')) {
                    link.classList.add('text-[#8B4513]', 'font-bold');
                    // Parent (Button) markieren
                    const parentBtn = link.closest('.relative.group').querySelector('button');
                    if (parentBtn) parentBtn.classList.add('nav-parent-active');
                } else {
                    link.classList.add('nav-active-desktop');
                }
            }
            // Mobile Styling
            if (link.closest('#mobile-menu')) {
                link.classList.add('nav-active-mobile');
            }
        }
    });

    // Kontakt-Buttons umschreiben
    const contactBtns = document.querySelectorAll('a[href*="/kontakt"]');
    const dienstleistung = getDienstleistungFromPath(cleanPath);
    if (dienstleistung) {
        contactBtns.forEach(btn => {
            btn.href = "/kontakt/?dienstleistung=" + dienstleistung;
        });
    }
};

// 4. Gemeinsame AJAX-Submit-Logik für Formulare gegen die n8n-Webhooks
// (einheitliches Antwortformat {ok, errors}, siehe n8n/README-formulare-webhook.md)
const submitFormAjax = (form, buildRedirectUrl, beforeSend, getConversionLabel) => {
    form.addEventListener("submit", function(event) {
        event.preventDefault();

        // Conversion feuert sofort beim Absenden-Klick, nicht erst beim Laden der Danke-Seite -
        // sonst geht sie verloren, wenn Redirect/Webhook aus irgendeinem Grund nicht durchkommen.
        const conversionLabel = getConversionLabel ? getConversionLabel() : undefined;
        if (conversionLabel) {
            gtag('event', 'conversion', { send_to: conversionLabel });
        }

        const statusBtn = form.querySelector('[data-submit-btn]');
        const btnText = form.querySelector('[data-btn-text]');
        const originalText = btnText.innerHTML;

        btnText.innerHTML = "Wird gesendet...";
        statusBtn.disabled = true;

        const data = new FormData(form);
        if (beforeSend) beforeSend(data);

        fetch(form.action, {
            method: form.method,
            body: data,
            headers: { 'Accept': 'application/json' }
        }).then(response => response.json()).then(result => {
            if (result.ok) {
                window.location.href = buildRedirectUrl();
            } else {
                alert((result.errors || []).join(", ") || "Hoppla! Es gab ein Problem beim Absenden.");
                btnText.innerHTML = originalText;
                statusBtn.disabled = false;
            }
        }).catch(error => {
            alert("Fehler beim Senden: " + error);
            btnText.innerHTML = originalText;
            statusBtn.disabled = false;
        });
    });
};

// 5. Kontaktformular Setup
// Mehrere Kontaktformulare pro Seite möglich (z.B. Rauchmelder-Seite: Formular im
// Hero + am Seitenende) - daher über data-kontakt-form statt einer eindeutigen ID
// ansprechen, alle Feld-Lookups jeweils auf das einzelne Formular scoped.
const setupKontaktForm = () => {
    document.querySelectorAll('[data-kontakt-form]').forEach((form) => {
        const selectFeld = form.querySelector('[data-dienstleistung]');

        // 1. URL Parameter auslesen (Auto-Fill Dienstleistung)
        const params = new URLSearchParams(window.location.search);
        const urlDienstleistung = params.get('dienstleistung');
        if (urlDienstleistung && selectFeld) {
            // Sucht den passenden Value im Select
            for (let option of selectFeld.options) {
                if (option.value === urlDienstleistung) {
                    selectFeld.value = urlDienstleistung;
                    break;
                }
            }
        }

        // 2. PLZ & Ort Auto-Fill
        const plzInput = form.querySelector('[data-plz-input]');
        const ortInput = form.querySelector('[data-ort-input]');
        const spinner = form.querySelector('[data-ort-spinner]');

        if (plzInput) {
            plzInput.addEventListener('input', function(e) {
                const plz = e.target.value;
                if (plz.length === 5 && /^\d+$/.test(plz)) {
                    spinner.classList.remove('hidden');
                    fetch(`https://api.zippopotam.us/de/${plz}`)
                        .then(r => r.ok ? r.json() : null)
                        .then(d => {
                            if(d) ortInput.value = d.places[0]['place name'];
                        })
                        .catch(e => console.error("PLZ-Fehler:", e))
                        .finally(() => {
                            spinner.classList.add('hidden');
                        });
                }
            });
        }

        // 3. AJAX Submit
        submitFormAjax(form, () => {
            // Bestehende Google-Ads-Conversion-Aktionen prüfen die Danke-URL auf
            // "enthält .../danke/?dienstleistung=<wert>" als Teilstring - Format bewusst
            // unverändert zur bisherigen URL lassen, kein zusätzlicher Parameter.
            let zielUrl = "/danke/";
            if (selectFeld && selectFeld.value) {
                zielUrl += "?dienstleistung=" + encodeURIComponent(selectFeld.value);
            }
            return zielUrl;
        }, undefined, () => selectFeld ? CONVERSION_LABELS[selectFeld.value] : undefined);
    });
};

// 6. Bewerbungsformular Setup
const setupBewerbungForm = () => {
    const form = document.getElementById("bewerbungForm");
    if (!form) return; // Nur auf Karriereseite ausführen

    // Datei-Upload: native Inputs erlauben kein nachträgliches Entfernen einzelner
    // Dateien, daher eigene Verwaltung als Array + Neuaufbau der Auswahl im Input
    // bei jeder Änderung, statt die Browser-Auswahl direkt zu verwenden.
    const MAX_DATEIEN = 5;
    const MAX_DATEIGROESSE = 8 * 1024 * 1024;
    const MAX_GESAMTGROESSE = 20 * 1024 * 1024;

    const dateiInput = document.getElementById('lebenslauf');
    const dateiListe = document.getElementById('lebenslauf-liste');
    const dateiFehler = document.getElementById('lebenslauf-fehler');
    let ausgewaehlteDateien = [];

    const formatiereGroesse = (bytes) => (bytes / 1024 / 1024).toFixed(1) + ' MB';

    const zeigeFehler = (text) => {
        dateiFehler.textContent = text;
        dateiFehler.classList.remove('hidden');
    };
    const verbergeFehler = () => {
        dateiFehler.classList.add('hidden');
    };

    const renderDateiliste = () => {
        dateiListe.innerHTML = '';
        ausgewaehlteDateien.forEach((datei, index) => {
            const eintrag = document.createElement('li');
            eintrag.className = 'flex items-center justify-between gap-2 text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2';

            const bezeichnung = document.createElement('span');
            bezeichnung.className = 'text-gray-600 font-medium truncate';
            bezeichnung.textContent = `${datei.name} (${formatiereGroesse(datei.size)})`;

            const entfernenBtn = document.createElement('button');
            entfernenBtn.type = 'button';
            entfernenBtn.className = 'text-gray-400 hover:text-red-600 font-bold shrink-0 px-1';
            entfernenBtn.setAttribute('aria-label', `${datei.name} entfernen`);
            entfernenBtn.textContent = '×';
            entfernenBtn.addEventListener('click', () => {
                ausgewaehlteDateien.splice(index, 1);
                verbergeFehler();
                renderDateiliste();
            });

            eintrag.append(bezeichnung, entfernenBtn);
            dateiListe.appendChild(eintrag);
        });
    };

    dateiInput.addEventListener('change', () => {
        const neueDateien = Array.from(dateiInput.files);
        dateiInput.value = ''; // Auswahl zurücksetzen, damit dieselbe Datei erneut wählbar bleibt

        for (const datei of neueDateien) {
            if (ausgewaehlteDateien.length >= MAX_DATEIEN) {
                zeigeFehler(`Maximal ${MAX_DATEIEN} Dateien möglich.`);
                break;
            }
            if (datei.size > MAX_DATEIGROESSE) {
                zeigeFehler(`"${datei.name}" ist zu groß (max. ${formatiereGroesse(MAX_DATEIGROESSE)} pro Datei).`);
                continue;
            }
            const gesamtgroesse = ausgewaehlteDateien.reduce((summe, d) => summe + d.size, 0) + datei.size;
            if (gesamtgroesse > MAX_GESAMTGROESSE) {
                zeigeFehler(`Gesamtgröße aller Dateien überschreitet ${formatiereGroesse(MAX_GESAMTGROESSE)}.`);
                continue;
            }
            ausgewaehlteDateien.push(datei);
            verbergeFehler();
        }
        renderDateiliste();
    });

    submitFormAjax(
        form,
        () => "/danke/?bewerbung",
        (data) => {
            ausgewaehlteDateien.forEach((datei, index) => {
                data.append(`lebenslauf_${index + 1}`, datei);
            });
        },
        () => BEWERBUNG_CONVERSION_LABEL
    );
};

// 7. FAQ-Akkordeon (site-weit): <details> nutzt native Toggle-Semantik,
// aber ohne dieses Skript bleiben mehrere Einträge gleichzeitig offen statt
// sich gegenseitig zu schließen. <details> wird site-weit ausschließlich für
// FAQ-Sektionen verwendet, daher ist der globale Selektor kollisionsfrei.
const setupFaqAccordion = () => {
    document.querySelectorAll('details').forEach((detail) => {
        detail.addEventListener('toggle', () => {
            if (detail.open) {
                document.querySelectorAll('details').forEach((otherDetail) => {
                    if (otherDetail !== detail) otherDetail.removeAttribute('open');
                });
            }
        });
    });
};

// 8. Google-Bewertungen: füllt Durchschnittsanzeige und Karussell aus src/data/google-reviews.json.
// Die Datei wird per scripts/update-reviews.mjs aus einer kopierten Google-Bewertungsliste gepflegt.
// Nur auf Seiten mit Bewertungs-Elementen wird sie (als eigener Chunk) nachgeladen.
const setupGoogleReviews = async () => {
    const section = document.querySelector('[data-reviews-section]');
    const numberEls = document.querySelectorAll('[data-avg-number]');
    if (!section && !numberEls.length) return;

    let data;
    try {
        data = (await import('./src/data/google-reviews.json')).default;
    } catch {
        return;
    }

    const relativeTime = (iso) => {
        const days = Math.max(0, Math.round((Date.now() - new Date(iso + 'T12:00:00')) / 86400000));
        const rtf = new Intl.RelativeTimeFormat('de', { numeric: 'always' });
        if (days < 7) return rtf.format(-Math.max(days, 1), 'day');
        if (days < 30) return rtf.format(-Math.floor(days / 7), 'week');
        const months = Math.round(days / 30.44);
        if (months < 12) return rtf.format(-months, 'month');
        return rtf.format(-Math.max(1, Math.floor(days / 365)), 'year');
    };

    const reviews = (Array.isArray(data.reviews) ? data.reviews : [])
        .filter((r) => r && r.text && Number(r.rating) > 0);
    const rating = Number(data.rating) || 0;
    const total = Number(data.total) || reviews.length;

    if (rating > 0) {
        const pct = Math.min(100, (rating / 5) * 100) + '%';
        numberEls.forEach((el) => { el.textContent = rating.toFixed(1).replace('.', ','); });
        document.querySelectorAll('[data-avg-fill]').forEach((el) => { el.style.width = pct; });
        document.querySelectorAll('[data-avg-rating], [data-avg-badge]').forEach((el) => el.classList.remove('invisible'));
    }
    if (total > 0) {
        document.querySelectorAll('[data-review-count]').forEach((el) => { el.textContent = total; });
        document.querySelectorAll('[data-review-count-wrap]').forEach((el) => el.classList.remove('hidden'));
    }

    const track = section && section.querySelector('[data-reviews-track]');
    const template = section && section.querySelector('template[data-review-template]');
    if (!track || !template || !reviews.length) return;

    const buildSet = () => {
        const set = document.createElement('div');
        set.className = 'flex shrink-0 gap-6 pr-6';
        reviews.forEach((r) => {
            const card = template.content.cloneNode(true);
            const setField = (field, value) => { card.querySelector(`[data-field="${field}"]`).textContent = value; };
            const name = String(r.author || 'Google-Nutzer').trim();
            setField('name', name);
            setField('initial', name.charAt(0).toUpperCase());
            setField('time', r.date ? relativeTime(r.date) : '');
            setField('text', String(r.text).trim());
            card.querySelector('[data-field="stars"]').style.width = Math.min(100, (Number(r.rating) / 5) * 100) + '%';
            set.appendChild(card);
        });
        return set;
    };
    section.classList.remove('hidden');

    // Bei reduzierter Bewegung: keine Animation, stattdessen von Hand scrollbar
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        track.classList.add('overflow-x-auto');
        track.appendChild(buildSet());
        return;
    }

    // Endlos-Lauf: Karten-Satz mehrfach nebeneinander, CSS schiebt genau um die Breite eines Satzes
    // (dann sieht der Anfang des nächsten Satzes wie der Anfang des ersten aus -> nahtlose Schleife).
    const PX_PER_SECOND = 45;
    const inner = document.createElement('div');
    inner.className = 'reviews-marquee flex w-max';
    track.appendChild(inner);
    const layout = () => {
        inner.replaceChildren(buildSet());
        const setWidth = inner.firstElementChild.getBoundingClientRect().width;
        if (!setWidth) return;
        const copies = Math.ceil(track.clientWidth / setWidth) + 1;
        for (let n = 0; n < copies; n++) {
            const copy = buildSet();
            copy.setAttribute('aria-hidden', 'true');
            inner.appendChild(copy);
        }
        inner.firstElementChild.removeAttribute('aria-hidden');
        inner.style.setProperty('--marquee-shift', `-${setWidth}px`);
        inner.style.setProperty('--marquee-duration', `${setWidth / PX_PER_SECOND}s`);
    };
    layout();
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(layout, 200);
    });
};

// 9. Hochzählende Zahl: startet, sobald das Element sichtbar wird, und endet bei data-count-up
const setupCountUp = () => {
    const els = document.querySelectorAll('[data-count-up]');
    if (!els.length) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const run = (el) => {
        const target = Number(el.dataset.countUp);
        const suffix = el.dataset.countSuffix || '';
        if (reduced || !('requestAnimationFrame' in window)) { el.textContent = target + suffix; return; }
        const duration = 1800;
        const start = performance.now();
        const tick = (now) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = Math.round(target * eased) + (t === 1 ? suffix : '');
            if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    };
    if (!reduced) els.forEach((el) => { el.textContent = '0'; });
    if (!('IntersectionObserver' in window)) { els.forEach(run); return; }
    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            io.unobserve(entry.target);
            run(entry.target);
        });
    }, { threshold: 0.6 });
    els.forEach((el) => io.observe(el));
};

// Skript ist ein deferred Modul (type="module") und läuft daher erst nach
// vollständigem DOM-Parsing – ein Warten auf "load" (alle Bilder etc.) ist
// für diese Interaktionen nicht nötig und verzögert sie unnötig.
setupMobileMenu();
setupHeroSlider();
setupNavigationIntelligence();
setupKontaktForm();
setupBewerbungForm();
setupFaqAccordion();
setupGoogleReviews();
setupCountUp();
