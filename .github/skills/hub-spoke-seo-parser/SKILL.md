---
name: hub-spoke-seo-parser
description: >
  Deterministyczny parser treści i architekt SEO. Użyj gdy chcesz przekształcić
  surowy tekst edukacyjny lub prawny w strukturę plików HTML Hub & Spoke
  (jeden Artykuł Filarowy index.html + N Artykułów Wspierających).
  Triggeruje na: "artykuł", "blog", "Hub & Spoke", "SEO", "artykuł filarowy",
  "przekształć tekst", "wygeneruj HTML z tekstu".
argument-hint: "Wklej surowy tekst prawny/edukacyjny do przekształcenia"
---

# Hub & Spoke SEO Parser

Przekształca surowy tekst edukacyjny/prawny na gotowe pliki HTML wg modelu
Hub & Spoke, dopasowane wizualnie do serwisu kieleckinotariusz.pl.

## Kiedy używać

- Użytkownik dostarcza surowy tekst (prawny, edukacyjny, poradnikowy) i chce
  go opublikować na blogu.
- Trzeba podzielić materiał na artykuł filarowy + artykuły szczegółowe.
- Potrzebne są gotowe pliki HTML z nagłówkami SEO Long-Tail.

---

## REGUŁA KRYTYCZNA — ZERO HALUCYNACJI

**Bezwzględny zakaz** dodawania własnych myśli, przeredagowywania treści
merytorycznej, dopisywania wniosków lub tworzenia nowych akapitów.  
Dozwolone operacje:

1. Rozpoznanie struktury tekstu.
2. **Kopiowanie** oryginalnych fragmentów bez zmian.
3. Generowanie nagłówków SEO (H1, H2, `<title>`).
4. Otaczanie tekstu minimalistycznymi tagami HTML5.

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
4. Sformatuj treść wewnątrz `<article class="blog-prose">`:
   - pierwszy akapit: `<p class="blog-prose__lead">`
   - każdy podrozdział: `<div class="blog-prose__section"><h2>…</h2><p>…</p></div>`
   - `<strong>` dla kluczowych terminów prawnych/branżowych
5. Na końcu artykułu dodaj sekcję z linkami do spoke'ów:
   ```html
   <div class="blog-prose__related">
     <h2>Rozwiązania z praktyki</h2>
     <div class="blog-spoke-grid">
       <a href="./spoke-1-nazwa.html" class="blog-spoke-link">{H1 artykułu wspierającego 1}</a>
       <!-- ... pozostałe <a class="blog-spoke-link"> ... -->
     </div>
   </div>
   ```
6. Użyj szablonu z [`./assets/base-template.html`](./assets/base-template.html),
   wstawiając treść w miejsce `<!-- CONTENT -->`.
7. Zapisz jako `index.html` w nowym katalogu o nazwie opartej na temacie
   (np. `blog/darowizna-testament-dozywocie/`).

---

### FAZA 3 — Artykuły Wspierające (`spoke-[id]-nazwa.html`)

Dla każdego elementu z puli **[PRZYPADKI PRAKTYCZNE]**:

1. **Wygeneruj nagłówek Long-Tail H1** — precyzyjne, życiowe zapytanie
   użytkownika w wyszukiwarce.  
   Przykłady zamiany:
   | Oryginalny tytuł | Wygenerowany H1 |
   |---|---|
   | "Przypadek 1" | "Jak przekazać dom za opiekę i uniknąć zachowku?" |
   | "Q: Czy można..." | "Czy można odwołać darowiznę mieszkania?" |

2. Wklej **dokładnie** oryginalną treść przypadku — problem + rozwiązanie —
   bez żadnych przeróbek — opakuj akapity w `<p>` wewnątrz `<article class="blog-prose">`.

3. Na dole pliku dodaj link powrotny:
   ```html
   <p class="back-link">
     <a href="./index.html">← Wróć do artykułu: {H1 z index.html}</a>
   </p>
   ```

4. Wygeneruj przyjazną URL nazwę pliku z H1 (lowercase, bez polskich znaków,
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
`blog.html`. Wzorzec karty:

```html
<article class="blog-card">
  <div class="blog-card__body">
    <p class="blog-card__label">{Kategoria prawna}</p>
    <h2 class="blog-card__title">{H1 z index.html}</h2>
    <p class="blog-card__desc">{Pierwsze zdanie wstępu z index.html — bez zmian}</p>
    <a class="blog-card__link" href="{ścieżka}/index.html">Czytaj artykuł →</a>
    <div class="blog-card__sub">
      <p class="blog-card__sub-label">Artykuły szczegółowe</p>
      <div class="blog-card__sub-links">
        <!-- <a href="{spoke}"> dla każdego artykułu wspierającego -->
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
