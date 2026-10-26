(() => {
  'use strict';
  const T = window.Track;
  const COLORS = ['#ff9f1c', '#e0479e', '#ffd23f', '#7b5cff'];
  const INK = '#1f2b2e', WATER = '#3fa7b8', GRASS = '#7fa347', BUSH = '#5f8a35', SAND = '#efdda8';
  const WOOD = '#9c6b3d', WOOD_DARK = '#83572f', GAS = '#c6dc5a', PAPER = '#fff8e1';
  const $ = (id) => document.getElementById(id);
  const canvas = $('game');
  const ctx = canvas.getContext('2d');

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* niente */ } },
  };

  // ---------- stanza ----------
  const NOUNS = ['bolla', 'nuvola', 'tromba', 'brezza', 'bufera', 'folata', 'raffica', 'nebbia'];
  const ADJS = ['pigra', 'felice', 'sonora', 'gentile', 'fiera', 'calda', 'furba', 'lenta'];
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const params = new URLSearchParams(location.search);
  let roomId = (params.get('room') || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 24);
  if (!roomId) {
    roomId = `${pick(NOUNS)}-${pick(ADJS)}-${Math.floor(Math.random() * 90 + 10)}`;
    params.set('room', roomId);
    history.replaceState(null, '', `${location.pathname}?${params}`);
  }
  $('room-name').textContent = roomId;
  $('name').value = store.get('ippo-name') || '';

  // ---------- rete ----------
  let ws = null, myId = null, mySeat = null, joined = false, myName = '', retry = 0, everConnected = false;
  const snaps = [];
  let offset = null, latest = null, lastStatus = null, best = [];

  function connect() {
    const base = location.pathname.replace(/[^/]*$/, '');
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    ws = new WebSocket(`${proto}://${location.host}${base}ws?room=${encodeURIComponent(roomId)}`);
    ws.onopen = () => {
      retry = 0;
      everConnected = true;
      $('conn').hidden = true;
      if (joined) send({ t: 'join', name: myName });
      sendInput(true);
    };
    ws.onmessage = (e) => {
      let m;
      try { m = JSON.parse(e.data); } catch { return; }
      handle(m);
    };
    ws.onclose = () => {
      mySeat = null;
      if (everConnected) $('conn').hidden = false;
      setTimeout(connect, Math.min(5000, 400 * 2 ** retry++));
    };
  }
  function send(o) {
    if (ws && ws.readyState === 1) ws.send(JSON.stringify(o));
  }

  function handle(m) {
    if (m.t === 'hello') {
      myId = m.id;
      best = m.best || [];
    } else if (m.t === 'joined') {
      mySeat = m.seat;
      if (m.seat == null) toast('La zattera è piena: guardi da riva', 3000);
    } else if (m.t === 's') {
      const now = performance.now() / 1000;
      const o = m.gt - now;
      offset = offset == null || Math.abs(o - offset) > 1 ? o : offset + (o - offset) * 0.05;
      snaps.push(m);
      if (snaps.length > 40) snaps.shift();
      latest = m;
      for (const ev of m.ev) onEvent(ev);
      onSnapshot(m);
    }
  }

  // ---------- input ----------
  const keys = new Set();
  const touchK = { left: false, right: false, fart: false };
  let lastSent = '';
  function computeInput() {
    const l = keys.has('KeyA') || keys.has('ArrowLeft') || touchK.left;
    const r = keys.has('KeyD') || keys.has('ArrowRight') || touchK.right;
    const f = keys.has('Space') || keys.has('KeyW') || keys.has('ArrowUp') || touchK.fart;
    return { turn: (r ? 1 : 0) - (l ? 1 : 0), fart: f ? 1 : 0 };
  }
  function sendInput(force) {
    const i = computeInput();
    const k = `${i.turn},${i.fart}`;
    if (force || k !== lastSent) {
      lastSent = k;
      send({ t: 'in', turn: i.turn, fart: i.fart });
    }
  }
  const GAME_KEYS = ['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'KeyA', 'KeyD', 'KeyW'];
  window.addEventListener('keydown', (e) => {
    if (e.target && e.target.tagName === 'INPUT') return;
    if (e.code === 'KeyM' && !e.repeat) { toggleMute(); return; }
    if (!GAME_KEYS.includes(e.code)) return;
    e.preventDefault();
    keys.add(e.code);
    sendInput();
  });
  window.addEventListener('keyup', (e) => {
    if (!keys.delete(e.code)) return;
    e.preventDefault();
    sendInput();
  });
  window.addEventListener('blur', () => {
    keys.clear();
    touchK.left = touchK.right = touchK.fart = false;
    sendInput();
  });
  for (const b of document.querySelectorAll('#touch button')) {
    const k = b.dataset.k;
    const on = (e) => { e.preventDefault(); touchK[k] = true; sendInput(); };
    const off = (e) => { e.preventDefault(); touchK[k] = false; sendInput(); };
    b.addEventListener('pointerdown', on);
    b.addEventListener('pointerup', off);
    b.addEventListener('pointercancel', off);
    b.addEventListener('pointerleave', off);
  }

  // ---------- UI ----------
  $('join-form').addEventListener('submit', (e) => {
    e.preventDefault();
    myName = $('name').value.trim().slice(0, 16) || 'Ippo';
    store.set('ippo-name', myName);
    joined = true;
    initAudio();
    send({ t: 'join', name: myName });
    $('name').blur();
    $('splash').hidden = true;
    $('hud').hidden = false;
    $('touch').hidden = !matchMedia('(pointer: coarse)').matches;
    if (latest) onSnapshot(latest);
  });
  $('start').addEventListener('click', (e) => { send({ t: 'start' }); e.currentTarget.blur(); });
  $('again').addEventListener('click', (e) => { send({ t: 'start' }); e.currentTarget.blur(); });
  $('copy-link').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    try {
      await navigator.clipboard.writeText(location.href);
      btn.textContent = 'Link copiato';
    } catch {
      btn.textContent = location.href;
    }
    setTimeout(() => { btn.textContent = 'Copia il link'; }, 2000);
    btn.blur();
  });

  let toastTimer = null;
  function toast(msg, ms = 1600) {
    const el = $('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), ms);
  }

  const fmt = (t) => {
    const m = Math.floor(t / 60);
    const s = t - m * 60;
    return `${m}:${s < 10 ? '0' : ''}${s.toFixed(1)}`;
  };

  // barre del gas
  const seatEls = COLORS.map((c, i) => {
    const el = document.createElement('div');
    el.className = 'seat empty';
    el.style.borderColor = INK;
    el.innerHTML = `<span class="name"></span><div class="bar"><div class="fill"></div></div>`;
    el.querySelector('.name').style.color = INK;
    el.style.background = `linear-gradient(${c}, ${c}) left top / 8px 100% no-repeat, ${PAPER}`;
    $('seats').appendChild(el);
    return el;
  });

  // checkpoint sulla barra di avanzamento
  for (const s of T.CHECKPOINTS) {
    const d = document.createElement('div');
    d.className = 'cp';
    d.style.bottom = `${(100 * s) / T.FINISH_S}%`;
    $('progress').appendChild(d);
  }
  const cpEls = [...document.querySelectorAll('#progress .cp')];

  let crewSig = '';
  function onSnapshot(m) {
    // stato della partita
    if (m.st !== lastStatus) {
      if (m.st === 'countdown') $('results').hidden = true;
      lastStatus = m.st;
    }
    const inGame = m.st === 'countdown' || m.st === 'running';
    $('lobby').hidden = !joined || inGame || m.st === 'finished';
    if (m.st === 'finished' && joined && $('results').hidden && !$('final-time').textContent) $('lobby').hidden = false;

    // equipaggio
    const sig = JSON.stringify(m.s.map((s) => (s ? [s[0], s[1]] : 0))) + mySeat;
    if (sig !== crewSig) {
      crewSig = sig;
      const crew = $('crew');
      crew.innerHTML = '';
      m.s.forEach((s, i) => {
        const li = document.createElement('li');
        const dot = document.createElement('span');
        dot.className = 'dot';
        dot.style.background = COLORS[i];
        li.appendChild(dot);
        li.appendChild(document.createTextNode(s ? s[1] : 'Posto libero'));
        if (!s) li.className = 'empty';
        else if (s[0] === myId) li.className = 'me';
        crew.appendChild(li);
      });
      $('start').disabled = mySeat == null;
      m.s.forEach((s, i) => {
        seatEls[i].classList.toggle('empty', !s);
        seatEls[i].classList.toggle('me', !!s && s[0] === myId);
        seatEls[i].querySelector('.name').textContent = s ? s[1] : 'libero';
      });
    }
    m.s.forEach((s, i) => {
      if (!s) return;
      seatEls[i].querySelector('.fill').style.width = `${s[3]}%`;
      seatEls[i].classList.toggle('tired', !!s[5]);
    });
    $('sync').classList.toggle('on', !!m.sy && m.st !== 'countdown');
    cpEls.forEach((el, i) => el.classList.toggle('done', i <= m.cp));
    updateVoices(m);
  }

  let lastCountBeep = null;
  function onEvent(ev) {
    switch (ev.k) {
      case 'go':
        toast('Via!');
        blip(880, 0.3, 'sine', 0.25);
        break;
      case 'cp':
        toast(`Checkpoint ${ev.i + 1} di ${T.CHECKPOINTS.length}`);
        blip(660, 0.12, 'sine', 0.2);
        setTimeout(() => blip(990, 0.18, 'sine', 0.2), 110);
        break;
      case 'bite':
        toast('Gnam! Si torna all’ultimo checkpoint', 2200);
        chomp();
        shake = 18;
        break;
      case 'bump':
        thud(ev.m);
        shake = Math.max(shake, 10 * ev.m);
        break;
      case 'finish':
        best = ev.best;
        showResults(ev);
        [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => blip(f, 0.2, 'triangle', 0.22), i * 120));
        break;
      default:
    }
  }

  function showResults(ev) {
    $('final-time').textContent = fmt(ev.time);
    const morsi = ev.bites === 1 ? '1 morso di coccodrillo' : `${ev.bites} morsi di coccodrillo`;
    $('final-stats').textContent = `${morsi}, ${ev.sync}% del tempo a spingere tutti insieme.`;
    const ol = $('best');
    ol.innerHTML = '';
    for (const b of best) {
      const li = document.createElement('li');
      const strong = document.createElement('strong');
      strong.textContent = fmt(b.time);
      li.appendChild(strong);
      li.appendChild(document.createTextNode(` ${b.crew}`));
      ol.appendChild(li);
    }
    if (joined) {
      $('results').hidden = false;
      $('lobby').hidden = true;
    }
  }

  // ---------- audio ----------
  let audio = null, master = null, noiseBuf = null;
  let muted = store.get('ippo-muted') === '1';
  $('mute').textContent = muted ? '🔇' : '🔊';
  const voices = [null, null, null, null];

  function initAudio() {
    if (audio) return;
    try {
      audio = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return;
    }
    master = audio.createGain();
    master.gain.value = muted ? 0 : 0.7;
    master.connect(audio.destination);
    noiseBuf = audio.createBuffer(1, audio.sampleRate, audio.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  function toggleMute() {
    muted = !muted;
    store.set('ippo-muted', muted ? '1' : '0');
    $('mute').textContent = muted ? '🔇' : '🔊';
    if (master) master.gain.value = muted ? 0 : 0.7;
  }
  $('mute').addEventListener('click', (e) => { initAudio(); toggleMute(); e.currentTarget.blur(); });

  function blip(freq, dur, type, gain, slideTo) {
    if (!audio) return;
    const t = audio.currentTime;
    const o = audio.createOscillator();
    const g = audio.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + dur + 0.02);
  }
  function chomp() {
    blip(240, 0.12, 'square', 0.18, 70);
    setTimeout(() => blip(220, 0.14, 'square', 0.18, 60), 150);
  }
  function thud(m) {
    if (!audio) return;
    const t = audio.currentTime;
    const n = audio.createBufferSource();
    n.buffer = noiseBuf;
    const f = audio.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 220;
    const g = audio.createGain();
    g.gain.setValueAtTime(0.5 * m + 0.1, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    n.connect(f).connect(g).connect(master);
    n.start(t);
    n.stop(t + 0.2);
  }

  // Il pezzo forte: un peto sintetizzato per posto, con timbro diverso
  const FART_BASE = [82, 104, 66, 122];
  function startFart(i) {
    if (!audio || voices[i]) return;
    const t = audio.currentTime;
    const base = FART_BASE[i] * (0.9 + Math.random() * 0.2);
    const osc = audio.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(base * 1.2, t);
    osc.frequency.exponentialRampToValueAtTime(base * 0.75, t + 2.5);
    const lfo = audio.createOscillator();
    lfo.frequency.value = 16 + Math.random() * 16;
    const lfoG = audio.createGain();
    lfoG.gain.value = base * 0.4;
    lfo.connect(lfoG).connect(osc.frequency);
    const noise = audio.createBufferSource();
    noise.buffer = noiseBuf;
    noise.loop = true;
    const nG = audio.createGain();
    nG.gain.value = 0.35;
    const filt = audio.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = 380 + Math.random() * 120;
    filt.Q.value = 7;
    const amp = audio.createGain();
    amp.gain.setValueAtTime(0, t);
    amp.gain.linearRampToValueAtTime(0.16, t + 0.03);
    const flut = audio.createOscillator();
    flut.frequency.value = 7 + Math.random() * 7;
    const flutG = audio.createGain();
    flutG.gain.value = 0.05;
    flut.connect(flutG).connect(amp.gain);
    osc.connect(filt);
    noise.connect(nG).connect(filt);
    filt.connect(amp).connect(master);
    [osc, lfo, noise, flut].forEach((n) => n.start(t));
    voices[i] = { nodes: [osc, lfo, noise, flut], amp };
  }
  function stopFart(i) {
    const v = voices[i];
    if (!v || !audio) return;
    const t = audio.currentTime;
    v.amp.gain.cancelScheduledValues(t);
    v.amp.gain.setValueAtTime(v.amp.gain.value, t);
    v.amp.gain.linearRampToValueAtTime(0, t + 0.09);
    v.nodes.forEach((n) => n.stop(t + 0.12));
    voices[i] = null;
  }
  function updateVoices(m) {
    m.s.forEach((s, i) => {
      if (s && s[4]) startFart(i);
      else stopFart(i);
    });
  }

  // ---------- mondo precalcolato ----------
  const riverPath = new Path2D();
  const leftBank = new Path2D(), rightBank = new Path2D();
  T.PTS.forEach((p, i) => {
    const nx = -p.ty, ny = p.tx;
    const lx = p.x - nx * p.hw, ly = p.y - ny * p.hw;
    if (i === 0) { riverPath.moveTo(lx, ly); leftBank.moveTo(lx, ly); }
    else { riverPath.lineTo(lx, ly); leftBank.lineTo(lx, ly); }
  });
  for (let i = T.PTS.length - 1; i >= 0; i--) {
    const p = T.PTS[i];
    const x = p.x + -p.ty * p.hw, y = p.y + p.tx * p.hw;
    riverPath.lineTo(x, y);
    if (i === T.PTS.length - 1) rightBank.moveTo(x, y); else rightBank.lineTo(x, y);
  }
  riverPath.closePath();

  // cespugli sulle rive, per dare il senso del movimento
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const bushes = [];
  for (let s = 0; s < T.LENGTH; s += 70) {
    for (const side of [-1, 1]) {
      if (rnd() < 0.35) continue;
      const p = T.pointAt(s + rnd() * 60);
      const d = p.hw + 70 + rnd() * 320;
      bushes.push({ x: p.x + p.nx * d * side, y: p.y + p.ny * d * side, r: 18 + rnd() * 26 });
    }
  }
  const streaks = [];
  for (let i = 0; i < 420; i++) streaks.push({ s0: rnd() * T.LENGTH, off: rnd() * 1.7 - 0.85, len: 18 + rnd() * 30 });

  // ---------- render ----------
  let dpr = 1, cw = 0, ch = 0;
  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    cw = window.innerWidth;
    ch = window.innerHeight;
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
  }
  window.addEventListener('resize', resize);
  resize();

  const startP = T.pointAt(T.START_S);
  const cam = { x: startP.x, y: startP.y - 150 };
  let shake = 0;
  const particles = [];
  let lastFrame = performance.now() / 1000;
  const wrapA = (a) => Math.atan2(Math.sin(a), Math.cos(a));

  function sample() {
    if (!snaps.length || offset == null) return null;
    const rg = performance.now() / 1000 + offset - 0.1;
    const first = snaps[0], last = snaps[snaps.length - 1];
    if (rg <= first.gt) return { a: first, b: first, f: 0, rg };
    if (rg >= last.gt) return { a: last, b: last, f: 0, rg };
    for (let i = snaps.length - 1; i > 0; i--) {
      if (snaps[i - 1].gt <= rg) {
        const a = snaps[i - 1], b = snaps[i];
        let f = (rg - a.gt) / Math.max(1e-6, b.gt - a.gt);
        if (Math.hypot(b.r[0] - a.r[0], b.r[1] - a.r[1]) > 300) f = 1; // teletrasporto (morso)
        return { a, b, f, rg };
      }
    }
    return { a: last, b: last, f: 0, rg };
  }

  function frame() {
    const now = performance.now() / 1000;
    const dt = Math.min(0.05, now - lastFrame);
    lastFrame = now;
    const sm = sample();
    const rg = sm ? sm.rg : now;

    let raft = { x: startP.x, y: startP.y, a: Math.atan2(startP.tx, -startP.ty), vx: 0, vy: 0 };
    let seats = [null, null, null, null];
    let st = 'lobby';
    if (sm) {
      const { a, b, f } = sm;
      raft = {
        x: a.r[0] + (b.r[0] - a.r[0]) * f,
        y: a.r[1] + (b.r[1] - a.r[1]) * f,
        a: a.r[2] + wrapA(b.r[2] - a.r[2]) * f,
        vx: b.r[3], vy: b.r[4],
      };
      seats = b.s.map((s, i) => {
        if (!s) return null;
        const pa = a.s[i] && a.s[i][0] === s[0] ? a.s[i][2] : s[2];
        return { id: s[0], name: s[1], aim: pa + wrapA(s[2] - pa) * f, farting: !!s[4], tired: !!s[5] };
      });
      st = b.st;
    }

    // camera
    const zoom = Math.max(0.42, Math.min(1.15, Math.min(cw, ch * 1.1) / 820));
    const tx = raft.x + raft.vx * 0.35, ty = raft.y + raft.vy * 0.35 - 60;
    const k = Math.min(1, dt * 5);
    cam.x += (tx - cam.x) * k;
    cam.y += (ty - cam.y) * k;
    shake *= Math.pow(0.02, dt);
    const sx = (Math.random() - 0.5) * shake, sy = (Math.random() - 0.5) * shake;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = GRASS;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr * zoom, 0, 0, dpr * zoom, dpr * (cw / 2 - zoom * (cam.x + sx)), dpr * (ch / 2 - zoom * (cam.y + sy)));
    const vw = cw / zoom / 2 + 120, vh = ch / zoom / 2 + 120;
    const inView = (x, y) => Math.abs(x - cam.x) < vw && Math.abs(y - cam.y) < vh;

    // rive e acqua
    ctx.fillStyle = BUSH;
    for (const b of bushes) {
      if (!inView(b.x, b.y)) continue;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = SAND;
    ctx.lineWidth = 70;
    ctx.stroke(leftBank);
    ctx.stroke(rightBank);
    ctx.fillStyle = WATER;
    ctx.fill(riverPath);
    ctx.strokeStyle = 'rgba(31,43,46,0.25)';
    ctx.lineWidth = 6;
    ctx.stroke(leftBank);
    ctx.stroke(rightBank);

    // corrente
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (const s of streaks) {
      const ss = (((s.s0 - rg * 55) % T.LENGTH) + T.LENGTH) % T.LENGTH;
      const p = T.pointAt(ss);
      const x = p.x + p.nx * s.off * p.hw, y = p.y + p.ny * s.off * p.hw;
      if (!inView(x, y)) continue;
      ctx.moveTo(x, y);
      ctx.lineTo(x - p.tx * s.len, y - p.ty * s.len);
    }
    ctx.stroke();

    // linee: partenza, checkpoint, arrivo
    const cpDone = latest ? latest.cp : -1;
    const crossLine = (s, color, dash) => {
      const p = T.pointAt(s);
      ctx.setLineDash(dash);
      ctx.strokeStyle = color;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(p.x - p.nx * p.hw, p.y - p.ny * p.hw);
      ctx.lineTo(p.x + p.nx * p.hw, p.y + p.ny * p.hw);
      ctx.stroke();
      ctx.setLineDash([]);
    };
    crossLine(T.START_S + 90, 'rgba(255,248,225,0.7)', []);
    T.CHECKPOINTS.forEach((s, i) => crossLine(s, i <= cpDone ? GAS : 'rgba(255,248,225,0.85)', [26, 18]));
    {
      const p = T.pointAt(T.FINISH_S);
      const n = 14, w = (2 * p.hw) / n;
      for (let row = 0; row < 2; row++) {
        for (let i = 0; i < n; i++) {
          ctx.fillStyle = (i + row) % 2 ? INK : PAPER;
          const d = -p.hw + w * i + w / 2;
          ctx.save();
          ctx.translate(p.x + p.nx * d + p.tx * (row - 0.5) * w, p.y + p.ny * d + p.ty * (row - 0.5) * w);
          ctx.rotate(Math.atan2(p.ny, p.nx));
          ctx.fillRect(-w / 2, -w / 2, w, w);
          ctx.restore();
        }
      }
    }

    // mulinelli
    for (const v of T.VORTICES) {
      if (!inView(v.x, v.y)) continue;
      ctx.fillStyle = 'rgba(31,43,46,0.12)';
      ctx.beginPath();
      ctx.arc(v.x, v.y, v.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 6;
      for (let i = 0; i < 3; i++) {
        const a0 = rg * 2.2 + i * 2.1;
        ctx.beginPath();
        ctx.arc(v.x, v.y, v.r * (0.3 + i * 0.22), a0, a0 + Math.PI * 1.1);
        ctx.stroke();
      }
    }
    // sassi
    for (const r of T.ROCKS) {
      if (!inView(r.x, r.y)) continue;
      ctx.fillStyle = '#8d979b';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#b3bcbf';
      ctx.beginPath();
      ctx.arc(r.x - r.r * 0.3, r.y - r.r * 0.3, r.r * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
    // barili
    for (const b of T.barrelsAt(rg)) {
      if (!inView(b.x, b.y)) continue;
      ctx.fillStyle = WOOD;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#5a6366';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r * 0.62, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = WOOD_DARK;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    // coccodrilli
    for (const c of T.crocsAt(rg)) {
      if (!inView(c.x, c.y)) continue;
      drawCroc(c.x, c.y, c.r, Math.atan2(c.ny * c.dir, c.nx * c.dir), rg);
    }

    // particelle di gas: sotto la zattera nascono, sopra si vedono
    const cos = Math.cos(raft.a), sin = Math.sin(raft.a);
    seats.forEach((s, i) => {
      if (!s || !s.farting) return;
      const [lx, ly] = T.SEATS[i];
      const bx = lx + Math.cos(s.aim) * 22, by = ly + Math.sin(s.aim) * 22;
      const wx = raft.x + bx * cos - by * sin, wy = raft.y + bx * sin + by * cos;
      const dx = Math.cos(s.aim + raft.a), dy = Math.sin(s.aim + raft.a);
      for (let n = 0; n < 2; n++) {
        const sp = 90 + Math.random() * 90;
        particles.push({
          x: wx, y: wy,
          vx: dx * sp + (Math.random() - 0.5) * 50,
          vy: dy * sp + (Math.random() - 0.5) * 50,
          age: 0, life: 0.8 + Math.random() * 0.5,
          tint: Math.random() < 0.5 ? GAS : '#a9bd47',
        });
      }
    });
    while (particles.length > 700) particles.shift();

    drawRaft(raft, seats);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.age += dt;
      if (p.age >= p.life) { particles.splice(i, 1); continue; }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= Math.pow(0.15, dt);
      p.vy *= Math.pow(0.15, dt);
      const q = p.age / p.life;
      ctx.globalAlpha = (1 - q) * 0.6;
      ctx.fillStyle = p.tint;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8 + q * 26, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // nomi sopra gli ippopotami
    ctx.font = '700 17px "Atkinson Hyperlegible", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 5;
    seats.forEach((s, i) => {
      if (!s) return;
      const [lx, ly] = T.SEATS[i];
      const wx = raft.x + lx * cos - ly * sin, wy = raft.y + lx * sin + ly * cos;
      ctx.strokeStyle = INK;
      ctx.fillStyle = PAPER;
      ctx.strokeText(s.name, wx, wy - 34);
      ctx.fillText(s.name, wx, wy - 34);
    });

    // HUD a schermo
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (st === 'countdown' && latest) {
      const n = Math.ceil(latest.tm);
      if (n !== lastCountBeep) {
        lastCountBeep = n;
        blip(440, 0.12, 'sine', 0.2);
      }
      ctx.font = `400 ${Math.min(cw, ch) * 0.3}px "Bagel Fat One", system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 10;
      ctx.strokeStyle = INK;
      ctx.fillStyle = GAS;
      ctx.strokeText(String(n), cw / 2, ch / 2);
      ctx.fillText(String(n), cw / 2, ch / 2);
      ctx.textBaseline = 'alphabetic';
    } else {
      lastCountBeep = null;
    }

    if (latest) {
      const run = latest.st === 'running' ? latest.tm + Math.max(0, rg - latest.gt) : latest.st === 'countdown' ? 0 : latest.tm;
      $('timer').textContent = fmt(run);
      const s = T.closest(raft.x, raft.y).s;
      $('progress-marker').style.bottom = `${Math.min(100, (100 * s) / T.FINISH_S)}%`;
    }

    requestAnimationFrame(frame);
  }

  function drawRaft(raft, seats) {
    const S = T.RAFT_SIZE, h = S / 2;
    ctx.save();
    ctx.translate(raft.x, raft.y);
    ctx.rotate(raft.a);
    // ombra
    ctx.fillStyle = 'rgba(31,43,46,0.25)';
    ctx.fillRect(-h + 8, -h + 10, S, S);
    // tronchi
    const n = 5, w = S / n;
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = i % 2 ? WOOD : WOOD_DARK;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-h + i * w + 1, -h - 4, w - 2, S + 8, 10);
      ctx.fill();
      ctx.stroke();
    }
    // corde
    ctx.strokeStyle = SAND;
    ctx.lineWidth = 5;
    for (const y of [-h + 18, h - 18]) {
      ctx.beginPath();
      ctx.moveTo(-h, y);
      ctx.lineTo(h, y);
      ctx.stroke();
    }
    // prua
    ctx.fillStyle = PAPER;
    ctx.beginPath();
    ctx.moveTo(0, -h - 20);
    ctx.lineTo(-10, -h - 6);
    ctx.lineTo(10, -h - 6);
    ctx.closePath();
    ctx.fill();

    seats.forEach((s, i) => {
      const [lx, ly] = T.SEATS[i];
      ctx.save();
      ctx.translate(lx, ly);
      if (!s) {
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = 'rgba(255,248,225,0.7)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        drawHippo(s, COLORS[i], s.id === myId);
      }
      ctx.restore();
    });
    ctx.restore();
  }

  // L'ippopotamo guarda dove spinge: il sedere punta verso aim, il muso dall'altra parte
  function drawHippo(s, color, isMe) {
    ctx.rotate(s.aim + Math.PI);
    ctx.scale(0.82, 0.82);
    if (isMe) {
      ctx.strokeStyle = PAPER;
      ctx.lineWidth = 5;
      ctx.setLineDash([10, 8]);
      ctx.beginPath();
      ctx.moveTo(50, 0);
      ctx.lineTo(86, 0);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = PAPER;
      ctx.beginPath();
      ctx.moveTo(98, 0);
      ctx.lineTo(84, -10);
      ctx.lineTo(84, 10);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(4, 0, 38, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,248,225,0.35)';
      ctx.fill();
    }
    ctx.globalAlpha = s.tired ? 0.65 : 1;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3.5;
    // coda
    ctx.beginPath();
    ctx.moveTo(-26, 0);
    ctx.quadraticCurveTo(-36, 6, -34, -4);
    ctx.stroke();
    // corpo
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, 27, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // orecchie
    for (const y of [-11, 11]) {
      ctx.beginPath();
      ctx.arc(17, y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    // testa e muso
    ctx.beginPath();
    ctx.ellipse(26, 0, 15, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath();
    ctx.ellipse(37, 0, 9, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = INK;
    for (const y of [-5, 5]) {
      ctx.beginPath();
      ctx.arc(41, y, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
    // occhi
    for (const y of [-7, 7]) {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(25, y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = INK;
      ctx.beginPath();
      if (s.tired) ctx.fillRect(23, y - 1, 6, 2);
      else ctx.arc(27, y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawCroc(x, y, r, ang, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    const wag = Math.sin(t * 6) * 0.25;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3.5;
    ctx.fillStyle = '#4f7d3c';
    // coda
    ctx.save();
    ctx.translate(-r * 0.9, 0);
    ctx.rotate(wag);
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.35);
    ctx.lineTo(-r * 1.4, 0);
    ctx.lineTo(0, r * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    // corpo
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.1, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // muso
    ctx.beginPath();
    ctx.roundRect(r * 0.6, -r * 0.32, r * 1.2, r * 0.64, r * 0.3);
    ctx.fill();
    ctx.stroke();
    // denti
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 4; i++) {
      const px = r * 0.85 + i * r * 0.22;
      for (const sgn of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(px, sgn * r * 0.32);
        ctx.lineTo(px + 4, sgn * (r * 0.32 + 6));
        ctx.lineTo(px + 8, sgn * r * 0.32);
        ctx.fill();
      }
    }
    // occhi
    for (const sgn of [-1, 1]) {
      ctx.fillStyle = '#ffd23f';
      ctx.beginPath();
      ctx.arc(r * 0.45, sgn * r * 0.38, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = INK;
      ctx.fillRect(r * 0.45 - 1, sgn * r * 0.38 - 4, 2, 8);
    }
    ctx.restore();
  }

  connect();
  requestAnimationFrame(frame);
})();
