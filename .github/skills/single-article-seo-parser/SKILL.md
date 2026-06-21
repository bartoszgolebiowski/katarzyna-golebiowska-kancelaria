---
name: single-article-seo-parser
description: >
  Deterministyczny parser treści SEO dla POJEDYNCZEGO artykułu blogowego.
  Przekształca surowy tekst prawny w gotowy plik index.html bez podziału
  na Hub & Spoke. Zachowuje 100% oryginalnej treści autorskiej.
  Automatycznie wykrywa odniesienia do innych artykułów blogowych i zamienia
  je w hiperłącza. Wykrywa typy czynności notarialnych i dodaje linki do
  wykazów dokumentów oraz plików PDF.
  Triggeruje na: "artykuł", "pojedynczy artykuł", "blog post", "SEO artykuł",
  "przekształć tekst", "wygeneruj artykuł", "wygeneruj HTML", "bez hub spoke".
argument-hint: "Wklej surowy tekst prawny/edukacyjny do przekształcenia w artykuł"
---

# Single Article SEO Parser

Przekształca surowy tekst prawny na gotowy `index.html` artykułu blogowego,
zoptymalizowany pod SEO. Brak podziału na Hub & Spoke — cała treść trafia
do jednego pliku. Zachowuje nienaruszoną treść autorską (prawniczą)
i automatycznie tworzy hiperłącza do powiązanych zasobów.

## Kiedy używać

- Tekst nie zawiera wyraźnie wyodrębnionych kazusów/przypadków z życia.
- Materiał jest ciągłym wykładem (pytania i odpowiedzi, definicje, FAQ).
- Użytkownik jawnie prosi o jeden artykuł bez spoke'ów.
- Treść jest zbyt krótka, by dzielić ją na hub + artykuły wspierające.

---

## REGUŁA KRYTYCZNA — NIENARUSZALNOŚĆ TREŚCI PRAWNEJ

**Tekst wejściowy jest dokumentem prawnym.** Bezwzględny zakaz:
1. Parafrazowania lub "upraszczania" języka.
2. Usuwania fragmentów, które wydają się "niepotrzebne".
3. Dodawania własnych wniosków, interpretacji lub "rad od AI".
4. Zmieniania kolejności informacji w obrębie danego akapitu/sekcji.

**Dozwolone operacje (Optymalizacja SEO):**
1. Wygenerowanie atrakcyjnych nagłówków SEO (`H1`, `H2`, `<title>`).
2. Opakowanie oryginalnego tekstu w tagi HTML (`<p>`, `<ul>`, `<li>`).
3. Otagowanie terminów kluczowych znacznikiem `<strong>`.
4. Dodanie hiperłączy do powiązanych zasobów (blog, dokumenty, PDF).

---

## PIPELINE EGZEKUCJI

### FAZA 1 — Analiza treści i wykrywanie odniesień

#### 1a. Temat i struktura

Przeanalizuj dostarczony tekst:
- Zidentyfikuj główny temat (fraza SEO dla `<h1>`).
- Podziel na logiczne podrozdziały dla `<h2>`.
- Wydziel ewentualny wstęp (lead) — pierwszy akapit.

#### 1b. Wykrywanie cross-referencji blogowych

Przeskanuj tekst pod kątem tematów, które mają już artykuły na blogu.
Dla każdego dopasowania wstaw hiperłącze inline w odpowiednim akapicie:

| Temat / słowa kluczowe                              | URL artykułu                                      |
|-----------------------------------------------------|---------------------------------------------------|
| majątek wspólny, majątek osobisty, darowizna od rodziców, mieszkanie po ślubie | `../../blog/majatek-wspolny-osobisty/index.html` |
| rozdzielność majątkowa, intercyza, umowa majątkowa małżeńska | `../../blog/rozdzielnosc-majatkowa/index.html`  |
| testament, darowizna, dożywocie, przekazanie nieruchomości | `../../blog/testament-darowizna-dozywocie/index.html` |

Zasady linkowania:
- Linkuj **raz** na artykuł dla danego tematu (pierwsze wystąpienie).
- Tekst kotwicy = oryginalny fragment zdania (np. `<a href="...">rozdzielność majątkową</a>`).
- Nie twórz linku, jeśli artykuł traktuje właśnie o tym temacie (unikaj samozawęźlenia).

#### 1c. Wykrywanie typów czynności notarialnych

Wykryj wzmianki o czynnościach notarialnych i zaplanuj sekcję `.blog-download-box`.
Użyj poniższej mapy, aby określić linki do wykazów dokumentów i plików PDF:

