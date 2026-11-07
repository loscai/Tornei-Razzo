# Asset grafici

Metti le immagini in questa cartella (`public/assets/`) con **esattamente** questi nomi (minuscolo, con trattini).
Finché un file manca, l'app mostra automaticamente un segnaposto grafico.

```
public/assets/
├── trophy.png                    ← trofeo (vittoria della Finale)
└── ranks/
    ├── bronze.png
    ├── silver.png
    ├── gold.png
    ├── diamond.png
    ├── champion.png
    ├── grand-champion.png
    └── supersonic-legend.png
```

## Risoluzioni consigliate

| File | Dimensione consigliata | Mostrata a | Note |
|---|---|---|---|
| `ranks/*.png` | **256 × 256 px** (quadrata) | 48–96 px | PNG con sfondo trasparente; il logo deve riempire il quadrato con poco margine |
| `trophy.png` | **1024 × 1024 px** (quadrata) | fino a 320 px | PNG con sfondo trasparente, così l'alone dorato si vede bene |

- 256 px per i rank coprono gli schermi ad alta densità (Retina/smartphone 3×) senza pesare troppo.
- Le immagini vengono adattate con `object-contain`: anche se non sono perfettamente quadrate non vengono
  deformate, ma restano più piccole.
- Peso consigliato: < 100 KB per ogni rank, < 500 KB per il trofeo (puoi comprimere con https://tinypng.com).

## Facoltativi (gestiti in automatico da Next.js)

| File | Dimensione | Uso |
|---|---|---|
| `app/icon.png` | 512 × 512 px | Icona della scheda del browser / segnalibro |
| `app/apple-icon.png` | 180 × 180 px | Icona quando salvi il sito nella home dell'iPhone |
| `app/opengraph-image.png` | 1200 × 630 px | Anteprima quando condividi il link (WhatsApp, Discord…) |

Questi tre vanno nella cartella `app/` (non in `public/`).
