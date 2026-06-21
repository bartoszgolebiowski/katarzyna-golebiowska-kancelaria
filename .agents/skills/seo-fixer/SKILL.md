---
name: seo-fixer
description: >
  Aplikuje poprawki SEO do plików HTML klastra na podstawie raportu z audytu.
  Uzupełnia brakujące meta tagi, naprawia linki wewnętrzne i formatowanie.
  Triggeruje na: "zastosuj poprawki SEO", "napraw artykuły", "wdróż meta tagi",
  "popraw linki wewnętrzne", "zastosuj raport audytu", "seo-fixer",
  "uzupełnij meta description", "napraw anchor text", "fix SEO".
argument-hint: "Podaj ścieżkę do katalogu klastra (audyt zostanie uruchomiony automatycznie)"
---

# SEO Fixer — Automatyczny Serwisant Klastra

Wczytuje raport z `seo-auditor-qa` i precyzyjnie aplikuje poprawki do plików
HTML klastra Hub & Spoke. Działa jak chirurg — dotyka tylko tego, co jest
zepsute.

## Kiedy używać

- Audyt `seo-auditor-qa` zwrócił status **Odrzucono** dla co najmniej jednego pliku.
- Trzeba wdrożyć wygenerowane meta tagi bezpośrednio do plików HTML.
- Trzeba naprawić brakujące linki powrotne do Artykułu Filarowego.
- Trzeba usunąć puste nagłówki lub naprawić hierarchię H1→H2→H3.

---

## REGUŁA KRYTYCZNA — MINIMALNY DOTYK

Zmieniasz **wyłącznie** elementy wskazane w raporcie audytu.  
**Bezwzględny zakaz** modyfikowania:

- Treści merytorycznej artykułu (akapitów, list, cytatów).
- Istniejących, poprawnych linków wewnętrznych.
- Struktury `<body>` poza wskazanymi miejscami.
- Istniejących, poprawnych tagów meta.

Każda zmiana musi mieć pokrycie w raporcie audytu.

---

## PIPELINE NAPRAWY

### KROK 1 — Pozyskanie raportu audytu

**Przypadek A — Raport dostarczony w konwersacji:**
Wyodrębnij z raportu listę problemów per plik.

**Przypadek B — Brak raportu:**
Uruchom skill `seo-auditor-qa` dla wskazanego klastra, a następnie kontynuuj
z uzyskanym raportem.

Zbuduj wewnętrzną listę zadań w formacie:

```
[plik] → [typ naprawy] → [dane do wstawienia]
```

Przykład:
```
spoke-1-dom-corka-dozywocie-opieka.html → BRAK_LINKU_FILAROWEGO → dodaj link do index.html
spoke-3-mieszkanie-wnuczka.html        → META_TITLE             → "Dom dla wnuczki – Notariusz Kielce"
spoke-3-mieszkanie-wnuczka.html        → META_DESC              → "Czy można..."
```

---

### KROK 2 — Naprawa META TITLE i META DESCRIPTION

Dla każdego pliku z problemem `META_TITLE` lub brakującym `<title>`:

1. Wczytaj plik z dysku (`read_file`).
2. Znajdź sekcję `<head>`.
3. **Jeśli `<title>` istnieje** — zamień jego zawartość na wartość z raportu.
4. **Jeśli `<title>` brakuje** — wstaw przed `</head>`:
   ```html
   <title>{wartość z raportu}</title>
   ```
5. Analogicznie dla `<meta name="description" content="...">`:
   - Jeśli istnieje — zaktualizuj atrybut `content`.
   - Jeśli brakuje — wstaw po tagu `<title>`:
     ```html
     <meta name="description" content="{wartość z raportu}" />
     ```
6. Zapisz plik (`replace_string_in_file`).

---

### KROK 3 — Naprawa brakujących linków do Artykułu Filarowego

Dla każdego Artykułu Wspierającego z problemem `BRAK_LINKU_FILAROWEGO`:

1. Wczytaj plik.
2. Pobierz H1 z Artykułu Filarowego (`index.html`) — potrzebny do anchor textu.
3. Znajdź ostatni element `<p>` lub `</article>` w treści głównej.
4. Wstaw bezpośrednio przed `</article>` (lub przed `</main>` jeśli brak
   `<article>`):
   ```html
   <p class="back-link">
     <a href="./index.html">← Wróć do: {H1 z index.html}</a>
   </p>
   ```
5. Zapisz plik.

---

### KROK 4 — Naprawa anchor textów

Dla każdego linku z problemem `ANCHOR_GENERYCZNY` lub `ANCHOR_DUPLIKAT`:

1. Wczytaj plik zawierający problematyczny link.
2. Wygeneruj nowy anchor text:
   - Musi opisywać temat docelowej strony (nie czynność kliknięcia).
   - Musi być unikalny w skali klastra (sprawdź pozostałe pliki).
   - Maksymalnie 7 słów.
   - Zachowaj naturalny język polski.
3. Zamień tekst zakotwiczenia zachowując atrybut `href` bez zmian.
4. Zapisz plik.

---

### KROK 5 — Naprawa pustych nagłówków

Dla każdego pliku z problemem `PUSTY_NAGLOWEK`:

1. Wczytaj plik.
2. Znajdź nagłówek bez treści (np. `<h2></h2>`, `<h2> </h2>`,
   `<h2>&nbsp;</h2>`).
3. **Jeśli nagłówek poprzedza blok treści** — wygeneruj krótki,
   tematyczny tytuł (max 6 słów) na podstawie następującego po nim tekstu.
4. **Jeśli nagłówek jest całkowicie izolowany** — usuń tag nagłówka.
5. Zapisz plik.

---

### KROK 6 — Naprawa hierarchii nagłówków

Dla każdego pliku z problemem `HIERARCHIA_NAGLOWKOW`:

1. Wczytaj plik.
2. Przemapuj tagi nagłówków, aby przywrócić ciągłość (h1→h2→h3):
   - Zamień `<h3>` pojawiające się bezpośrednio po `<h1>` na `<h2>`.
   - Jeśli istnieje drugi `<h1>` — zamień go na `<h2>`.
3. Zachowaj klasy CSS (`class="..."`) na zmienianych tagach.
4. Zapisz plik.

---

### KROK 7 — Raport po naprawie

Po wykonaniu wszystkich zmian wygeneruj krótki raport:

```
KLASTER: [nazwa katalogu]
ZASTOSOWANE POPRAWKI:

  spoke-1-dom-corka.html
    ✅ Dodano link do index.html
    ✅ Zaktualizowano <meta description>

  index.html
    ✅ Zaktualizowano <title>
    ✅ Zaktualizowano <meta description>

PLIKI BEZ ZMIAN: [lista]

ZALECENIE: Uruchom ponownie seo-auditor-qa, aby potwierdzić brak błędów.
```

---

## PRZYKŁADOWE WYZWALACZE

- "Zastosuj poprawki SEO z raportu audytu"
- "Wdróż meta tagi do artykułów klastra testament-darowizna-dozywocie"
- "Napraw brakujące linki wewnętrzne w spoke'ach"
- "Uzupełnij meta description we wszystkich artykułach"
- "Popraw artykuły odrzucone przez audyt"