| Czynność / słowa kluczowe                              | Anchor w dokumenty.html           | Dostępne pliki PDF (wybierz pasujące)                                         |
|--------------------------------------------------------|------------------------------------|-------------------------------------------------------------------------------|
| umowa sprzedaży, sprzedaż nieruchomości                | `#01-umowa-sprzedazy`             | `umowa-sprzedazy-nieruchomosc-gruntowa.pdf`, `umowa-sprzedazy-lokal-mieszkalny-stan-odrebnej-wlasnosci.pdf`, `umowa-sprzedazy-spoldzielcze-wlasnosciowe-prawo-do-lokalu.pdf`, `umowa-sprzedazy-rolnik-indywidualny.pdf` |
| umowa zamiany, zamiana nieruchomości                   | `#02-umowa-zamiany`               | `umowa-zamiany-nieruchomosc-gruntowa.pdf`, `umowa-zamiany-lokal-mieszkalny-stan-odrebnej-wlasnosci.pdf`, `umowa-zamiany-spoldzielcze-wlasnosciowe-prawo-do-lokalu.pdf` |
| umowa darowizny, darowizna                             | `#03-umowa-darowizny`             | `umowa-darowizny-nieruchomosc-gruntowa.pdf`, `umowa-darowizny-lokal-mieszkalny-stan-odrebnej-wlasnosci.pdf`, `umowa-darowizny-spoldzielcze-wlasnosciowe-prawo-do-lokalu.pdf` |
| dział spadku, zniesienie współwłasności                | `#04-dzial-spadku-zniesienie-wspolwlasnosci` | `dzial-spadku-zniesienie-wspolwlasnosci-nieruchomosc-gruntowa.pdf`, `dzial-spadku-zniesienie-wspolwlasnosci-lokal-mieszkalny-stan-odrebnej-wlasnosci.pdf`, `dzial-spadku-zniesienie-wspolwlasnosci-spoldzielcze-wlasnosciowe-prawo-do-lokalu.pdf` |
| podział majątku wspólnego                              | `#05-podzial-majatku-wspolnego`   | `podzial-majatku-wspolnego-nieruchomosc-gruntowa.pdf`, `podzial-majatku-wspolnego-lokal-mieszkalny-stan-odrebnej-wlasnosci.pdf`, `podzial-majatku-wspolnego-spoldzielcze-wlasnosciowe-prawo-do-lokalu.pdf` |
| umowa dożywocia, dożywocie                             | `#06-umowa-o-dozywocie`           | `umowa-o-dozywocie-nieruchomosc-gruntowa.pdf`, `umowa-o-dozywocie-lokal-mieszkalny-stan-odrebnej-wlasnosci.pdf` |
| testament                                              | `#07-testament`                   | `testament-testament.pdf`                                                     |
| pełnomocnictwo do zbycia nieruchomości                 | `#08-pelnomocnictwo-do-zbycia-nieruchomosci` | `pelnomocnictwo-do-zbycia-nieruchomosci-pelnomocnictwo-do-zbycia-nieruchomosci.pdf` |
| akt poświadczenia dziedziczenia, nabycie spadku        | `#09-akt-poswiadczenia-dziedziczenia` | `akt-poswiadczenia-dziedziczenia-akt-poswiadczenia-dziedziczenia.pdf`         |
| umowa majątkowa małżeńska, rozdzielność majątkowa, intercyza | `#10-umowa-majatkowa-malzeska` | `umowa-majatkowa-malzeska-umowa-majatkowa-malzeska.pdf`                   |
| hipoteka, ustanowienie hipoteki                        | `#11-ustanowienie-hipoteki`       | `ustanowienie-hipoteki-ustanowienie-hipoteki.pdf`                             |
| odrzucenie spadku, przyjęcie spadku                    | `#12-odrzucenie-lub-przyjecie-spadku` | `odrzucenie-lub-przyjecie-spadku-odrzucenie-lub-przyjecie-spadku.pdf`     |
| służebność gruntowa                                    | `#13-sluzebnosc-gruntowa`         | `sluzebnosc-gruntowa-sluzebnosc-gruntowa.pdf`                                 |
| służebność osobista, służebność mieszkania             | `#14-sluzebnosc-osobista`         | `sluzebnosc-osobista-sluzebnosc-osobista.pdf`                                 |
| najem okazjonalny, rygor egzekucji z najmu             | `#15-rygor-egzekucji-z-najmu-okazjonalnego` | `rygor-egzekucji-z-najmu-okazjonalnego-rygor-egzekucji-z-najmu-okazjonalnego.pdf` |
| rygor egzekucji, akt notarialny z rygorem              | `#16-rygor-egzekucji`             | `rygor-egzekucji-rygor-egzekucji.pdf`                                         |
| fundacja rodzinna                                      | `#17-fundacja-rodzinna`           | `fundacja-rodzinna-fundacja-rodzinna.pdf`                                     |
| wyodrębnienie lokalu, odrębna własność lokalu          | `#18-ustanowienie-odrebnej-wlasnosci-lokalu` | `ustanowienie-odrebnej-wlasnosci-lokalu-ustanowienie-odrebnej-wlasnosci-lokalu.pdf` |

