# Instrukcja dodawania ID adnotacji dla powiadomień o transferach

## Jak to działa

Kiedy użytkownik kliknie w powiadomienie o konkretnym piłkarzu (np. "Mbappé to Real Madrid"), system:
1. Otwiera Twoją stronę pod ścieżką `/#annotationId`
2. Automatycznie przescrollowuje do sekcji z tym ID
3. Podświetla sekcję przez 3 sekundy

## Co musisz dodać na swojej stronie

### 1. Unikalne ID dla sekcji z graczami

Każda sekcja z opisem piłkarza na Twojej stronie musi mieć unikalne ID.

**PRZYKŁADY:**

```html
<!-- Dobre -->
<div id="bellingham-liverpool-deal" class="player-section">
  <h2>Jude Bellingham</h2>
  <p>Liverpool submit £50M bid...</p>
</div>

<!-- Dobre -->
<div id="mbappe-royal-move" class="player-section">
  <h2>Kylian Mbappé</h2>
  <p>Real Madrid sign Mbappé until 2029...</p>
</div>

<!-- Dobre -->
<div id="lewandowski-contract" class="player-section">
  <h2>Robert Lewandowski</h2>
  <p>Ekstraklasa: Lewandowski extension talks...</p>
</div>
```

### 2. Kluczowe reguły

✅ **Unikalność**: ID musi być unikalne na całej stronie
✅ **Konwencja**: Używaj nazwisko-id-opis (np. `bellingham-liverpool-deal`)
✅ **Format**: Tylko małe litery, cyfry i myślniki
✅ **Znaczenie**: ID powinno jednoznacznie identyfikować piłkarza i wydarzenie

### 3. Przygotowany system ID adnotacji

| Piłkarz | ID adnotacji | Wydarzenie |
|-----------|-----------------|-------------|
| Jude Bellingham | `bellingham-liverpool-deal` | Transfer do Liverpool |
| Kylian Mbappé | `mbappe-royal-move` | Transfer do Real Madrid |
| Robert Lewandowski | `lewandowski-contract` | Przedłużenie kontraktu |
| Kai Havertz | `havertz-bayern` | Transfer do Bayern |
| Andre Onana | `onana-milan` | Transfer do Milan |
| Bernardo Silva | `bernardo-psg` | Klauzula transferowa |
| Harry Kane | `kane-injury` | Kontuzja |
| Piotr Zieliński | `zielinski-napoli` | Transfer do Napoli |
| Jakub Musiala | `musiala-union` | Transfer do Union Berlin |
| João Félix | `felix-arsenal` | Wypożyczenie |

### 4. Automatyczne podświetlanie

System automatycznie doda klasę CSS `highlight-news` do elementu po przeniesieniu.

**W Twoim CSS:**
```css
.highlight-news {
  animation: highlightNews 3s ease-out;
}

@keyframes highlightNews {
  0% {
    background-color: rgba(0, 255, 136, 0.3);
  }
  50% {
    background-color: rgba(0, 255, 136, 0.5);
  }
  100% {
    background-color: transparent;
  }
}
```

### 5. Przeznaczenie ID w powiadomieniach

Dla każdego powiadomienia w systemie dzwonka, używamy:
```typescript
{
  id: 'trend-001',
  player: 'Jude Bellingham',
  annotationId: 'bellingham-liverpool-deal' // To ID na Twojej stronie!
  ...
}
```

### 6. Jak to działa w praktyce

1. **Kliknięcie w powiadomienie**: "Mbappé to Real Madrid"
2. **System otwiera**: Twoją stronę → `/#mbappe-royal-move`
3. **Automatyczne przescrollowanie**: Do sekcji `<div id="mbappe-royal-move">`
4. **Podświetlenie**: Element świeci się przez 3 sekundy
5. **Czytanie**: Użytkownik czyta szczegóły transferu

## Przykład implementacji na Twojej stronie

```tsx
// Plik z zawodnikami (np. players.tsx)
export const players = [
  {
    id: 'bellingham',
    name: 'Jude Bellingham',
    // ... inne dane
  }
]

// Plik z sekcją opisową (np. PlayerDetails.tsx)
export function PlayerDetails({ player }: { player: { id: string, name: string } }) {
  return (
    <div id={player.id} className="player-section">
      <h2>{player.name}</h2>
      {/* Opis piłkarza */}
    </div>
  )
}
```

## Mapowanie ID w dzwonku

W pliku `trending-news.ts` w dzwonku, każde powiadomienie ma już przypisane `annotationId`:

```typescript
{
  id: 'trend-002',
  player: 'Kylian Mbappé',
  annotationId: 'mbappe-royal-move' // To samo ID co na Twojej stronie!
  headline: '⚡ HERE WE GO: Real Madrid sign Mbappé until 2029',
  ...
}
```

## Ważne uwagi

🔹 **Zmień domenę**: W kodzie dzwonka zmień `router.push('/#${item.annotationId}')` na `router.push('https://twojastrona.pl/#${item.annotationId}')`

🔹 **ID case-sensitive**: ID są małe litery, więc `<div id="Bellingham">` ≠ `<div id="bellingham">`

🔹 **Brak spacji**: Używaj myślniki, nie spacje

🔹 **Unikalność**: Upewnij się, że ID nie powtarza się na stronie

## Testowanie

1. Dodaj ID do sekcji z piłkarzem na swojej stronie
2. Kliknij w powiadomienie o tym piłkarzu w dzwonku
3. Sprawdź, czy strona przeniosła się pod prawdziwe ID (URL w przeglądarce)
4. Sprawdź, czy przescrollowało do sekcji i czy jest podświetlona

## Wsparcie techniczne

Jeśli masz problemy z implementacją, sprawdź:
- Czy ID jest poprawnie dodane do elementu HTML?
- Czy ID w dzwonku (`annotationId`) pasuje do ID na stronie?
- Czy zmieniłeś domenę na prawdziwą?
- Czy używasz `window.location.hash` do ręcznego przescrollowania?

---

**Pytania?** Skontaktuj się z zespołem Claude lub przejrzyj dokumentację.
