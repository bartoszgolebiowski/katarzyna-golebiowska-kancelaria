---
name: seo-auditor-qa
description: >
  Niezależny Audytor SEO i kontroler jakości (QA). Użyj jako ostatni punkt
  kontrolny przed publikacją artykułów na blogu kancelarii.
  Triggeruje na: "audyt SEO", "sprawdź artykuły", "kontrola jakości", "QA blog",
  "meta title", "meta description", "linki wewnętrzne", "anchor text",
  "walidacja klastra", "zatwierdź artykuł", "raport SEO".
argument-hint: "Podaj ścieżkę do katalogu klastra lub listę plików HTML do audytu"
---

# SEO Auditor & QA — Kontroler Jakości Klastra

Przeprowadza techniczny audyt plików HTML klastra Hub & Spoke i generuje
raport walidacyjny gotowy do decyzji publikacyjnej.

## Kiedy używać

- Klaster artykułów (Filarowy + Wspierające) jest gotowy do publikacji.
- Trzeba sprawdzić spójność linkowania wewnętrznego.
- Potrzebne są gotowe tagi `<meta>` dla każdego artykułu.
- Przed wdrożeniem na serwer produkcyjny.

---

## REGUŁA KRYTYCZNA — ROLA AUDYTORA

Działasz wyłącznie jako **kontroler**, nie jako redaktor.  
**Nie zmieniasz** treści merytorycznej artykułów.  
Dozwolone operacje:

1. Odczyt i analiza plików HTML z klastra.
2. Wykrywanie problemów strukturalnych i SEO.
3. Generowanie tagów meta na podstawie istniejących treści.
4. Wydanie werdyktu: **Zatwierdzono** lub **Odrzucono**.

---

## PIPELINE AUDYTU

### KROK 1 — Identyfikacja klastra

Znajdź wszystkie pliki HTML w katalogu klastra:

- **Artykuł Filarowy**: `index.html` w katalogu klastra.
- **Artykuły Wspierające**: `spoke-*.html` w tym samym katalogu.

Użyj narzędzi file_search i read_file, aby wczytać każdy plik.

---

### KROK 2 — Weryfikacja linkowania wewnętrznego

Dla każdego **Artykułu Wspierającego** sprawdź:

**KONTROLA 2.1 — Obecność linku do Artykułu Filarowego**

- Czy istnieje co najmniej jeden `<a href="...index.html">` lub `<a href=".">`
  wskazujący na Artykuł Filarowy?
- Wynik: ✅ Obecny / ❌ Brak (podaj nazwę pliku).

**KONTROLA 2.2 — Jakość anchor textów**

- Pobierz wszystkie teksty zakotwiczenia linków wewnętrznych w klastrze.
- Czy teksty brzmią naturalnie (nie są generyczne: "kliknij tutaj", "więcej")?
- Czy żaden anchor text nie powtarza się dokładnie w więcej niż 2 miejscach?
- Wynik: ✅ Naturalny / ⚠️ Zduplikowany (podaj tekst i liczbę wystąpień) /
  ❌ Generyczny (podaj przykład).

---

### KROK 3 — Weryfikacja formatowania HTML

Dla **każdego** pliku w klastrze sprawdź:

**KONTROLA 3.1 — Puste nagłówki**

- Czy istnieją tagi `<h1>`, `<h2>`, `<h3>` bez treści lub z samymi
  spacjami/znacznikami?
- Wynik: ✅ Brak / ❌ Znaleziono (podaj plik i numer linii).

**KONTROLA 3.2 — Hierarchia nagłówków**

- Czy w pliku istnieje dokładnie jeden `<h1>`?
- Czy kolejność `h1 → h2 → h3` nie ma "przeskoków" (np. h1 → h3)?
- Wynik: ✅ Poprawna / ❌ Błąd (podaj szczegóły).

**KONTROLA 3.3 — Obecność elementów meta**

- Czy `<head>` zawiera `<title>`, `<meta name="description">`,
  `<meta name="robots">`?
- Wynik: ✅ Kompletny / ⚠️ Brakuje: [lista elementów].

---

### KROK 4 — Generowanie tagów Meta

Dla **każdego** pliku wygeneruj:

**META TITLE** (do 60 znaków):

- Musi zawierać główną frazę kluczową artykułu.
- Format dla Artykułu Filarowego:
  `{Główna fraza} | Kancelaria Notarialna Katarzyna Gołębiowska`
- Format dla Artykułu Wspierającego:
  `{Szczegółowa fraza} – Notariusz Kielce`
- Sprawdź długość. Jeśli > 60 znaków, skróć zachowując frazę kluczową.

**META DESCRIPTION** (do 155 znaków):

- Musi zawierać główną frazę kluczową.
- Musi zawierać Call to Action (np. "Dowiedz się więcej", "Sprawdź",
  "Skonsultuj z notariuszem").
- Język: naturalny, zachęcający, bez clickbaitu.
- Sprawdź długość. Jeśli > 155 znaków, skróć zachowując CTA.

---

### KROK 5 — Raport Walidacyjny

Wygeneruj raport w następującym formacie dla każdego pliku:

```
---
PLIK: [nazwa_pliku.html]
WERDYKT: ✅ Zatwierdzono | ❌ Odrzucono

PROBLEMY (jeśli Odrzucono):
- [opis problemu z kontroli 2.1 / 2.2 / 3.1 / 3.2 / 3.3]

META TITLE ({N} znaków):
[wygenerowany tytuł]

META DESCRIPTION ({N} znaków):
[wygenerowany opis]
---
```

Na końcu raportu dodaj **PODSUMOWANIE KLASTRA**:

```
KLASTER: [nazwa katalogu]
ŁĄCZNA LICZBA PLIKÓW: N
ZATWIERDZONO: X
ODRZUCONO: Y (lista plików)
GOTOWOŚĆ DO PUBLIKACJI: ✅ TAK | ❌ NIE — wymagane poprawki
```

---

## PRZYKŁADOWE WYZWALACZE

- "Przeprowadź audyt SEO klastra testament-darowizna-dozywocie"
- "Sprawdź artykuły przed publikacją"
- "Zrób QA bloga i wygeneruj meta tagi"
- "Walidacja klastra Hub & Spoke"
- "Czy artykuły są gotowe do wdrożenia?"
