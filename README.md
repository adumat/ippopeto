# Ippopeto 🦛💨

Gioco cooperativo da browser per 1–4 persone (più spettatori): una zattera, quattro ippopotami, un fiume controcorrente. Ogni giocatore controlla un ippopotamo in un angolo della zattera: gira il sedere e spinge a gas. Chi spinge da solo fa girare la zattera, chi spinge insieme agli altri va dritto (e con tutti sincronizzati la spinta cresce del 35%).

## Come si gioca

- Ognuno apre lo stesso link (`/?room=nome-stanza`). Senza `room` ne viene generata una casuale.
- `A`/`D` o le frecce: giri il sedere. `Spazio` (o `W`/`↑`): spingi finché c'è gas. `M`: audio.
- Da telefono compaiono i pulsanti a schermo.
- Sassi e barili fanno rimbalzare, i mulinelli trascinano, i coccodrilli riportano all'ultimo checkpoint.
- Il percorso ha 4 checkpoint; i 5 tempi migliori restano finché la stanza esiste (in memoria).

## Architettura

- `server/`: Node.js + [`ws`](https://github.com/websockets/ws). Il server è autoritativo: simula la fisica a 60 Hz e manda snapshot a 20 Hz. I client mandano solo i tasti premuti.
- `public/`: client statico su canvas, nessun build step. `track.js` è condiviso tra server e browser, così geometria e ostacoli mobili coincidono.
- Stato solo in memoria: un riavvio del pod chiude le partite in corso. Per questo il Deployment ha 1 replica con strategia `Recreate`.
- Endpoint: `/` (gioco), `/ws?room=…` (WebSocket), `/healthz`, `/stats` (stanze e giocatori connessi).

Banda: ogni client riceve circa 7 KB/s, quindi 4 giocatori stanno intorno a 0,25 Mbit/s in upload.

## In locale

```sh
npm ci
npm start   # http://localhost:8080
```

Variabili: `PORT` (default 8080), `MAX_ROOMS` (default 50).

## Immagine

Il workflow `.github/workflows/image.yml` costruisce `ghcr.io/adumat/gas-comune` (amd64 e arm64) a ogni push su `main` e sui tag `v*`, con tag `sha-xxxxxxx`, `latest` e semver.

Il pacchetto su GHCR nasce privato: rendilo pubblico dalle impostazioni del package, oppure crea un pull secret nel namespace e scommenta `imagePullSecrets` nel Deployment.

## Deploy

In `k8s/` c'è una base kustomize (Namespace, Deployment, Service, Ingress). L'Ingress è un esempio: imposta classe, host e TLS del tuo cluster. Con ingress-nginx alza `proxy-read-timeout` e `proxy-send-timeout` (vedi i commenti nel file), con Traefik non serve. Il server manda un ping WebSocket ogni 20 s, quindi regge anche tunnel con timeout di inattività (Cloudflare Tunnel taglia dopo 100 s).

```sh
kubectl apply -k k8s/
```
