# ✦ Gwieździste niebo · Spadające gwiazdy

Interaktywna scena na czystym **HTML5 Canvas 2D** (bez zależności runtime):
rozgwieżdżone niebo z górskim horyzontem. Co pewien losowy czas
przez niebo przelatuje **spadająca gwiazda**. Kliknij ją myszką zanim zniknie
za horyzontem — trafiona **eksploduje jak fajerwerk** w wielu kolorach, a na
niebie pojawia się na moment świecący napis (np. `Bravo Sandra!`). Po
opadnięciu iskier cykl zaczyna się od nowa.

## ▶ Zagraj online

Po opublikowaniu na GitHub Pages:

- **https://bravoprochu.github.io/stars/**
- Z własnym imieniem w napisie: **https://bravoprochu.github.io/stars/?name=Sandra**
- Z pełnym własnym tekstem: **https://bravoprochu.github.io/stars/?text=Świetna%20robota!**


## Uruchomienie

### Lokalnie
Dowolny statyczny serwer, np.:

```bash
npx serve -l 3000 .
# albo
python3 -m http.server 3000
```

Następnie otwórz `http://localhost:3000`.

> Projekt używa modułów ES (`<script type="module">`), więc musi być
> serwowany po HTTP — otwarcie `index.html` bezpośrednio z dysku (`file://`)
> nie zadziała.

### StackBlitz
Zaimportuj repozytorium — `npm start` uruchamia statyczny serwer (`serve`).

### GitHub Pages
Wypchnij pliki na branch i włącz Pages (katalog główny). To statyczna strona,
nie wymaga budowania.

## Sterowanie

- **Klik / dotyk** na spadającą gwiazdę → fajerwerk + punkt.
- Licznik u góry pokazuje liczbę trafień i celność.

## Struktura

```
index.html          # kanwa + minimalny HUD i style
src/
  config.js         # MODEL konfiguracji (struktura zgodna z JSON)
  rng.js            # deterministyczny generator losowy (seed)
  background.js     # niebo, gwiazdy, Droga Mleczna, góry
  shootingStar.js   # spadająca gwiazda (ruch, ślad, detekcja trafienia)
  firework.js       # eksplozja fajerwerku (cząsteczki, błysk)
  engine.js         # pętla renderująca, timery, obsługa wejścia
  main.js           # bootstrap
```

## Konfiguracja (model)

Wszystkie parametry są wyniesione do [`src/config.js`](src/config.js) jako jeden
obiekt z **jawnie pogrupowanymi sekcjami**. Struktura jest w 100% zgodna z JSON,
więc plik można docelowo zastąpić `config.json` bez zmian w silniku.

| Sekcja         | Za co odpowiada                                             |
| -------------- | ---------------------------------------------------------- |
| `world`        | gradient nieba, linia horyzontu, poświata, winieta         |
| `stars`        | liczba gwiazd, rozmiary, migotanie, paleta, jasne gwiazdy  |
| `milkyWay`     | pas Drogi Mlecznej (gęstość, kolor, nachylenie)            |
| `mountains`    | liczba i warstwy gór, szorstkość grani, śnieżne czapy      |
| `shootingStar` | czas do pierwszej gwiazdy, opóźnienia, prędkość, ślad, trafienie |
| `firework`     | liczba cząsteczek, palety kolorów, grawitacja, czas życia  |
| `interaction`  | podpowiedź kursora, licznik punktów                        |
| `celebration`  | świecący napis po trafieniu (tekst, kolor, rozmiar, czas)  |

### Napis gratulacyjny (zmienna)
Tekst napisu jest w [`src/config.js`](src/config.js) w sekcji `celebration.text`
i **auto-skaluje się**, aby zmieścić się na ekranie. Można go też przekazać
z zewnątrz jako zmienną przez adres URL:

- `?name=Sandra` → wyświetli `Bravo Sandra!`
- `?text=Dowolny%20napis` → wyświetli dokładnie przekazany tekst


Przykład (fragment):

```js
export const config = {
  world: { horizonRatio: 0.78, /* ... */ },
  shootingStar: {
    firstStarMaxRandomShowMs: 2600,
    minDelayMs: 2200,
    maxDelayMs: 6000,
    hitRadius: 34,
    /* ... */
  },
  firework: {
    particleCount: 120,
    palettes: [ ["#ff5252", "#ffb142", "#fffa65", "#ff9ff3"], /* ... */ ],
    /* ... */
  },
};
```

### Podgląd na żywo
Silnik jest wystawiony jako `window.starScene`, więc parametry i stan można
podejrzeć/podkręcić z konsoli przeglądarki podczas prezentacji.
