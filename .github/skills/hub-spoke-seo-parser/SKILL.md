---
name: hub-spoke-seo-parser
description: >
  Deterministyczny parser treści i architekt SEO. Przekształca surowy tekst 
  prawny dostarczony przez użytkownika w strukturę plików HTML Hub & Spoke
  (index.html + spoke-N.html), zachowując 100% oryginalnej treści.
  Tekst został przygotowany przez prawników i NIE może być modyfikowany 
  ani parafrazowany.
  Triggeruje na: "artykuł", "blog", "Hub & Spoke", "SEO", "artykuł filarowy",
  "przekształć tekst", "wygeneruj HTML z tekstu".
argument-hint: "Wklej surowy tekst prawny/edukacyjny do przekształcenia"
---

# Hub & Spoke SEO Parser

Przekształca surowy tekst prawny na gotowe pliki HTML wg modelu Hub & Spoke, 
zoptymalizowane pod SEO, przy jednoczesnym zachowaniu nienaruszonej treści 
autorskiej (prawniczej).

## Kiedy używać

- Użytkownik dostarcza tekst opracowany przez prawników i chce go opublikować.
- Treść musi pozostać w pierwotnej postaci (brak zmian w słownictwie, 
  strukturze zdań czy argumentacji).
- Trzeba podzielić materiał na artykuł filarowy + artykuły wspierające (spoke).
- Potrzebna jest architektura SEO (nagłówki Long-Tail, meta tagi).

---

## REGUŁA KRYTYCZNA — NIENARUSZALNOŚĆ TREŚCI PRAWNEJ

**Tekst wejściowy jest dokumentem prawnym.** Bezwzględny zakaz:
1. Parafrazowania lub "upraszczania" języka.
2. Usuwania fragmentów, które wydają się "niepotrzebne".
3. Dodawania własnych wniosków, interpretacji lub "rad od AI".
4. Zmieniania kolejności informacji w obrębie danego akapitu/sekcji.

**Dozwolone operacje (Optymalizacja SEO):**
1. Rozpoznanie logicznej struktury tekstu (co jest bazą, co przykładem).
2. Wygenerowanie atrakcyjnych dla Google nagłówków SEO (`H1`, `H2`, `<title>`) 
   na podstawie treści (bez jej zmieniania).
3. Opakowanie oryginalnego tekstu w tagi HTML (`<p>`, `<ul>`, `<li>`).
4. Dodanie linkowania wewnętrznego między HUBem a SPOKE'ami.

---

## PIPELINE EGZEKUCJI

### FAZA 1 — Analiza wzorca

Przeanalizuj dostarczony tekst i podziel go na dwie pule:

- **[BAZA TEORETYCZNA]**: wstęp, definicje, zasady ogólne, podsumowanie —
  wszystko, co nie jest konkretnym przypadkiem.
- **[PRZYPADKI PRAKTYCZNE]**: wyliczone przykłady z życia, "typowe sprawy",
  Q&A, casusy, scenariusze krok-po-kroku.

---

### FAZA 2 — Artykuł Filarowy (`index.html`)

1. Weź całą **[BAZĘ TEORETYCZNĄ]**.
2. Wygeneruj `<h1>` odzwierciedlający główny temat materiału (fraza główna SEO).
3. Wygeneruj `<title>` w formacie: `{H1} | Kancelaria Notarialna Katarzyna Gołębiowska`.
4. Wygeneruj unikalny `<meta name="description">` (maks. 160 znaków) streszczający 
   temat prawny w sposób zachęcający do kliknięcia.
5. Sformatuj treść wewnątrz `<article class="blog-prose">`:
   - pierwszy akapit: `<p class="blog-prose__lead">`
   - każdy podrozdział: `<div class="blog-prose__section"><h2>…</h2><p>…</p></div>`
   - `<strong>` dla kluczowych terminów prawnych/branżowych
6. Na końcu artykułu dodaj sekcję z linkami do spoke'ów:
   ```html
   <div class="blog-prose__related">
     <h2>Rozwiązania z praktyki</h2>
     <div class="blog-spoke-grid">
       <a href="./spoke-1-nazwa.html" class="blog-spoke-link">{H1 artykułu wspierającego 1}</a>
       <!-- ... pozostałe <a class="blog-spoke-link"> ... -->
     </div>
   </div>
   ```
