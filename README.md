# 🏟️ ScoutPro: Professional Football Intelligence Platform

![ScoutPro Hero Banner](file:///C:/Users/akraw/.gemini/antigravity/brain/a86ec4a0-ed77-4e10-b21d-a7fee0bd85a2/scoutpro_hero_banner_1777399828578.png)

> **„Gdzie dane spotykają się z instynktem skauta, tam rodzą się legendy.”**

**ScoutPro** to nie jest kolejna aplikacja do statystyk. To zaawansowany system operacyjny dla nowoczesnego skautingu, który łączy surową moc danych z **Statorium API** oraz genialną analitykę **Claude 3.5 Sonnet**. Wszystko to podane w unikalnej, dopaminowej estetyce **Neubrutalist**.

---

## ⚡ Główne Moduły Inteligencji

### 🧠 AI Scout Narrative (The Brain)
Nasz system nie tylko pokazuje liczby — on je rozumie. Wykorzystując model **Claude 3.5 Sonnet**, ScoutPro generuje:
-   **Opisowe profile zawodników**: Automatyczne wykrywanie mocnych i słabych stron.
-   **Rekomendacje taktyczne**: Analiza, czy zawodnik pasuje do stylu gry Twojego trenera.
-   **Raporty "Executive Summary"**: Gotowe do wysłania do zarządu w 5 sekund.

### ⚖️ Advanced Compatibility Engine
Nasz autorski algorytm oceny przydatności zawodnika do konkretnego klubu. Nie oceniamy zawodnika "w próżni" — oceniamy go w kontekście Twojej drużyny:
-   **Tactical DNA Match (30%)**: Porównanie pressing, tempo i stylu posiadania piłki.
-   **Positional Intensity (25%)**: Jak bardzo potrzebujesz wzmocnienia na danej pozycji?
-   **Normalized Stats (25%)**: Średnia ważona z kategorii ofensywnych i defensywnych.
-   **Current Form (12%)**: Stabilność formy w ostatnich 5 meczach.
-   **History Match (8%)**: Podobieństwo do historycznych sukcesów transferowych klubu.

### 🛡️ Transfer War Room & Watchlist
Dynamiczne zarządzanie Twoimi celami transferowymi:
-   **Kanban Workflow**: Przeciągaj zawodników od "Obserwowany" do "Podpisany".
-   **Real-time Alerts**: Powiadomienia o zmianach statusu i nowych meczach Twoich celów.
-   **Priority Matrix**: Automatyczne sortowanie listy życzeń na podstawie Twoich potrzeb.

### 📋 Scouting Jobs (Dynamic Assignments)
Poczuj dreszcz emocji dzięki systemowi zleceń:
-   **AI-Generated Assignments**: Otrzymuj zadania skautingowe prosto od wirtualnych klubów.
-   **Real-world Context**: Zlecenia bazują na rzeczywistych brakach w składach topowych drużyn Europy.
-   **Progress Tracking**: Monitoruj swoje postępy i buduj reputację eksperta.

### 🗺️ Squad Intelligence & Tactical Hub
-   **Formation Detection**: Automatyczna analiza najczęściej używanych formacji.
-   **Squad Depth Map**: Gdzie masz dziury w składzie? My to wiemy.
-   **League Overview**: Interaktywne mapy i statystyki całych lig.

---

## 🛠️ Architektura i Stack Technologiczny

Zbudowany z myślą o ekstremalnej wydajności i skalowalności:

| Warstwa | Technologia | Opis |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (App Router) | React 19, Server Components, SSR |
| **Baza Danych** | Supabase (PostgreSQL) | Real-time updates, Auth, Row Level Security |
| **Stylizacja** | Tailwind CSS 4 | Future-proof architecture, Neubrutalist design |
| **Silnik AI** | Anthropic Claude 3.5 | Najwyższa jakość analizy tekstowej i danych |
| **Data Source** | Statorium API | Profesjonalne dane meczowe i zawodnicze |
| **Wizualizacje** | Recharts / Framer Motion | Płynne, animowane wykresy i przejścia |

---

## 📂 Mapa Projektu (Deep Dive)

```text
scoutPro/
├── src/
│   ├── app/ (Dashboard Engine)
│   │   ├── (dashboard)/        # Chronione trasy panelu skauta
│   │   ├── api/                # Endpointy dla AI i webhooków
│   │   └── actions/            # Server Actions dla operacji DB
│   ├── components/
│   │   ├── dashboard/          # Moduły specyficzne dla skautingu
│   │   ├── charts/             # Radar charts, heatmaps, bar charts
│   │   └── ui/                 # Baza Neubrutalist (shadcn extension)
│   ├── lib/
│   │   ├── engine/             # Algorytmy obliczania ocen i wag
│   │   ├── statorium/          # Klient API i normalizacja danych
│   │   └── supabase/           # Konfiguracja klienta DB i typów
│   └── hooks/                  # Data fetching & state management
├── supabase/                   # Migracje SQL i definicje funkcji
└── public/                     # Assets & Branded Icons
```

---

## 🚦 Szybki Start (Dla Deweloperów)

### 1. Przygotowanie środowiska
Potrzebujesz Node.js 18+ oraz dostępu do Supabase.

### 2. Konfiguracja zmiennych (`.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=twoj_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=twoj_klucz
STATORIUM_API_KEY=twoj_klucz_statorium
ANTHROPIC_API_KEY=twoj_klucz_claude
```

### 3. Uruchomienie
```bash
npm install
npm run dev
```

---

## 🛡️ Standardy Jakości i Rozwój

-   **Strict TypeScript**: 100% type safety.
-   **Clean Architecture**: Separacja logiki biznesowej od warstwy prezentacji.
-   **Performance**: Optymalizacja LCP i INP dzięki natywnemu SSR.
-   **Design Tokens**: Spójna paleta barw i typografii zdefiniowana w `globals.css`.

---

> [!IMPORTANT]
> ScoutPro jest w fazie intensywnego rozwoju. Jeśli znajdziesz buga lub masz pomysł na nową metrykę — otwórz Issue!

**Twórz historię futbolu z ScoutPro. ⚽🏆**