Zasady doboru PDF-ów do `.blog-download-box`:
- Uwzględnij tylko te typy czynności, które są **głównym tematem** artykułu.
- Jeśli temat dotyczy wielu rodzajów nieruchomości, wymień kilka PDF-ów jako `<ul><li>`.
- Jeśli temat jest bardzo ogólny (np. "przekazanie majątku rodzinie"), pomiń konkretne PDF-y
  i linkuj tylko do `../../dokumenty.html#{slug}`.

---

### FAZA 2 — Generowanie `index.html`

> **WYMÓG KRYTYCZNY — SZABLON:** Wygenerowany plik **musi** być oparty na pliku
> [`.github/skills/hub-spoke-seo-parser/assets/base-template.html`](../hub-spoke-seo-parser/assets/base-template.html).
> Skopiuj jego pełną strukturę (nagłówek, nawigacja, stopka, skrypty) i podmień
> tylko zmienne sekcje wymienione poniżej. **Nie twórz własnego szkieletu HTML** —
> każde odchylenie od szablonu złamie spójność wizualną i stylistyczną serwisu.
> Dla wzorca gotowego artykułu porównaj `site-src/blog/rozdzielnosc-majatkowa/index.html`.

1. **Metadane SEO** w `<head>`:
   - `<title>`: `{H1} | Kancelaria Notarialna Katarzyna Gołębiowska`
   - `<meta name="description">`: maks. 160 znaków, unikalne, zachęcające do kliknięcia
   - `<link rel="canonical" href="https://kieleckinotariusz.pl/blog/{slug}/">`
   - Open Graph: `og:title`, `og:description`, `og:url` — zgodne z powyższymi
   - JSON-LD `BlogPosting` + `BreadcrumbList` (3 poziomy)

2. **Breadcrumb HTML** (3 poziomy):
   ```html
   <a href="../../index.html">Strona główna</a><span>/</span
   ><a href="../../blog.html">Blog</a><span>/</span
   ><span>{H1 artykułu}</span>
   ```

3. **`.blog-meta`** bezpośrednio po `<h1>`:
   ```html
   <div class="blog-meta">
     <span>Autor: <a href="../../index.html#o-notariuszu">Notariusz Katarzyna Gołębiowska</a></span>
     <span class="blog-meta__separator">•</span>
     <time datetime="{YYYY-MM-DD}">{D miesiąc YYYY}</time>
   </div>
   ```
   Użyj bieżącej daty jako daty publikacji.

4. **`.blog-download-box`** (tylko jeśli wykryto pasujące czynności notarialne w FAZIE 1c):
   ```html
   <div class="blog-download-box">
     <div class="blog-download-box__icon">
       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
         <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
         <polyline points="7 10 12 15 17 10"></polyline>
         <line x1="12" y1="15" x2="12" y2="3"></line>
       </svg>
     </div>
     <div class="blog-download-box__content">
       <strong>Najczęściej potrzebne dokumenty:</strong>
       <ul style="margin: 8px 0 0 0; padding-left: 1.4em;">
         <!-- Dla każdego pasującego PDF: -->
         <li><a href="../../assets/pdf/{nazwa-pliku}.pdf" download class="blog-download-link">{Czytelna nazwa}</a></li>
       </ul>
       <p style="margin: 14px 0 0 0;">
         Zobacz także: <a href="../../dokumenty.html#{anchor}" class="blog-download-link">pełny wykaz dokumentów dla {temat}</a>.
       </p>
       <div style="margin-top: 16px; display: flex; flex-wrap: wrap; gap: 10px;">
         <a href="mailto:kancelaria@kieleckinotariusz.pl?subject={URL-encoded-temat}&body={URL-encoded-body}" class="button button--small">Napisz do notariusza</a>
         <a href="tel:+48789741377" class="button button--small">Zadzwoń: +48 789 741 377</a>
       </div>
     </div>
   </div>
   ```

5. **Treść artykułu** wewnątrz `<article class="blog-prose">`:
   - Wstęp: `<p class="blog-prose__lead">…</p>`
   - Każdy podrozdział:
     ```html
     <div class="blog-prose__section">
       <h2>{Nagłówek SEO Long-Tail}</h2>
       <p>…oryginalna treść…</p>
     </div>
     ```
   - `<strong>` dla kluczowych terminów prawnych/branżowych (nazwy ustaw, artykuły k.c., terminy)
   - Listy wyliczeniowe → `<ul><li>…</li></ul>`
   - Cross-referencje blogowe (z FAZY 1b) → inline `<a href="…">…</a>`

