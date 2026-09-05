/* ============================================================
   APP.JS — wires CONTENT (content.js) into the page and handles
   all interaction: navigation, audio, secrets, and each chapter.
   ============================================================ */
(function () {
  "use strict";

  const C = window.CONTENT;
  const $ = (sel, el) => (el || document).querySelector(sel);
  const $$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  document.title = C.meta.pageTitle || document.title;

  /* ---------------- LOADING ---------------- */
  window.addEventListener("load", () => {
    setTimeout(() => {
      const ls = $("#loading-screen");
      ls.style.opacity = "0";
      setTimeout(() => (ls.style.display = "none"), 750);
    }, 700);
  });

  /* ---------------- STATE (localStorage) ---------------- */
  const STORE_KEY = "bhat_state_v1"; // "between here and there"
  const state = loadState();
  function loadState() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { visited: false, secretsFound: [], futureDone: {}, hasEnteredBefore: false };
  }
  function saveState() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  /* ============================================================
     CUSTOM CURSOR
     ============================================================ */
  if (!isTouch) {
    const cursor = $("#cursor");
    window.addEventListener("mousemove", (e) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
    });
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest("button, a, [role='button'], input, .card, .tl-card, .envelope, .note")) {
        cursor.classList.add("big");
      }
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest("button, a, [role='button'], input, .card, .tl-card, .envelope, .note")) {
        cursor.classList.remove("big");
      }
    });
  }

  /* ============================================================
     AUDIO MANAGER
     One voice/foreground source at a time. Ambient ducks under it.
     ============================================================ */
  const AudioManager = (() => {
    const ambientEl = $("#ambient-audio");
    let ambientEnabled = false;
    let currentForeground = null; // the <audio> element currently "foreground"
    const registry = new Map(); // id -> {el, onEnd}

    function initAmbient() {
      if (C.sound.ambient) {
        ambientEl.src = C.sound.ambient;
        ambientEl.volume = 0.18;
      }
    }

    function startAmbient() {
      if (!C.sound.ambient) return;
      ambientEnabled = true;
      ambientEl.play().catch(() => {});
    }

    function duckAmbient(down) {
      if (!C.sound.ambient) return;
      const target = down ? 0.03 : 0.18;
      ambientEl.volume = target;
    }

    function playForeground(el) {
      // stop any other foreground track
      registry.forEach((entry, key) => {
        if (entry.el !== el && !entry.el.paused) {
          entry.el.pause();
          if (entry.onPause) entry.onPause();
        }
      });
      duckAmbient(true);
      currentForeground = el;
      el.play().catch(() => {
        toast("This audio isn't available yet — add the file in content.js.");
      });
    }

    function stopForeground(el) {
      el.pause();
      if (currentForeground === el) {
        currentForeground = null;
        duckAmbient(false);
      }
    }

    function register(id, el, onPause) {
      registry.set(id, { el, onPause });
      el.addEventListener("ended", () => {
        duckAmbient(false);
        if (currentForeground === el) currentForeground = null;
      });
    }

    return { initAmbient, startAmbient, playForeground, stopForeground, register };
  })();
  AudioManager.initAmbient();

  /* ============================================================
     TOAST
     ============================================================ */
  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 3200);
  }

  /* ============================================================
     OPENING SEQUENCE
     ============================================================ */
  (function opening() {
    const opening = $("#opening");
    const begin = $("#begin-btn");
    const stages = $$(".opening-stage");
    const stageHereA = $("#stage-here-a");
    const stageHereB = $("#stage-here-b");
    const openingLine = $("#opening-line");
    const openingText = $("#opening-text");
    const enterBtn = $("#enter-btn");

    // returning visitor shortcut
    if (state.hasEnteredBefore) {
      begin.textContent = "continue";
      $("#opening-begin-label").textContent = "welcome back.";
      $("#opening-hint").textContent = "pick up where you left off, or start again.";
      const again = document.createElement("button");
      again.className = "small-btn";
      again.style.marginTop = "14px";
      again.textContent = "start from the beginning";
      again.addEventListener("click", () => {
        state.hasEnteredBefore = false;
        saveState();
        location.reload();
      });
      $(".opening-stage[data-stage='0']").appendChild(again);
    }

    function goStage(n) {
      stages.forEach((s) => s.classList.toggle("active", Number(s.dataset.stage) === n));
    }

    begin.addEventListener("click", () => {
      AudioManager.startAmbient();
      goStage(1);
      setTimeout(() => { stageHereA.style.opacity = 1; }, 200);
      setTimeout(() => {
        setTimeout(() => { goStage(2); }, 1600);
      }, 1800);
      setTimeout(() => {
        openingLine.classList.add("drawn");
      }, 2400);
      setTimeout(() => { goStage(3); playTextSequence(); }, 4600);
    });

    const lines = ["different countries.", "different time zones.", "different lives.", "and somehow…", "here we are."];
    function playTextSequence() {
      let i = 0;
      function next() {
        if (i >= lines.length) {
          setTimeout(() => goStage(4), 900);
          return;
        }
        openingText.textContent = lines[i];
        openingText.style.opacity = 0;
        requestAnimationFrame(() => {
          openingText.style.transition = "opacity 700ms ease";
          openingText.style.opacity = 1;
        });
        i++;
        setTimeout(next, 1500);
      }
      next();
    }

    enterBtn.addEventListener("click", () => {
      opening.classList.add("done");
      state.hasEnteredBefore = true;
      saveState();
      $("#nav").classList.remove("hidden");
      document.body.style.overflow = "auto";
    });

    document.body.style.overflow = "hidden";
  })();

  /* ============================================================
     NAV + PROGRESS + PANEL (archive)
     ============================================================ */
  (function nav() {
    const nav = $("#nav");
    const progress = $("#progress");
    const panel = $("#panel");
    const panelList = $("#panel-list");
    const menuBtn = $("#menu-btn");
    const closeBtn = $("#panel-close");
    const homeBtn = $("#home-btn");

    window.addEventListener("scroll", () => {
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      progress.style.width = pct + "%";
      if (!$("#opening").classList.contains("done")) return;
      nav.classList.toggle("hidden", h.scrollTop < 40 && false);
    });

    const chapters = $$(".chapter[data-chapter]");
    chapters.forEach((ch, i) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.innerHTML = `<span>${ch.dataset.chapter}</span><span class="idx">${String(i + 1).padStart(2, "0")}</span>`;
      btn.addEventListener("click", () => {
        panel.classList.remove("open");
        ch.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
      });
      li.appendChild(btn);
      panelList.appendChild(li);
    });
    $("#panel-meta").textContent = "";

    menuBtn.addEventListener("click", () => panel.classList.add("open"));
    closeBtn.addEventListener("click", () => panel.classList.remove("open"));
    panel.addEventListener("click", (e) => { if (e.target === panel) panel.classList.remove("open"); });
    homeBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" }));
  })();

  /* ============================================================
     SCROLL REVEAL
     ============================================================ */
  (function reveal() {
    const els = $$(".reveal");
    if (reducedMotion) { els.forEach((e) => e.classList.add("in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in"); });
    }, { threshold: 0.15 });
    els.forEach((e) => io.observe(e));
  })();

  /* ============================================================
     GENERIC MODAL
     ============================================================ */
  const Modal = (() => {
    const backdrop = $("#modal");
    const content = $("#modal-content");
    function open(html) {
      content.innerHTML = html;
      backdrop.classList.add("open");
    }
    function close() { backdrop.classList.remove("open"); }
    $("#modal-close").addEventListener("click", close);
    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
    return { open, close };
  })();

  /* ============================================================
     CHAPTER 01 — DISTANCE / MAP
     ============================================================ */
  (function distance() {
    const { personA, personB, relationshipStart } = C.relationship;
    const svg = $("#world-map");
    const NS = "http://www.w3.org/2000/svg";

    // scattered background stars — deterministic so the map doesn't
    // reshuffle on every render (renderStats() redraws stats but not this).
    let seed = 42;
    function rand() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    for (let i = 0; i < 90; i++) {
      const star = document.createElementNS(NS, "circle");
      star.setAttribute("cx", rand() * 900);
      star.setAttribute("cy", rand() * 450);
      star.setAttribute("r", (rand() * 0.9 + 0.3).toFixed(2));
      star.setAttribute("class", "bg-star");
      star.setAttribute("opacity", (rand() * 0.5 + 0.15).toFixed(2));
      svg.appendChild(star);
    }

    // faint stylised "graticule" background, not a literal accurate world map —
    // deliberately abstract rather than a cheap-looking basemap.
    for (let i = 1; i < 6; i++) {
      const l = document.createElementNS(NS, "line");
      l.setAttribute("x1", (i * 900) / 6); l.setAttribute("x2", (i * 900) / 6);
      l.setAttribute("y1", 0); l.setAttribute("y2", 450);
      l.setAttribute("class", "land"); l.setAttribute("opacity", "0.12");
      svg.appendChild(l);
    }
    for (let i = 1; i < 4; i++) {
      const l = document.createElementNS(NS, "line");
      l.setAttribute("y1", (i * 450) / 4); l.setAttribute("y2", (i * 450) / 4);
      l.setAttribute("x1", 0); l.setAttribute("x2", 900);
      l.setAttribute("class", "land"); l.setAttribute("opacity", "0.12");
      svg.appendChild(l);
    }

    // project lon/lat (or fallback deterministic pseudo-position if 0,0/unset)
    function project(p, fallbackX) {
      const hasCoords = p.lat && p.lon;
      if (hasCoords) {
        const x = ((p.lon + 180) / 360) * 900;
        const y = ((90 - p.lat) / 180) * 450;
        return [x, y];
      }
      return [fallbackX, 220 + (fallbackX % 40)];
    }
    const [ax, ay] = project(personA, 220);
    const [bx, by] = project(personB, 680);

    const path = document.createElementNS(NS, "path");
    const midX = (ax + bx) / 2, midY = Math.min(ay, by) - 70;
    path.setAttribute("d", `M${ax},${ay} Q${midX},${midY} ${bx},${by}`);
    path.setAttribute("class", "conn-line");
    path.setAttribute("stroke-dasharray", "1400");
    path.setAttribute("stroke-dashoffset", reducedMotion ? "0" : "1400");
    svg.appendChild(path);
    if (!reducedMotion) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            path.style.transition = "stroke-dashoffset 2200ms cubic-bezier(0.22,1,0.36,1)";
            path.style.strokeDashoffset = "0";
            io.disconnect();
          }
        });
      }, { threshold: 0.3 });
      io.observe(svg);
    }

    [[ax, ay, personA], [bx, by, personB]].forEach(([x, y, p]) => {
      const ring = document.createElementNS(NS, "circle");
      ring.setAttribute("cx", x); ring.setAttribute("cy", y); ring.setAttribute("r", 10);
      ring.setAttribute("class", "node-ring");
      svg.appendChild(ring);
      const dot = document.createElementNS(NS, "circle");
      dot.setAttribute("cx", x); dot.setAttribute("cy", y); dot.setAttribute("r", 4);
      dot.setAttribute("class", "node");
      svg.appendChild(dot);
      const label = document.createElementNS(NS, "text");
      label.setAttribute("x", x); label.setAttribute("y", y - 18);
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("class", "map-label");
      label.textContent = p.city || "[CITY]";
      svg.appendChild(label);
      const sub = document.createElementNS(NS, "text");
      sub.setAttribute("x", x); sub.setAttribute("y", y - 6);
      sub.setAttribute("text-anchor", "middle");
      sub.setAttribute("class", "map-label sub");
      sub.textContent = p.country || "[COUNTRY]";
      svg.appendChild(sub);
    });

    // stats
    const statsEl = $("#distance-stats");
    function localTime(tz) {
      try {
        return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: tz }).format(new Date());
      } catch (e) { return "—"; }
    }
    function daysSince(iso) {
      const start = new Date(iso);
      if (isNaN(start)) return "—";
      const diff = Math.floor((Date.now() - start.getTime()) / 86400000);
      return diff >= 0 ? diff : "—";
    }
    function timeDiff(tzA, tzB) {
      try {
        const now = new Date();
        const a = new Date(now.toLocaleString("en-US", { timeZone: tzA }));
        const b = new Date(now.toLocaleString("en-US", { timeZone: tzB }));
        const hrs = Math.round(Math.abs(a - b) / 3600000);
        return hrs + "h";
      } catch (e) { return "—"; }
    }

    function renderStats() {
      statsEl.innerHTML = `
        <div class="stat"><div class="n">${daysSince(relationshipStart)}</div><div class="l">days, so far</div></div>
        <div class="stat"><div class="n">${timeDiff(personA.timezone, personB.timezone)}</div><div class="l">time difference</div></div>
        <div class="stat"><div class="n">${localTime(personA.timezone)}</div><div class="l">${personA.name}, right now</div></div>
        <div class="stat"><div class="n">${localTime(personB.timezone)}</div><div class="l">${personB.name}, right now</div></div>
      `;
    }
    renderStats();
    setInterval(renderStats, 30000);
  })();

  /* ============================================================
     CHAPTER 02 — TIMELINE
     ============================================================ */
  (function timeline() {
    const list = $("#timeline-list");
    C.timeline.forEach((ev) => {
      const card = document.createElement("button");
      card.className = "tl-card";
      card.innerHTML = `
        <div class="date">${ev.date}</div>
        <div class="type">${ev.type}</div>
        <div class="title">${ev.title}</div>
        <div class="short">${ev.short}</div>
      `;
      card.addEventListener("click", () => {
        Modal.open(`
          <div class="tag">${ev.type} — ${ev.date}</div>
          <div class="m-title">${ev.title}</div>
          <div class="m-body">${escapeHTML(ev.long).replace(/\n/g, "<br>")}</div>
          ${ev.quote ? `<div class="m-quote">${escapeHTML(ev.quote)}</div>` : ""}
        `);
      });
      list.appendChild(card);
    });
  })();

  /* ============================================================
     CHAPTER 03 — ARTIFACTS
     ============================================================ */
  (function artifacts() {
    const grid = $("#artifact-grid");
    C.artifacts.forEach((a) => {
      const card = document.createElement("button");
      card.className = "card";
      card.innerHTML = `
        <div><span class="tag">${a.type}</span><div class="ctitle">${a.title}</div></div>
        <div class="cdate">${a.date}</div>
      `;
      card.addEventListener("click", () => {
        let extra = "";
        if (a.type === "SONG" && a.spotify) extra = spotifyEmbedHTML(a.spotify);
        else if (a.type === "SONG") extra = `<p class="muted mt-24" style="font-size:13px;">No song linked yet — add a Spotify link in content.js.</p>`;
        if (a.type === "VOICE") extra += audioPlayerHTML(a.id, a.title, "", a.audio);
        Modal.open(`
          <div class="tag">${a.type} — ${a.date}</div>
          <div class="m-title">${a.title}</div>
          <div class="m-body">${escapeHTML(a.body || "")}</div>
          ${extra}
        `);
        if (a.type === "VOICE") wireAudioPlayer(a.id, a.audio);
      });
      grid.appendChild(card);
    });
  })();

  /* ============================================================
     AUDIO PLAYER (shared component, used in sound chapter + modals)
     ============================================================ */
  function audioPlayerHTML(id, title, note, src) {
    return `
      <div class="player mt-24" data-player="${id}">
        <button class="player-btn" data-play="${id}" aria-label="Play ${escapeHTML(title)}">
          <svg width="12" height="12" viewBox="0 0 16 16" data-icon="${id}"><polygon points="3,1 15,8 3,15" fill="#F2EDE3"/></svg>
        </button>
        <div class="player-info">
          <div class="player-title">${escapeHTML(title)}</div>
          ${note ? `<div class="player-note">${escapeHTML(note)}</div>` : ""}
          <div class="progress-bar mt-24" data-bar="${id}"><div class="progress-fill" data-fill="${id}"></div></div>
        </div>
        <div class="waveform" data-wave="${id}"><span style="height:5px"></span><span style="height:12px"></span><span style="height:8px"></span><span style="height:15px"></span><span style="height:6px"></span></div>
      </div>
    `;
  }
  function wireAudioPlayer(id, src) {
    const btn = $(`[data-play="${id}"]`);
    const icon = $(`[data-icon="${id}"]`);
    const bar = $(`[data-bar="${id}"]`);
    const fill = $(`[data-fill="${id}"]`);
    const wave = $(`[data-wave="${id}"]`);
    if (!btn) return;
    if (!src) {
      btn.addEventListener("click", () => toast("This voice note hasn't been added yet."));
      return;
    }
    const el = new Audio(src);
    AudioManager.register(id, el, () => {
      icon.innerHTML = `<polygon points="3,1 15,8 3,15" fill="#F2EDE3"/>`;
      wave.classList.remove("playing");
    });
    btn.addEventListener("click", () => {
      if (el.paused) {
        AudioManager.playForeground(el);
        icon.innerHTML = `<rect x="2" y="1" width="4" height="14" fill="#F2EDE3"/><rect x="10" y="1" width="4" height="14" fill="#F2EDE3"/>`;
        wave.classList.add("playing");
      } else {
        AudioManager.stopForeground(el);
        icon.innerHTML = `<polygon points="3,1 15,8 3,15" fill="#F2EDE3"/>`;
        wave.classList.remove("playing");
      }
    });
    el.addEventListener("timeupdate", () => {
      if (el.duration) fill.style.width = (el.currentTime / el.duration) * 100 + "%";
    });
    el.addEventListener("ended", () => {
      icon.innerHTML = `<polygon points="3,1 15,8 3,15" fill="#F2EDE3"/>`;
      wave.classList.remove("playing");
      fill.style.width = "0%";
    });
    bar.addEventListener("click", (e) => {
      if (!el.duration) return;
      const rect = bar.getBoundingClientRect();
      el.currentTime = ((e.clientX - rect.left) / rect.width) * el.duration;
    });
  }
  function spotifyEmbedHTML(link) {
    return `
      <div class="spotify-frame mt-24">
        <div class="sp-note">
          <div class="eyebrow">on spotify</div>
        </div>
        <a href="${escapeAttr(link)}" target="_blank" rel="noopener">open track ↗</a>
      </div>
    `;
  }
  function escapeHTML(s) { return (s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  function escapeAttr(s) { return escapeHTML(s); }

  /* ============================================================
     CHAPTER 04 — SOUND OF US
     ============================================================ */
  (function sound() {
    const tabsEl = $("#sound-tabs");
    const listEl = $("#sound-list");
    C.sound.categories.forEach((cat, i) => {
      const tab = document.createElement("button");
      tab.className = "sound-tab" + (i === 0 ? " active" : "");
      tab.textContent = cat.label;
      tab.addEventListener("click", () => {
        $$(".sound-tab").forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        renderCategory(cat);
      });
      tabsEl.appendChild(tab);
    });
    function renderCategory(cat) {
      listEl.innerHTML = "";
      cat.items.forEach((item) => {
        if (item.spotify) {
          const wrap = document.createElement("div");
          wrap.innerHTML = `<div class="player"><div class="player-info"><div class="player-title">${escapeHTML(item.title)}</div><div class="player-note">${escapeHTML(item.note || "")}</div></div></div>`;
          wrap.querySelector(".player").insertAdjacentHTML("beforeend", `<a class="small-btn" href="${escapeAttr(item.spotify)}" target="_blank" rel="noopener">open ↗</a>`);
          listEl.appendChild(wrap.firstChild);
        } else {
          const div = document.createElement("div");
          div.innerHTML = audioPlayerHTML(item.id, item.title, item.note, item.audio);
          listEl.appendChild(div.firstElementChild);
          wireAudioPlayer(item.id, item.audio);
        }
      });
    }
    renderCategory(C.sound.categories[0]);
  })();

  /* ============================================================
     CHAPTER 05 — KNOWLEDGE WALL (flip cards)
     ============================================================ */
  (function knowledge() {
    const grid = $("#knowledge-grid");
    C.knowledgeWall.forEach((item) => {
      const card = document.createElement("div");
      card.className = "flip-card";
      card.innerHTML = `
        <div class="flip-inner">
          <button class="flip-face flip-front" aria-label="Reveal answer">${escapeHTML(item.front)}</button>
          <div class="flip-face flip-back">${escapeHTML(item.back)}</div>
        </div>
      `;
      card.querySelector("button").addEventListener("click", () => card.classList.toggle("flipped"));
      grid.appendChild(card);
    });
  })();

  /* ============================================================
     CHAPTER 06 — SEALED CARDS
     ============================================================ */
  (function sealed() {
    const grid = $("#sealed-grid");
    C.sealedCards.forEach((c) => {
      const card = document.createElement("button");
      card.className = "seal-card";
      card.innerHTML = `
        <div class="seal-mark">sealed</div>
        <div class="seal-type">${c.type}</div>
        <div class="seal-body">${escapeHTML(c.body)}</div>
      `;
      card.addEventListener("click", () => card.classList.toggle("open"));
      grid.appendChild(card);
    });
  })();

  /* ============================================================
     CHAPTER 07 — OPEN WHEN
     ============================================================ */
  (function openWhen() {
    const grid = $("#envelope-grid");
    C.openWhen.forEach((ow) => {
      const locked = ow.lockedUntil && new Date(ow.lockedUntil) > new Date();
      const env = document.createElement("button");
      env.className = "envelope" + (locked ? " locked" : "");
      env.innerHTML = `<span class="env-label">${ow.label}</span>`;
      env.addEventListener("click", () => {
        if (locked) {
          toast(`This one unlocks on ${new Date(ow.lockedUntil).toLocaleDateString()}.`);
          return;
        }
        Modal.open(`
          <div class="tag">${ow.label}</div>
          <div class="m-body mt-24">${escapeHTML(ow.body).replace(/\n/g, "<br>")}</div>
          ${ow.audio ? audioPlayerHTML(ow.id, "voice note", "", ow.audio) : ""}
        `);
        if (ow.audio) wireAudioPlayer(ow.id, ow.audio);
      });
      grid.appendChild(env);
    });
  })();

  /* ============================================================
     CHAPTER 08 — PRIVATE LANGUAGE
     ============================================================ */
  (function language() {
    const wrap = $("#dict-list");
    C.privateLanguage.forEach((d) => {
      const entry = document.createElement("div");
      entry.className = "dict-entry";
      entry.innerHTML = `
        <div class="dict-word">${escapeHTML(d.word)}</div>
        <div class="dict-row">
          <div class="dict-col strike"><div class="k">what people think it means</div><div class="v">${escapeHTML(d.others)}</div></div>
          <div class="dict-col"><div class="k">what it actually means</div><div class="v">${escapeHTML(d.actually)}</div></div>
        </div>
      `;
      wrap.appendChild(entry);
    });
  })();

  /* ============================================================
     CHAPTER 09 — LITTLE THINGS WALL
     ============================================================ */
  (function little() {
    const wall = $("#wall");
    C.littleThings.forEach((n) => {
      const note = document.createElement("div");
      note.className = "note";
      note.textContent = n.text;
      wall.appendChild(note);
    });
  })();

  /* ============================================================
     CHAPTER 10 — IF YOU WERE HERE
     ============================================================ */
  (function ifHere() {
    const btnWrap = $("#scenario-btns");
    const textEl = $("#scenario-text");
    C.ifYouWereHere.forEach((s, i) => {
      const btn = document.createElement("button");
      btn.className = "scenario-btn" + (i === 0 ? " active" : "");
      btn.textContent = s.label;
      btn.addEventListener("click", () => {
        $$(".scenario-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        textEl.classList.remove("show");
        setTimeout(() => { textEl.textContent = s.text; textEl.classList.add("show"); }, reducedMotion ? 0 : 250);
      });
      btnWrap.appendChild(btn);
    });
    textEl.textContent = C.ifYouWereHere[0].text;
    requestAnimationFrame(() => textEl.classList.add("show"));
  })();

  /* ============================================================
     CHAPTER 11 — FUTURE CHECKLIST
     ============================================================ */
  (function future() {
    const wrap = $("#future-checklist");
    C.future.forEach((item) => {
      const done = state.futureDone[item.id] ?? item.done;
      const row = document.createElement("button");
      row.className = "check-item" + (done ? " done" : "");
      row.innerHTML = `
        <span class="check-box"><svg viewBox="0 0 12 12"><polyline points="1,6 4,9 11,1" fill="none" stroke="#C9B89A" stroke-width="1.5"/></svg></span>
        <span class="check-text">${escapeHTML(item.text)}</span>
      `;
      row.addEventListener("click", () => {
        const nowDone = !row.classList.contains("done");
        row.classList.toggle("done", nowDone);
        state.futureDone[item.id] = nowDone;
        saveState();
      });
      wrap.appendChild(row);
    });
  })();

  /* ============================================================
     CHAPTER 12 — FIRST PHOTOGRAPH
     ============================================================ */
  (function photo() {
    const frame = $("#photo-frame");
    const text = $("#frame-text");
    const f = C.firstPhotograph;
    if (f.state === "FILLED" && f.image) {
      frame.innerHTML = `<img src="${escapeAttr(f.image)}" alt="${escapeAttr(f.caption || '')}">`;
    } else if (f.state === "RESERVED") {
      text.innerHTML = `<div class="l1">reserved.</div><div class="l2">for the photograph we haven't taken yet.</div>`;
    } else {
      text.innerHTML = `<div class="l1">empty.</div><div class="l2">on purpose.</div>`;
    }
  })();

  /* ============================================================
     CHAPTER 13 — FIRST MEETING
     ============================================================ */
  (function meeting() {
    const m = C.firstMeeting;
    $("#meet-scene").textContent = `${m.location} · ${m.time} · ${m.weather} · ${m.sounds}`;
    const btns = [
      { label: "what I'm thinking", key: "imThinking" },
      { label: "what I'm probably doing", key: "imProbablyDoing" },
      { label: "what you're probably doing", key: "theyreProbablyDoing" },
      { label: "what happens next", key: "whatHappensNext", final: true },
    ];
    const wrap = $("#meet-btns");
    const reveal = $("#meet-reveal");
    btns.forEach((b) => {
      const btn = document.createElement("button");
      btn.className = "scenario-btn";
      btn.textContent = b.label;
      btn.addEventListener("click", () => {
        reveal.textContent = m[b.key];
        if (b.final) revealDistance();
      });
      wrap.appendChild(btn);
    });

    function revealDistance() {
      const distWrap = $("#meet-distance-wrap");
      distWrap.style.display = "block";
      const distEl = $("#meet-distance");
      const finalEl = $("#meet-final");
      let n = 1000;
      if (reducedMotion) { distEl.textContent = "0"; finalEl.textContent = "finally."; return; }
      const timer = setInterval(() => {
        n = Math.max(0, n - Math.ceil(n / 8) - 1);
        distEl.textContent = n + " km";
        if (n === 0) {
          clearInterval(timer);
          distEl.textContent = "0";
          setTimeout(() => (finalEl.textContent = "finally."), 400);
        }
      }, 90);
    }
  })();

  /* ============================================================
     EXTRAS — TODAY / GENERATOR / QUIZ / TIME CAPSULES
     ============================================================ */
  (function today() {
    const box = $("#daily-box");
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const pick = C.daily[dayOfYear % C.daily.length];
    box.innerHTML = `<div class="eyebrow">${pick.type}</div><p class="serif-lg" style="font-size:1.4rem; margin-top:10px;">${escapeHTML(pick.text)}</p>`;
  })();

  (function generator() {
    const box = $("#prompt-box");
    const btn = $("#prompt-btn");
    btn.addEventListener("click", () => {
      const p = C.prompts[Math.floor(Math.random() * C.prompts.length)];
      box.style.opacity = 0;
      setTimeout(() => { box.textContent = p; box.style.opacity = 1; }, reducedMotion ? 0 : 200);
    });
  })();

  (function quiz() {
    const box = $("#quiz-box");
    let i = 0, score = 0;
    function render() {
      if (i >= C.quiz.length) {
        box.innerHTML = `<div class="eyebrow">done</div><p class="serif-lg" style="font-size:1.5rem; margin-top:10px;">${score} / ${C.quiz.length}</p><button class="small-btn mt-24" id="quiz-restart">play again</button>`;
        $("#quiz-restart").addEventListener("click", () => { i = 0; score = 0; render(); });
        return;
      }
      const q = C.quiz[i];
      box.innerHTML = `
        <div class="eyebrow">question ${i + 1} of ${C.quiz.length}</div>
        <p class="serif-lg" style="font-size:1.3rem; margin:12px 0 4px;">${escapeHTML(q.q)}</p>
        <div id="quiz-options"></div>
        <p class="muted mt-24" id="quiz-explain" style="display:none; font-size:13px;"></p>
        <button class="small-btn mt-24" id="quiz-next" style="display:none;">next</button>
      `;
      const optsEl = $("#quiz-options", box);
      q.options.forEach((opt, idx) => {
        const b = document.createElement("button");
        b.className = "quiz-option";
        b.textContent = opt;
        b.addEventListener("click", () => {
          $$(".quiz-option", box).forEach((o) => (o.disabled = true));
          if (idx === q.correct) { b.classList.add("correct"); score++; }
          else {
            b.classList.add("wrong");
            optsEl.children[q.correct].classList.add("correct");
          }
          $("#quiz-explain", box).style.display = "block";
          $("#quiz-explain", box).textContent = q.explanation;
          $("#quiz-next", box).style.display = "inline-block";
        });
        optsEl.appendChild(b);
      });
      $("#quiz-next", box).addEventListener("click", () => { i++; render(); });
    }
    render();
  })();

  (function capsules() {
    const wrap = $("#capsule-list");
    C.timeCapsules.forEach((tc) => {
      const locked = new Date(tc.unlockDate) > new Date();
      const div = document.createElement("div");
      div.className = "capsule" + (locked ? " locked" : "");
      if (locked) {
        div.innerHTML = `<div class="eyebrow">${tc.label}</div><p class="muted mt-24" style="font-size:13px;">locked until ${new Date(tc.unlockDate).toLocaleDateString()}</p>`;
      } else {
        div.innerHTML = `<div class="eyebrow">${tc.label}</div><p class="mt-24" style="font-size:14px;">${escapeHTML(tc.message)}</p>`;
      }
      wrap.appendChild(div);
    });
  })();

  /* ============================================================
     LETTER
     ============================================================ */
  (function letter() {
    const env = $("#letter-envelope");
    const gate = $("#letter-gate");
    const full = $("#letter-full");
    const L = C.letter;
    $("#letter-date").textContent = L.date;
    $("#letter-title").textContent = L.title;
    $("#letter-body").textContent = L.body;
    $("#letter-sig").textContent = L.signature;
    $("#letter-final").textContent = L.finalLine;

    function open() {
      gate.style.display = "none";
      full.classList.add("show");
    }
    env.addEventListener("click", open);
    env.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") open(); });

    $("#letter-continue").addEventListener("click", () => {
      full.classList.remove("show");
      gate.style.display = "flex";
      $("#ch-final-voice").style.display = "flex";
      $("#ch-final-voice").scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
      setTimeout(() => $("#fv-line2").classList.add("show"), 1400);
      setTimeout(() => $("#fv-play").style.opacity = 1, 2600);
    });
  })();

  /* ============================================================
     FINAL VOICE NOTE
     ============================================================ */
  (function finalVoice() {
    const playBtn = $("#fv-play");
    const waveform = $("#fv-waveform");
    const finalLine = $("#fv-final");
    const src = C.finalVoiceNote.audio;
    let played = false;

    playBtn.addEventListener("click", () => {
      if (played) return;
      played = true;
      playBtn.style.display = "none";
      waveform.style.display = "flex";
      waveform.classList.add("playing");
      if (src) {
        const el = new Audio(src);
        AudioManager.playForeground(el);
        el.addEventListener("ended", onEnd);
      } else {
        toast("Add your final voice note in content.js.");
        setTimeout(onEnd, 3000);
      }
    });

    function onEnd() {
      waveform.classList.remove("playing");
      setTimeout(() => {
        finalLine.classList.add("show");
        setTimeout(showClosing, 2600);
      }, 1600); // hold the silence
    }

    function showClosing() {
      const closing = $("#ch-closing");
      closing.style.display = "flex";
      closing.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
      setTimeout(() => {
        const dotA = $("#closing-dot-a"), dotB = $("#closing-dot-b"), line = $("#closing-line");
        if (!reducedMotion) {
          dotA.style.transition = "cx 1800ms cubic-bezier(0.22,1,0.36,1)";
          dotB.style.transition = "cx 1800ms cubic-bezier(0.22,1,0.36,1)";
          line.style.transition = "x1 1800ms cubic-bezier(0.22,1,0.36,1), x2 1800ms cubic-bezier(0.22,1,0.36,1)";
        }
        dotA.setAttribute("cx", 190); dotB.setAttribute("cx", 310);
        line.setAttribute("x1", 190); line.setAttribute("x2", 310);
      }, 500);
    }

    $("#close-btn").addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
      toast("the archive stays open. come back whenever you want.");
    });
  })();

  /* ============================================================
     SECRET SYSTEM — 12 discoverable secrets
     ============================================================ */
  const Secrets = (() => {
    const counterEl = $("#secret-counter");
    function found(id) {
      if (state.secretsFound.includes(id)) return;
      state.secretsFound.push(id);
      saveState();
      updateCounter();
      const n = state.secretsFound.length;
      toast(`a secret, found. (${n} / ${C.secrets.total})`);
      C.secrets.unlocks.forEach((u) => {
        if (u.at === n) {
          setTimeout(() => {
            Modal.open(`<div class="tag">unlocked</div><div class="m-title">${escapeHTML(u.label)}</div><div class="m-body">${escapeHTML(u.content)}</div>`);
          }, 1600);
        }
      });
    }
    function updateCounter() {
      if (state.secretsFound.length === 0) return;
      counterEl.textContent = `${state.secretsFound.length} / ${C.secrets.total} found`;
      counterEl.classList.add("show");
    }
    updateCounter();
    return { found };
  })();

  // --- concrete secret triggers ---
  // 1. click the monogram "us" five times fast
  (function () {
    let count = 0, timer;
    $("#home-btn").addEventListener("click", () => {
      count++;
      clearTimeout(timer);
      timer = setTimeout(() => (count = 0), 1200);
      if (count >= 5) { Secrets.found("s_monogram"); count = 0; }
    });
  })();

  // 2. type the word "hi" anywhere
  (function () {
    let buffer = "";
    window.addEventListener("keydown", (e) => {
      if (e.key.length === 1) {
        buffer = (buffer + e.key).slice(-2).toLowerCase();
        if (buffer === "hi") Secrets.found("s_typehi");
      }
    });
  })();

  // 3. hold the first photograph frame for 2 seconds
  (function () {
    const frame = $("#photo-frame");
    let t;
    const start = () => { t = setTimeout(() => Secrets.found("s_frame_hold"), 2000); };
    const cancel = () => clearTimeout(t);
    frame.addEventListener("mousedown", start);
    frame.addEventListener("touchstart", start);
    ["mouseup", "mouseleave", "touchend"].forEach((ev) => frame.addEventListener(ev, cancel));
  })();

  // 4. click the tiny period at the end of the opening's "begin" screen text, 3x
  (function () {
    let n = 0;
    const el = $("#opening-begin-label");
    el.addEventListener("click", (e) => {
      n++;
      if (n >= 3) Secrets.found("s_begin_label");
    });
  })();

  // 5. scroll all the way to the bottom of the "little things" wall and back up quickly (up-arrow key twice at top)
  (function () {
    let upPresses = 0;
    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp" && window.scrollY < 20) {
        upPresses++;
        if (upPresses >= 2) Secrets.found("s_arrowup_top");
      } else if (e.key !== "ArrowUp") {
        upPresses = 0;
      }
    });
  })();

  // 6. open every sealed card in chapter 6
  (function () {
    const total = C.sealedCards.length;
    let opened = new Set();
    document.addEventListener("click", (e) => {
      const card = e.target.closest(".seal-card");
      if (card && card.classList.contains("open")) {
        const idx = $$(".seal-card").indexOf(card);
        opened.add(idx);
        if (opened.size >= total) Secrets.found("s_all_sealed");
      }
    });
  })();

  // Remaining secrets (7–12) are left as an exercise for you to hide in your
  // own content — e.g. a specific quiz score, visiting every open-when
  // envelope, finding a particular word in the private-language dictionary,
  // or a phrase only the two of you would think to type. Call
  // Secrets.found("your_secret_id") from anywhere in this file to wire one up.
  // The counter and unlock system already work for all 12.

  /* ============================================================
     STARFIELD — fixed canvas behind the whole page. A quiet field
     of stars with a slow twinkle, plus a rare, slow shooting star.
     Fully static (no animation loop at all) when reduced-motion
     is on.
     ============================================================ */
  (function starfield() {
    const canvas = $("#starfield");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let stars = [];
    let w, h, dpr;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round((w * h) / 9000);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.1 + 0.2,
        base: Math.random() * 0.5 + 0.25,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.0016 + 0.0006,
      }));
    }

    function drawStatic() {
      ctx.clearRect(0, 0, w, h);
      stars.forEach((s) => {
        ctx.globalAlpha = s.base;
        ctx.fillStyle = "#F2EEDD";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    }

    let shooting = null;
    function maybeSpawnShootingStar() {
      if (shooting || Math.random() > 0.15) return;
      const startX = Math.random() * w * 0.6;
      shooting = { x: startX, y: -10, vx: 4.2, vy: 2.6, life: 0, maxLife: 60 };
    }

    function drawAnimated(t) {
      ctx.clearRect(0, 0, w, h);
      stars.forEach((s) => {
        const twinkle = s.base + Math.sin(t * s.speed + s.phase) * 0.28;
        ctx.globalAlpha = Math.max(0, Math.min(1, twinkle));
        ctx.fillStyle = "#F2EEDD";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      if (shooting) {
        const s = shooting;
        s.x += s.vx; s.y += s.vy; s.life++;
        const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 8, s.y - s.vy * 8);
        grad.addColorStop(0, "rgba(233,217,166,0.9)");
        grad.addColorStop(1, "rgba(233,217,166,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 8, s.y - s.vy * 8);
        ctx.stroke();
        if (s.life > s.maxLife || s.y > h + 20) shooting = null;
      } else {
        maybeSpawnShootingStar();
      }

      requestAnimationFrame(drawAnimated);
    }

    resize();
    window.addEventListener("resize", resize);

    if (reducedMotion) {
      drawStatic();
    } else {
      requestAnimationFrame(drawAnimated);
    }
  })();

  /* ============================================================
     UNDER THE SAME SKY — faith chapter
     ============================================================ */
  (function faith() {
    const F = C.faith;
    if (!F) return;
    const eyebrow = $("#faith-eyebrow");
    const title = $("#faith-title");
    const intro = $("#faith-intro");
    const list = $("#verse-list");
    const closing = $("#faith-closing");
    if (!eyebrow || !list) return;

    eyebrow.textContent = F.eyebrow || "";
    title.textContent = F.title || "";
    intro.textContent = F.intro || "";
    list.innerHTML = (F.verses || [])
      .map(
        (v) => `
      <div class="verse-card">
        <span class="v-ref">${escapeHTML(v.reference)}</span><span class="v-theme">${escapeHTML(v.theme || "")}</span>
        <div class="v-text">${escapeHTML(v.text)}</div>
      </div>`
      )
      .join("");
    closing.textContent = F.closing || "";
  })();

  /* ============================================================
     IN ANOTHER LANGUAGE — poetry chapter
     ============================================================ */
  (function poetry() {
    const P = C.poetry;
    if (!P) return;
    const eyebrow = $("#poetry-eyebrow");
    const title = $("#poetry-title");
    const intro = $("#poetry-intro");
    const list = $("#poetry-list");
    if (!eyebrow || !list) return;

    eyebrow.textContent = P.eyebrow || "";
    title.textContent = P.title || "";
    intro.textContent = P.intro || "";
    list.innerHTML = (P.entries || [])
      .map(
        (p) => `
      <div class="poetry-entry">
        <div class="p-poet">${escapeHTML(p.poet)}</div>
        <div class="p-title">${escapeHTML(p.workTitle || "")}</div>
        <div class="p-excerpt">${escapeHTML(p.excerpt).replace(/\n/g, "<br>")}</div>
        <div class="p-note">${escapeHTML(p.note || "")}</div>
      </div>`
      )
      .join("");
  })();

})();
