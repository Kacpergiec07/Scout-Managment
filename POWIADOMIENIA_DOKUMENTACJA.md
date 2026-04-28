# System Powiadomień - Dokumentacja

## 📱 Przegląd Systemu

System powiadomień Scout Pro zapewnia **rzeczywiste dane transferowe** z Twittera, forów piłkarskich i RSS feedów. Panel zawsze wyświetla się **z przodu** (z-index: 999999) i nie jest zasłaniany przez inne elementy.

## 🎯 Główne Funkcje

### ✅ Zrealizowane Ulepszenia

1. **Panel z przodu**
   - Panel powiadomień ma `z-index: 999999`
   - Zawsze wyświetla się nad innymi elementami
   - Poprawione pozycjonowanie (top: 72px, right: 8px)

2. **Rzeczywiste dane z Twittera**
   - Integracja z Twitter API v2
   - Pobiera tweety od sprawdzonych źródeł (Romano, Ornstein, Meczyki.pl, itp.)
   - Automatyczna analiza treści tweetów

3. **RSS Feedy z portali piłkarskich**
   - Meczyki.pl, Weszło, Transfery.info
   - The Athletic, Sky Sports
   - Automatyczne filtrowanie treści transferowych

4. **Animacje i UX**
   - Płynne animacje wejścia elementów
   - Interaktywne przyciski z efektami hover
   - Animowane ikony i wskaźniki

## 🔧 Konfiguracja

### Opcja 1: Twitter API (Najlepsza jakość danych)

1. **Uzyskaj Twitter Bearer Token**
   - Wejdź na: https://developer.twitter.com/en/portal/dashboard
   - Utwórz nową aplikację
   - Skopiuj Bearer Token

2. **Skonfiguruj .env.local**
   ```bash
   NEXT_PUBLIC_TWITTER_BEARER_TOKEN=twój_bearer_token_tutaj
   ```

3. **Restart aplikacji**
   ```bash
   npm run dev
   ```

### Opcja 2: RSS Feeds (Bez konieczności API)

System automatycznie używa RSS feedów gdy Twitter API nie jest skonfigurowane. Nie wymaga dodatkowej konfiguracji.

### Opcja 3: Dane testowe (Fallback)

Gdy żadne źródło realne nie jest dostępne, system używa danych testowych z popularnymi plotkami transferowymi.

## 📊 Hierarchia Źródeł Danych

System próbuje pobrać dane w tej kolejności:

1. **Twitter API** (najwyższa priorytet)
   - Najnowsze tweety od sprawdzonych źródeł
   - Rzeczywiste dane transferowe

2. **RSS Feedy** (druga priorytet)
   - Publiczne feedy z portali piłkarskich
   - Artykuły i newsy transferowe

3. **Dane testowe** (fallback)
   - Realistyczne plotki transferowe
   - Gdy inne źródła są niedostępne

## 🎨 Dostosowanie Wyglądu

### Zmiana pozycji panelu
```typescript
// W notifications-panel.tsx
className="fixed top-[72px] right-8 ..." // Zmień top/right według potrzeb
```

### Dodanie nowych źródeł Twitter
```typescript
// W twitter-integration.ts
accounts: [
  'FabrizioRomano',
  'TwojeKonto',  // Dodaj tutaj
  // ...
]
```

### Dodanie nowych RSS feedów
```typescript
// W rss-feeds.ts
const FOOTBALL_RSS_FEEDS = {
  twojportal: {
    name: 'Twój Portal',
    url: 'https://twojportal.pl/feed',
    type: 'transfer',
    icon: '🏴'
  }
}
```

## 🔍 Monitorowanie Konsoli

System loguje informacje o źródłach danych:

- `✅ Fetched X real transfer news items from Twitter` - Twitter API działa
- `✅ Fetched X transfer news items from RSS feeds` - RSS działa
- `📋 Using mock data as fallback` - Użyto danych testowych

## 📱 Użytkowanie

### Otwieranie panelu
- Kliknij ikonę dzwonka w prawym górnym rogu
- Panel pojawi się z animacją z góry

### Przeglądanie newsów
- Każdy element pokazuje źródło, pewność info i czas
- Kliknij element, aby oznaczyć jako przeczytany
- Kliknij przycisk źródła, aby otworzyć oryginalny post

### Filtry ligowe
- Użyj zakładek na górze panelu do filtrowania po ligach
- (Wymaga dodatkowej implementacji logiki filtrowania)

### Odświeżanie
- Kliknij ikonę odświeżania 🔄 w nagłówku
- Automatyczne odświeżanie co 10 minut

## 🚀 Przykładowy Kod Użycia

```typescript
// W dowolnym komponencie
import { getTrendingNews } from '@/lib/trending-news'

async function loadNews() {
  const news = await getTrendingNews()
  console.log(`Pobrano ${news.length} newsów`)
  return news
}
```

## ⚡ Optymalizacja

- **Caching**: Dane są cache'owane na 10 minut
- **Lazy Loading**: Komponenty ładują się asynchronicznie
- **Animation Performance**: Używa CSS transforms dla wydajności

## 🐛 Rozwiązywanie Problemów

### Panel nie wyświetla się z przodu
- Sprawdź czy `z-index: 999999` jest ustawione
- Upewnij się, że `position: fixed` jest aktywne

### Brak danych z Twittera
- Sprawdź czy Bearer Token jest poprawny
- Upewnij się, że token ma odpowiednie uprawnienia
- Sprawdź konsolę przeglądarki pod kątem błędów

### RSS Feedy nie działają
- Sprawdź czy URL feedy są poprawne
- Niektóre portale mogą wymagać CORS proxy
- Sprawdź konsolę pod kątem błędów CORS

## 📈 Statystyki

- **Źródła Twitter**: 10+ sprawdzonych kont
- **RSS Feedy**: 6+ portali piłkarskich
- **Czas odświeżania**: 10 minut
- **Maksymalna liczba newsów**: 50

## 🎯 Planowane Rozwinięcia

- [ ] Dodanie więcej źródeł Twitter
- [ ] Integracja z API forów (Reddit, etc.)
- [ ] Personalizowane filtry
- [ ] Powiadomienia push
- [ ] Historia przeczytanych newsów

---

**Wersja**: 1.0.0
**Ostatnia aktualizacja**: 2026-04-28
**Status**: ✅ Produkcja