7. Użyj struktury z [`./assets/base-template.html`](./assets/base-template.html), 
   podmieniając:
   - `<title>`, `<meta name="description">`, `<link rel="canonical">` (na docelowy URL)
   - Breadcrumbs w HTML i JSON-LD (3 poziomy)
   - Wszystkie tagi Open Graph (`og:title`, `og:description`, `og:url`)
   - Treść artykułu wewnątrz `<article class="blog-prose">`
8. Zapisz jako `index.html` w nowym katalogu o nazwie opartej na temacie 
   (np. `blog/darowizna-testament-dozywocie/`).

---

### FAZA 3 — Artykuły Wspierające (`spoke-[id]-nazwa.html`)

Dla każdego elementu z puli **[PRZYPADKI PRAKTYCZNE]**:

1. **Wygeneruj nagłówek Long-Tail H1** — precyzyjne, życiowe zapytanie 
   użytkownika w wyszukiwarce. (Np. "Czy można odwołać darowiznę domu?").
2. Wygeneruj unikalny `<meta name="description">` dla każdego przypadku.
3. Wklej **DOKŁADNIE ORYGINALNĄ** treść przypadku — bez żadnych przeróbek — 
   opakuj akapity w `<p>` wewnątrz `<article class="blog-prose">`.
4. Na dole pliku dodaj link powrotny:
   ```html
   <p class="back-link">
     <a href="./index.html">← Wróć do artykułu: {H1 z index.html}</a>
   </p>
   ```
5. Wygeneruj przyjazną URL nazwę pliku z H1 (lowercase, bez polskich znaków).
6. Użyj struktury z Fazy 2, podmieniając meta tagi, breadcrumbs (4 poziomy) 
   oraz JSON-LD Schema.
   - Breadcrumb URL i Item dla poziomu 3 powinien wskazywać na HUB (`index.html`).
   - Breadcrumb poziomu 4 to aktualny SPOKE.
   myślniki zamiast spacji, np. `dom-opieka-zachowek.html`).

5. Użyj szablonu z Fazy 2 z dwoma różnicami dla spoke'a:
   - wrapper treści: `<div class="blog-article__wrap">` (bez klasy `wrap`)
   - breadcrumb 4-poziomowy:
     ```html
     <a href="../../index.html">Strona główna</a><span>/</span
     ><a href="../../blog.html">Blog</a><span>/</span
     ><a href="./index.html">{H1 z index.html}</a><span>/</span
     ><span>{H1 spoke'a}</span>
     ```

---

### FAZA 4 — Wynik wyjściowy

Zwróć bloki kodu HTML w następującej kolejności:

```
### index.html
{kod}

### spoke-1-nazwa.html
{kod}

### spoke-2-nazwa.html
{kod}
...
```

Zachowaj **100% zgodności znakowej** z oryginalnymi akapitami tekstowymi.

---

## Aktualizacja blog.html

Po wygenerowaniu plików zaproponuj użytkownikowi dodanie karty artykułu do 
`blog.html`. Wzorzec karty (SEO-friendly):

```html
<article class="blog-card">
  <div class="blog-card__body">
    <p class="blog-card__label">{Kategoria prawna}</p>
    <h2 class="blog-card__title">{H1 z index.html}</h2>
    <!-- Poniższy opis musi być dosłownym cytatem z tekstu prawnego -->
    <p class="blog-card__desc">{Pierwsze zdanie wstępu z index.html — absolutnie bez zmian}</p>
    <a class="blog-card__link" href="{ścieżka}/index.html">Czytaj artykuł →</a>
    <div class="blog-card__sub">
      <p class="blog-card__sub-label">Najczęstsze przypadki i pytania</p>
      <div class="blog-card__sub-links">
        <!-- <a href="{spoke}"> dla każdego artykułu wspierającego -->
      </div>
    </div>
  </div>
</article>
```
      </div>
    </div>
  </div>
</article>
```

Pamiętaj też o **odkomentowaniu** sekcji `blog-grid` w `blog.html` jeśli
jest zakomentowana.

---

## Zasoby

- Szablon HTML: [`./assets/base-template.html`](./assets/base-template.html)
- Paleta kolorów serwisu: `#4D2C26` (brąz), `#EAE3D9` (pergamin),
  `#A0614F` (terakota), `#2D2926` (antracyt)
