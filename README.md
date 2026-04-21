# ScoutPro 🏟️ — Professional Football Intelligence

**ScoutPro** to zaawansowana platforma analityczna zaprojektowana dla skautów, dyrektorów sportowych i analityków piłkarskich. System łączy surowe dane statystyczne z nowoczesną sztuczną inteligencją, dostarczając precyzyjnych rekomendacji transferowych w unikalnej estetyce **Neubrutalist**.

---

## ✨ Kluczowe Możliwości

Aplikacja została zaprojektowana z myślą o maksymalnej efektywności pracy skauta:

-   **🎯 Unified Dashboard**: Centralne centrum dowodzenia z podglądem na żywo kluczowych parametrów ligowych.
-   **⚖️ Compare Engine**: Zaawansowany algorytm porównujący oparty na 5-kategorycznym systemie wagowym, umożliwiający obiektywną ocenę zawodników.
-   **🤖 AI Scout Narrative**: Integracja z modelami Claude 3.5 Sonnet, która generuje tekstowe uzasadnienia i analizy opisowe dla każdego profilu.
-   **📋 Talent Pipeline**: Dynamiczne zarządzanie watchlistą w systemie Kanban z funkcją priorytetyzacji celów transferowych.
-   **📑 Branded Exports**: Generowanie profesjonalnych raportów PDF gotowych do przedstawienia zarządowi klubu.
-   **🌍 Global Intel Map**: Interaktywna wizualizacja zasięgu skautingowego i przepływów transferowych.

---

## 🛠️ Architektura i Technologie

Projekt wykorzystuje najnowocześniejszy stack technologiczny, zapewniający szybkość i skalowalność:

| Warstwa | Technologia |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router) / React 19 |
| **Stylizacja** | Tailwind CSS 4 (Future-proof) |
| **Baza danych** | Supabase (PostgreSQL / SSR) |
| **Silnik AI** | Anthropic Claude 3.5 Sonnet |
| **Wizualizacje** | Recharts & React Three Fiber |
| **Walidacja** | Zod & React Hook Form |

---

## 📂 Struktura Projektu (Clean Architecture)

Zastosowano model **Source Folder**, aby oddzielić logikę biznesową od konfiguracji systemowej:

```text
scoutPro/
├── src/                # Główne źródło aplikacji
│   ├── app/            # Trasy, layouty i logika stron (SSR/Client)
│   ├── components/     # UI: scout-specific oraz generyczne (shadcn)
│   ├── hooks/          # Niestandardowa logika stanu i data-fetching
│   ├── lib/            # Silniki obliczeniowe, utils, API clients
│   └── middleware.ts   # Logika zabezpieczeń i przekierowań
├── docs/               # Dokumentacja, archiwa i zasady projektowe
├── public/             # Zasoby statyczne i assets
├── scripts/            # Skrypty automatyzacji i maintenance
└── tests/              # (Opcjonalnie) Testy jednostkowe i E2E
```

---

## 🚦 Szybki Start

Aby uruchomić projekt lokalnie, postępuj zgodnie z poniższymi instrukcjami:

### 1. Przygotowanie
Upewnij się, że masz zainstalowany **Node.js 18+** oraz system **NPM**.

### 2. Instalacja
```bash
npm install
```

### 3. Konfiguracja
Stwórz plik `.env.local` w katalogu głównym:
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
STATORIUM_API_KEY=...
ANTHROPIC_API_KEY=...
```

### 4. Deweloperka
```bash
npm run dev
```

---

## 🛡️ Standardy Jakości

Projekt utrzymuje rygorystyczne standardy kodowania:
-   **Type Safety**: Pełna implementacja TypeScript.
-   **Performance**: Optymalizacja Core Web Vitals dzięki Next.js SSR.
-   **Design Consistency**: Ścisłe przyleganie do tokenów projektowych Neubrutalist.

*System monitorowany i wspierany przez Antigravity AI.*
