import '@fortawesome/fontawesome-free/css/all.min.css';
import './src/style.css';

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
    // Normalisiere Pfad: Entferne Slash am Ende und index.html
    const cleanPath = path.replace(/\/$/, "").replace("/index.html", "") || "/";
    // Entferne auch Umlaute für sicheren Vergleich
    const normalizedPath = cleanPath.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue');
    
    const navLinks = document.querySelectorAll('header nav a, #mobile-menu nav a');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;

        // Normalisiere Link-Ziel für den Vergleich
        let cleanHref = href.replace(/\.\.\//g, "/").replace(/\/$/, "").replace("/index.html", "") || "/";
        // Auch Umlaute normalisieren
        cleanHref = cleanHref.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue');

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
    const mapping = {
        'heckenschnitt': 'Heckenschnitt',
        'rasenmahen': 'Rasenmähen',
        'rasenmaehen': 'Rasenmähen',
        'gebaeudereinigung': 'Gebäudereinigung',
        'gebäudereinigung': 'Gebäudereinigung',
        'bodenverlegen': 'Bodenverlegen',
        'entruempelung': 'Entrümpelung',
        'entrümpelung': 'Entrümpelung',
        'winterdienst': 'Winterdienst',
        'gartengrundstueckspflege': 'Gartenpflege',
        'gartengrundstückspflege': 'Gartenpflege',
        'gestaltung': 'Gestaltung',
        'montageservice': 'Montageservice',
        'montage': 'Montageservice',
        'hausmeisterservice': 'Hausmeisterservice'
    };

    contactBtns.forEach(btn => {
        for (const [key, value] of Object.entries(mapping)) {
            if (cleanPath.includes(key)) {
                // Wir setzen den Link im HTML einfach neu
                btn.href = "/kontakt/?dienstleistung=" + value;
                break;
            }
        }
    });
};

window.addEventListener('load', () => {
    setupMobileMenu();
    setupHeroSlider();
    setupNavigationIntelligence();
    setupKontaktForm();
});

// 4. Kontaktformular Setup
const setupKontaktForm = () => {
    const form = document.getElementById("kontaktForm");
    if (!form) return; // Nur auf Kontaktseite ausführen

    const selectFeld = document.getElementById('dienstleistung');
    const basisUrl = "/danke/"; // Absolute URL zum Danke-Verzeichnis

    // 1. URL Parameter auslesen (Auto-Fill Dienstleistung)
    const params = new URLSearchParams(window.location.search);
    const urlDienstleistung = params.get('dienstleistung');
    if (urlDienstleistung) {
        // Sucht den passenden Value im Select
        for (let option of selectFeld.options) {
            if (option.value === urlDienstleistung) {
                selectFeld.value = urlDienstleistung;
                break;
            }
        }
    }

    // 2. PLZ & Ort Auto-Fill
    const plzInput = document.getElementById('plz-input');
    const ortInput = document.getElementById('ort-input');
    const spinner = document.getElementById('ort-spinner');

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

    // 3. AJAX Submit Logic
    form.addEventListener("submit", function(event) {
        event.preventDefault();

        const statusBtn = document.getElementById("submit-btn");
        const btnText = document.getElementById("btn-text");
        const originalText = btnText.innerHTML;
        
        btnText.innerHTML = "Wird gesendet...";
        statusBtn.disabled = true;

        const data = new FormData(form);

        fetch(form.action, {
            method: form.method,
            body: data,
            headers: { 'Accept': 'application/json' }
        }).then(response => {
            if (response.ok) {
                // Erfolgreich: Weiterleitung mit Parameter
                let zielUrl = basisUrl;
                const auswahl = selectFeld.value;
                if (auswahl) {
                    zielUrl += "?dienstleistung=" + encodeURIComponent(auswahl);
                }
                window.location.href = zielUrl;
            } else {
                response.json().then(data => {
                    if (Object.hasOwn(data, 'errors')) {
                        alert(data["errors"].map(error => error["message"]).join(", "));
                    } else {
                        alert("Hoppla! Es gab ein Problem beim Absenden.");
                    }
                });
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