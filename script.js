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
