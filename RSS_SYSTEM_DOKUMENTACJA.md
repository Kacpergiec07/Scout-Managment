# System RSS Feedów - Dokumentacja

## 🔍 Przegląd

System RSS feedów pobiera rzeczywiste dane transferowe z publicznych RSS feedów portali piłkarskich. Jest to druga linia obrony po Twitter API.

## ⚙️ Konfiguracja

### Podstawowa konfiguracja (wymagana)

```bash
# .env.local
NEXT_PUBLIC_CORS_PROXY_URL=https://api.allorigins.win/raw?url=
```

### Źródła RSS

System jest podzielony na dwie kategorie źródeł:

#### 🟢 Niezawodne źródła (priorytetowe)
- Sky Sports (transfer news)
- BBC Sport (football)
- Goal.com (transfer news)
- ESPN FC (soccer)
- Guardian Football

#### 🟡 Źródła rezerwowe (fallback)
- Meczyki.pl
- Weszło
- Transfery.info
- Piłka Nożna

## 🚀 Jak to działa

### Hierarchia pobierania danych

1. **Twitter API** (jeśli skonfigurowany)
   - Najwyższa jakość danych
   - Wymaga `NEXT_PUBLIC_TWITTER_BEARER_TOKEN`

2. **RSS Feedy** (automatyczne)
   - Publiczne RSS feedy
   - Wymaga `NEXT_PUBLIC_CORS_PROXY_URL`

3. **Dane testowe** (ostateczny fallback)
   - Gdy wszystkie źródła zawiodą

### Proces pobierania RSS

```
1. Spróbuj bezpośrednie fetch (direct fetch)
   ↓ (nieudane)
2. Spróbuj przez CORS proxy
   ↓ (nieudane)
3. Zwróć pustą tablicę (pójdzie do kolejnego źródła)
```

## 🔧 Rozwiązywanie Problemów

### Problem: "Failed to fetch RSS feed"

**Przyczyny:**
1. Brak CORS proxy
2. Zablokowany URL przez przeglądarkę
3. Serwer nie obsługuje CORS
4. Timeout (10 sekund)

**Rozwiązania:**

1. **Skonfiguruj CORS proxy:**
   ```bash
   # .env.local
   NEXT_PUBLIC_CORS_PROXY_URL=https://api.allorigins.win/raw?url=
   ```

2. **Sprawdź konsolę przeglądarki:**
   ```javascript
   // Szukaj komunikatów:
   // 📡 Attempting direct fetch
   // ✅ Direct fetch successful
   // ⚠️ Direct fetch failed, trying CORS proxy
   // ❌ Error parsing RSS feed
   ```

3. **Testuj URL manualnie:**
   - Otwórz URL w przeglądarce
   - Sprawdź czy RSS jest dostępny
   - Sprawdź czy nie wymaga autoryzacji

### Problem: Brak danych z RSS

**Diagnostyka:**
```javascript
// W konsoli przeglądarki sprawdź:
// 🌐 Starting RSS news fetch...
// 📡 Fetching X reliable RSS sources
// ✅ BBC Sport: 15 items
// 📊 Total RSS items found: 15
```

**Rozwiązania:**

1. **Sprawdź czy feedy są aktywne:**
   ```bash
   curl https://feeds.bbci.co.uk/sport/football/rss.xml
   ```

2. **Zwiększ timeout:**
   ```typescript
   // W rss-feeds.ts
   const timeoutId = setTimeout(() => controller.abort(), 20000) // 20 sekund
   ```

3. **Sprawdź filtr transferowy:**
   ```typescript
   // W rss-feeds.ts
   const transferKeywords = [
     'transfer', 'signing', 'deal', // Dodaj więcej keywords
   ]
   ```

### Problem: CORS errors

**Symptomy:**
```
Access to fetch at 'https://example.com/feed' from origin 'http://localhost:3000'
has been blocked by CORS policy
```

**Rozwiązania:**

1. **Użyj CORS proxy (zalecane):**
   ```bash
   NEXT_PUBLIC_CORS_PROXY_URL=https://api.allorigins.win/raw?url=
   ```

2. **Lub proxy w Next.js:**
   ```typescript
   // next.config.js
   module.exports = {
     async rewrites() {
       return [
         {
           source: '/api/rss/:path*',
           destination: 'https://example.com/:path*',
         },
       ]
     },
   }
   ```

