# ScoutPro 🏟️ — Przyszłość Skautingu Piłkarskiego

[![Next.js](https://img.shields.io/badge/Next.js-15.1.7-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![AI Engine](https://img.shields.io/badge/AI_Engine-Anthropic-7565F1?style=for-the-badge&logo=anthropic)](https://anthropic.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

**ScoutPro** to zaawansowana platforma analityczna dla skautów i dyrektorów sportowych, łącząca dane statystyczne z potężnym silnikiem AI, aby przekształcić surowe liczby w strategiczne decyzje transferowe.

---

## 🖼️ Widok Platformy

Platforma wykorzystuje unikalny styl **Neubrutalist**, zapewniający maksymalną czytelność i nowoczesny, surowy charakter.

| Dashboard | Analiza Porównawcza |
| :---: | :---: |
| ![Dashboard](/screenshots/dashbord.png) | ![Compare](/screenshots/comparePlayers1.png) |

| Lista Obserwowana | Historia Transferowa |
| :---: | :---: |
| ![Watchlist](/screenshots/watchlist.png) | ![History](/screenshots/history.png) |

---

## 🚀 Kluczowe Moduły

-   **🎯 Inteligentny Dashboard**: Podgląd na żywo najważniejszych parametrów ligowych i zawodników z wykorzystaniem radarowych wykresów wydajności.
-   **⚖️ Zaawansowana Porównywarka**: Precyzyjne zestawienie dwóch graczy oparte na 5-kategorycznym algorytmie wagowym.
-   **🤖 AI Scout Intelligence**: Automatyczne generowanie uzasadnień skautingowych przez modele Claude 3.5 Sonnet.
-   **📋 Dynamiczna Watchlista**: Zarządzanie talentami w stylu Kanban z możliwością eksportu raportów do formatu PDF.
-   **🌍 Inteligentna Mapa Intel**: Wizualizacja zasięgu skautingowego i lokalizacji scoutów na całym świecie.

---

## 🛠️ Stack Technologiczny

### Frontend & Core
- **Next.js 15 (App Router)** – Fundament wysokowydajnej aplikacji SSR.
- **React 19** – Najnowsze funkcje reaktywności i hooków.
- **Tailwind CSS 4** – Nowoczesne, rewolucyjne podejście do stylizacji.
- **Framer Motion** – Płynne mikro-animacje i przejścia.

### Data & AI
- **Anthropic AI SDK** – Integracja z modelami Claude dla inteligentnej analizy.
- **Supabase SSR** – Bezpieczna autoryzacja i szybka baza danych PostgreSQL.
- **Recharts** – Czytelne wizualizacje statystyk zawodników.
- **Three.js / React Three Fiber** – Zaawansowane komponenty 3D (np. Globe).

### Raportowanie & Narzędzia
- **jsPDF / html2canvas** – Generowanie profesjonalnych raportów PDF w locie.
- **Zod** – Pełna typizacja i walidacja danych schematycznych.

---

## 📁 Struktura Projektu

Aplikacja postępuje zgodnie z nowoczesnymi wzorcami modularnymi:

```text
scoutPro/
├── app/                # Trasy i strony Next.js (App Router)
├── components/         # Komponenty UI (Atomic Design)
├── hooks/              # Reużywalna logika i zapytania API
├── lib/                # Serce aplikacji: API clients, utils, stany
├── public/             # Aktywa statyczne (ikony, zrzuty ekranu)
├── docs/               # Dokumentacja projektowa i raporty
│   └── reports/        # Archiwalne raporty z implementacji
├── scripts/            # Skrypty automatyzacji i migracji
├── adapters/           # Warstwa transformacji danych statystycznych
└── scratch/            # Brudnopis i pliki tymczasowe
```

---

## 🚦 Rozpoczęcie Pracy

1.  **Klonowanie repozytorium**
2.  **Instalacja zależności**:
    ```bash
    npm install
    ```
3.  **Konfiguracja środowiska**:
    Stwórz plik `.env.local` i uzupełnij klucze:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
    STATORIUM_API_KEY=your_key
    ANTHROPIC_API_KEY=your_key
    ```
4.  **Uruchomienie serwera deweloperskiego**:
    ```bash
    npm run dev
    ```

---

## 👨‍💻 Opracowanie

Projekt rozwijany przy wsparciu **Antigravity AI Coding Assistant**. Skupiony na dostarczaniu najwyższej jakości doświadczeń użytkownika i precyzyjnych danych sportowych.
