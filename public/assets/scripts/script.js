const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const backToTop = document.querySelector(".back-to-top");

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.classList.toggle("is-open", !isOpen);
    siteNav.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.classList.remove("is-open");
      siteNav.classList.remove("is-open");
      document.body.classList.remove("menu-open");
    }
  });
}

document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

if (backToTop) {
  const updateBackToTop = () => {
    backToTop.classList.toggle("is-visible", window.scrollY > 520);
  };

  updateBackToTop();
  window.addEventListener("scroll", updateBackToTop, { passive: true });
  backToTop.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "auto" }),
  );
}

// Back-link: use history.back() to restore scroll position (instant, no smooth scroll)
const backLinkAnchors = document.querySelectorAll(".back-link a");
backLinkAnchors.forEach((link) => {
  link.addEventListener("click", (e) => {
    if (window.history.length > 1) {
      e.preventDefault();
      const html = document.documentElement;
      const originalBehavior = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";
      window.history.back();
      setTimeout(() => {
        html.style.scrollBehavior = originalBehavior;
      }, 0);
    }
  });
});

// Build mailto subject and body from contact form fields
const contactForm = document.querySelector(".contact-form");
// Handle document send request with template
const docSendLinks = document.querySelectorAll(".send-documents-link");
docSendLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    const to = "kancelaria@kieleckinotariusz.pl";
    const subject = "Przesłanie dokumentów do czynności notarialnej";

    const body = `Szanowna Pani/Panie,

Przesyłam dokumenty do czynności notarialnej:

--- PROSZĘ UZUPEŁNIĆ PONIŻSZE DANE ---

Rodzaj czynności (zaznacz wybraną):
☐ Umowa sprzedaży nieruchomości
☐ Umowa darowizny
☐ Testament
☐ Pełnomocnictwo
☐ Dział spadku
☐ Inne (opisz): ___________________________

Krótki opis sprawy:
___________________________________________________________________________

Twoje dane kontaktowe:
Imię i nazwisko: ________________________
Telefon: ________________________
Email: ________________________

--- ZAŁĄCZONE DOKUMENTY ---

Proszę zaznacz, które dokumenty załączasz:
☐ Dowód tożsamości
☐ Zaświadczenie z US
☐ Wypis z księgi wieczystej
☐ Umowa/dokumenty dotyczące sprawy
☐ Inne (wymień): ___________________________

Dziękuję!`;

    const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  });
});

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const action = contactForm.getAttribute("action") || "";
    const to = action.startsWith("mailto:")
      ? action.replace(/^mailto:/i, "")
      : action || "kancelaria@kieleckinotariusz.pl";

    const getVal = (selector) =>
      (contactForm.querySelector(selector)?.value || "").trim();
    const name = getVal("#name");
    const phone = getVal("#phone");
    const email = getVal("#email");
    const matterEl = contactForm.querySelector("#matter");
    const matter = matterEl
      ? matterEl.options[matterEl.selectedIndex].text.trim()
      : "";
    const message = getVal("#message");

    const subjectRaw = `${matter} - formularz ze strony: ${matter}`;

    const bodyRaw = `Imię i nazwisko: ${name}\nTelefon: ${phone}\nEmail: ${email}\nRodzaj sprawy: ${matter}\n\nOpis sprawy:\n${message}`;

    const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subjectRaw)}&body=${encodeURIComponent(bodyRaw)}`;

    // Open user's mail client with prefilled subject and body
    window.location.href = mailto;
  });
}

// Dokumenty: rozwijanie i podświetlenie akordeonu na podstawie fragmentu (#id)
// Np. dokumenty.html#07-testament otwiera accordion z data-key="07-testament"
(function () {
  const openFromHash = () => {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (!hash) return;

    const el = document.querySelector(`details[data-key="${hash}"]`);
    if (!el) return;

    el.open = true;
    el.classList.add("accordion-highlight");

    setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  openFromHash();
  window.addEventListener("hashchange", openFromHash);
})();

// Sticky header: chowanie sekcji kontaktowej (topline) przy przewijaniu w dół, pokazywanie przy przewijaniu w górę
(function () {
  const header = document.querySelector(".site-header");
  const topline = header?.querySelector(".topline");
  if (!header || !topline) return;

  // Funkcja aktualizująca wysokość topline (ustawia zmienną CSS)
  const updateToplineHeight = () => {
    const height = topline.offsetHeight;
    header.style.setProperty("--translate-y", `-${height}px`);
  };

  // Uruchomienie na start i na zmianę rozmiaru okna
  updateToplineHeight();
  window.addEventListener("resize", updateToplineHeight, { passive: true });

  let lastScrollY = window.scrollY;
  const threshold = 10; // minimalna różnica w pikselach, aby wywołać akcję

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;

    // Jeśli menu mobilne jest otwarte, nie chowaj topline
    if (document.body.classList.contains("menu-open")) {
      lastScrollY = currentScrollY;
      return;
    }

    // Zawsze pokazuj topline na samej górze strony
    if (currentScrollY <= 50) {
      header.classList.remove("topline-hidden");
      lastScrollY = currentScrollY;
      return;
    }

    // Sprawdzenie kierunku przewijania z uwzględnieniem progu (threshold)
    if (Math.abs(currentScrollY - lastScrollY) > threshold) {
      if (currentScrollY > lastScrollY) {
        // Przewijanie w dół - ukryj topline
        header.classList.add("topline-hidden");
      } else {
        // Przewijanie w górę - pokaż topline
        header.classList.remove("topline-hidden");
      }
      lastScrollY = currentScrollY;
    }
  }, { passive: true });

  // Pokaż topline, jeśli użytkownik używa tabulacji do nawigacji (dostępność)
  header.addEventListener("focusin", () => {
    header.classList.remove("topline-hidden");
  });
})();