3. **Lub rozszerzenie przeglądarki:**
   - Zainstaluj "Allow CORS" dla development

## 📊 Monitoring

### Logi w konsoli

System loguje każdy krok:

```javascript
🔍 Starting news fetch...
🐦 Twitter API configured, fetching...
📰 Fetching RSS feeds...
📡 Fetching 5 reliable RSS sources
🔄 Fetching RSS from BBC Sport (https://feeds.bbci.co.uk/sport/football/rss.xml)
📡 Attempting direct fetch: https://feeds.bbci.co.uk/sport/football/rss.xml
✅ Direct fetch successful: 200
📄 RSS text length: 45678 characters
📋 Parsed 15 items from direct feed
✅ BBC Sport: 15 items
📊 Total RSS items found: 15
📋 Returning 15 RSS news items
```

### Status RSS Feedów

W stopce panelu powiadomień:
- 🟢 **Twitter/X** - jeśli Twitter API działa
- 🟢 **RSS Feeds** - jeśli RSS działa
- 🟡 **Real-time Data** - aktualizacja na żywo

## 🎯 Dostosowanie

### Dodanie nowego RSS feedu

```typescript
// W rss-feeds.ts
const FOOTBALL_RSS_FEEDS = {
  // ...
  mojportal: {
    name: 'Mój Portal',
    url: 'https://mojportal.pl/feed',
    type: 'transfer',
    icon: '⚽',
    reliable: true
  }
}
```

### Zmiana filtrów transferowych

```typescript
// W rss-feeds.ts
const transferKeywords = [
  'transfer', 'signing', 'deal', 'contract',
  'twoje_slowo_kluczowe', // Dodaj własne
]
```

### Zmiana timeout

```typescript
// W rss-feeds.ts
const timeoutId = setTimeout(() => controller.abort(), 20000) // 20 sekund
```

## 🔒 Bezpieczeństwo

### CORS Proxy

Używamy publicznych proxy jak `allorigins.win`:

**Zalety:**
- Darmowe i publiczne
- Obsługują CORS
- Proste w użyciu

**Wady:**
- Publiczne (nie dla danych wrażliwych)
- Mogą mieć limity rate-limiting
- Niekiedy mogą być niedostępne

**Dla produkcji:**
- Użyj własnego proxy serwera
- Lub Next.js API routes
- Lub Cloudflare Workers

### Ochrona przed XSS

```typescript
// XML parsing jest bezpieczny dzięki regex
// W produkcji użyj DOMParser z sanitizacją
const domParser = new DOMParser()
const xmlDoc = domParser.parseFromString(rssText, 'text/xml')
```

## 📈 Optymalizacja

### Cache'owanie

```typescript
// Dodaj cache do trending-news.ts
let cachedNews: TrendingNewsItem[] | null = null
let cacheTime = 0
const CACHE_DURATION = 10 * 60 * 1000 // 10 minut

export async function getTrendingNews(): Promise<TrendingNewsItem[]> {
  if (cachedNews && Date.now() - cacheTime < CACHE_DURATION) {
    return cachedNews
  }

  // ... pobieranie danych
  cachedNews = result
  cacheTime = Date.now()
  return result
}
```

### Parallel fetching

System już używa `Promise.all` dla równoległego pobierania.

## 🚨 Known Issues

### 1. Polskie portale często blokują CORS

**Status:** Znany problem
**Rozwiązanie:** Użyj CORS proxy lub API

### 2. Niektóre feedy mają niestandardowy format XML

**Status:** Regex parser jest prosty
**Rozwiązanie:** Użyj właściwego XML parsera w produkcji

### 3. Rate limiting od proxy

**Status:** Może się zdarzyć
**Rozwiązanie:** Dodaj cache i retry logic

## 📞 Wsparcie

Jeśli RSS feedy nie działają:

1. Sprawdź konsolę przeglądarki
2. Skonfiguruj CORS proxy
3. Sprawdź czy URL feedów są poprawne
4. Użyj Twitter API jako alternatywę
5. System automatycznie użyje danych testowych

---

**Wersja:** 1.0.0
**Ostatnia aktualizacja:** 2026-04-28
**Status:** ✅ Produkcja