6. **`.blog-cta-text`** na końcu artykułu (przed disclaimerem):
   ```html
   <div class="blog-cta-text">
     <p>
       {Krótkie zdanie zachęcające do kontaktu z nawiązaniem do tematu artykułu}.
       <a href="../../kontakt.html">Skontaktuj się z kancelarią notarialną w Kielcach</a>
       – wstępne wyjaśnienia przed czynnością są bezpłatne.
     </p>
   </div>
   ```

7. **`.blog-disclaimer`** (zawsze na końcu `<article>`):
   ```html
   <div class="blog-disclaimer blog-disclaimer--bottom">
     <p style="font-size: 13.5px; color: var(--ink-muted); line-height: 1.55;">
       <strong>Informacja:</strong> Prezentowane na blogu treści mają charakter wyłącznie
       edukacyjny i informacyjny. Nie stanowią one porady ani opinii prawnej. Przed
       dokonaniem konkretnej czynności notariusz udzieli Państwu szczegółowych
       i bezpłatnych wyjaśnień.
     </p>
   </div>
   ```

8. **Wrapper sekcji**:
   ```html
   <section class="section blog-article">
     <div class="wrap blog-article__wrap">
       <article class="blog-prose">
         …
       </article>
     </div>
   </section>
   ```

9. **Zastosuj szablon** z [`../hub-spoke-seo-parser/assets/base-template.html`](../hub-spoke-seo-parser/assets/base-template.html) —
   skopiuj cały plik i podmień wyłącznie:
   - `<title>`, `<meta name="description">`, `<link rel="canonical">`
   - Tagi Open Graph i Twitter Cards
   - JSON-LD Schema (`BlogPosting` + `BreadcrumbList`)
   - Breadcrumb HTML (3 poziomy)
   - Zawartość `<article class="blog-prose">` (punkty 3–7 powyżej)

   Nie usuwaj ani nie przenoś żadnych innych elementów szablonu
   (skrypty consent, GA4, nagłówek, nawigacja, footer, tagi CSS).
   Użyj `site-src/blog/rozdzielnosc-majatkowa/index.html` jako żywego przykładu
   jak powinien wyglądać gotowy plik.

10. Zapisz jako `index.html` w nowym katalogu:
    `site-src/blog/{slug}/index.html`
    gdzie `{slug}` = lowercase, bez polskich znaków, myślniki zamiast spacji
    (np. `site-src/blog/odrzucenie-spadku/index.html`).

---

### FAZA 3 — Wynik wyjściowy

Zwróć blok kodu HTML:

```
### index.html
{kod}
```

Zachowaj **100% zgodności znakowej** z oryginalnymi akapitami tekstowymi.

---

## Aktualizacja site-src/pages/blog.html

Po wygenerowaniu pliku zaproponuj użytkownikowi dodanie karty artykułu
do `site-src/pages/blog.html`. Wzorzec karty dla **pojedynczego artykułu**
(bez sekcji `.blog-card__spokes`):

```html
<article
  class="blog-card"
  onclick="window.location = '{{relativeRoot}}blog/{folder}/index.html'"
>
  <div class="blog-card__body">
    <p class="blog-card__label">{Kategoria prawna}</p>
    <h2 class="blog-card__title">
      <a
        href="{{relativeRoot}}blog/{folder}/index.html"
        onclick="event.stopPropagation()"
        >{H1 z index.html}</a
      >
    </h2>
    <p class="blog-card__desc">{Pierwsze zdanie wstępu z index.html — absolutnie bez zmian}</p>
  </div>
  <a
    href="{{relativeRoot}}blog/{folder}/index.html"
    class="blog-card__arrow"
    onclick="event.stopPropagation()"
    aria-label="Czytaj artykuł"
    >→</a
  >
</article>
```

Upewnij się, że nowa karta jest umieszczana wewnątrz `<div class="blog-cards">`
w pliku `site-src/pages/blog.html`.
Po dodaniu nowej karty, uruchom `npm run build` w celu skompilowania zmian.

---

## Zasoby

- **Szablon HTML (obowiązkowy):** [`../hub-spoke-seo-parser/assets/base-template.html`](../hub-spoke-seo-parser/assets/base-template.html)
- **Wzorzec gotowego artykułu:** `site-src/blog/rozdzielnosc-majatkowa/index.html`
- Paleta kolorów serwisu: `#4D2C26` (brąz), `#EAE3D9` (pergamin),
  `#A0614F` (terakota), `#2D2926` (antracyt)
