/* ============================================================
   BETWEEN HERE AND THERE — engine
   One path. No menu. You control the pace.
   ============================================================ */
(function(){
  const C = window.CONTENT;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- utilities ---------- */
  const $ = (s,r=document)=>r.querySelector(s);
  const el = (tag, cls, html)=>{ const e=document.createElement(tag); if(cls) e.className=cls; if(html!==undefined) e.innerHTML=html; return e; };
  const daysBetween = (a,b)=> Math.floor((b-a)/86400000);
  const fmtNum = n => n.toLocaleString();

  function moonPhase(date){
    // simple synodic approximation, good enough to be true "today"
    const synodic = 29.530588853;
    const known = new Date(Date.UTC(2000,0,6,18,14));
    const days = (date - known) / 86400000;
    let phase = (days % synodic) / synodic;
    if (phase < 0) phase += 1;
    return phase; // 0 = new, 0.5 = full
  }
  function moonLabel(p){
    if (p < 0.02 || p > 0.98) return 'new moon';
    if (p < 0.24) return 'waxing crescent';
    if (p < 0.26) return 'first quarter';
    if (p < 0.49) return 'waxing gibbous';
    if (p < 0.51) return 'full moon';
    if (p < 0.74) return 'waning gibbous';
    if (p < 0.76) return 'last quarter';
    return 'waning crescent';
  }
  function renderMoon(container){
    const p = moonPhase(new Date());
    const wrap = el('div','moon-wrap');
    const moon = el('div','moon');
    // shift the shadow across based on phase
    const offset = (p<=0.5 ? (0.5-p) : (p-0.5)) * 2; // 0 (full) -> 1 (new)
    const dir = p<=0.5 ? 1 : -1;
    const shadow = el('div','shadow');
    shadow.style.transform = `translateX(${dir*offset*100}%)`;
    moon.appendChild(shadow);
    wrap.appendChild(moon);
    const label = el('p','eyebrow', moonLabel(p) + ' tonight');
    label.style.textAlign='center'; label.style.marginTop='10px';
    container.appendChild(wrap);
    container.appendChild(label);
  }

  /* ---------- sky: layered starfield ---------- */
  const skyRoot = el('div'); skyRoot.id='sky';
  document.body.prepend(skyRoot);
  const layers = [
    {n:70, speed:0.02, size:[0.5,1.1], alpha:0.5},
    {n:50, speed:0.05, size:[0.8,1.6], alpha:0.75},
    {n:26, speed:0.09, size:[1.2,2.4], alpha:1}
  ];
  const canvases = layers.map(()=>{ const c=document.createElement('canvas'); skyRoot.appendChild(c); return c; });
  let W=innerWidth, H=innerHeight, mx=0.5, my=0.5;
  let stars = [];
  function seedStars(){
    stars = layers.map(L=>{
      const arr=[];
      for(let i=0;i<L.n;i++){
        arr.push({ x: Math.random()*W, y: Math.random()*H*0.9, r: L.size[0]+Math.random()*(L.size[1]-L.size[0]),
          tw: Math.random()*Math.PI*2, tws: 0.01+Math.random()*0.02 });
      }
      return arr;
    });
  }
  function resize(){
    W=innerWidth; H=innerHeight;
    canvases.forEach(c=>{ c.width=W*devicePixelRatio; c.height=H*devicePixelRatio; c.style.width=W+'px'; c.style.height=H+'px'; });
    seedStars();
  }
  let shooting = null;
  function maybeShoot(){
    if (reduced) return;
    if (!shooting && Math.random() < 0.006){
      shooting = { x: Math.random()*W*0.6+W*0.2, y: Math.random()*H*0.2, t:0, len: 140+Math.random()*100, ang: 0.55+Math.random()*0.2 };
    }
  }
  function draw(t){
    layers.forEach((L,i)=>{
      const cv = canvases[i]; const ctx = cv.getContext('2d');
      ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
      ctx.clearRect(0,0,W,H);
      const px = (mx-0.5) * L.speed * 60;
      const py = (my-0.5) * L.speed * 60;
      stars[i].forEach(s=>{
        const tw = reduced ? L.alpha : L.alpha * (0.6+0.4*Math.sin(s.tw + t*s.tws));
        ctx.beginPath();
        ctx.fillStyle = `rgba(245,241,230,${tw})`;
        ctx.arc(s.x+px, s.y+py, s.r, 0, Math.PI*2);
        ctx.fill();
      });
      if (i===2){
        maybeShoot();
        if (shooting){
          shooting.t += 1;
          const p = shooting.t/24;
          if (p<=1){
            const x2 = shooting.x + Math.cos(shooting.ang)*shooting.len*p;
            const y2 = shooting.y + Math.sin(shooting.ang)*shooting.len*p;
            const x1 = shooting.x + Math.cos(shooting.ang)*shooting.len*Math.max(0,p-0.4);
            const y1 = shooting.y + Math.sin(shooting.ang)*shooting.len*Math.max(0,p-0.4);
            const grad = ctx.createLinearGradient(x1,y1,x2,y2);
            grad.addColorStop(0,'rgba(232,199,122,0)');
            grad.addColorStop(1,'rgba(245,241,230,0.95)');
            ctx.strokeStyle = grad; ctx.lineWidth=1.6; ctx.lineCap='round';
            ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
          } else { shooting=null; }
        }
      }
    });
    requestAnimationFrame(draw);
  }
  addEventListener('resize', resize);
  addEventListener('mousemove', e=>{ mx=e.clientX/innerWidth; my=e.clientY/innerHeight; });
  resize(); requestAnimationFrame(draw);

  const nebula = el('div'); nebula.id='nebula'; document.body.prepend(nebula);
  document.body.appendChild(el('div','grain'));
  document.body.appendChild(el('div','vignette'));

  /* ---------- persistent arc (progress + motif) ---------- */
  const arcWrap = el('div'); arcWrap.id='arc-wrap';
  arcWrap.innerHTML = `<svg id="arc-svg" viewBox="0 0 500 60" preserveAspectRatio="xMidYMid meet">
    <path id="arc-track" d="M20,45 Q250,-10 480,45"></path>
    <path id="arc-fill" d="M20,45 Q250,-10 480,45"></path>
    <circle class="arc-dot lit" cx="20" cy="45" r="3.5"></circle>
    <circle class="arc-dot" id="arc-end" cx="480" cy="45" r="3.5"></circle>
  </svg>`;
  document.body.appendChild(arcWrap);
  const arcFill = $('#arc-fill');
  const arcLen = () => arcFill.getTotalLength();

  /* ---------- sequencer shell ---------- */
  const stage = el('div'); stage.id='stage'; document.body.appendChild(stage);
  const navctl = el('div'); navctl.id='navctl';
  navctl.innerHTML = `
    <button class="nav-btn" id="prevBtn" aria-label="Back"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M15 5l-7 7 7 7"/></svg></button>
    <span class="hint">space or → to continue</span>
    <button class="nav-btn" id="nextBtn" aria-label="Continue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 5l7 7-7 7"/></svg></button>`;
  document.body.appendChild(navctl);
  const counter = el('div'); counter.id='counter'; document.body.appendChild(counter);

  const scenes = []; // {build(container), onEnter?, onLeave?}
  function addScene(build){ scenes.push({build}); }

  let current = -1;
  let built = new Set();

  function renderArc(){
    const frac = scenes.length<=1 ? 0 : Math.max(0,current)/(scenes.length-1);
    const len = arcLen();
    arcFill.style.strokeDasharray = len;
    arcFill.style.strokeDashoffset = len*(1-frac);
    $('#arc-end').classList.toggle('lit', frac>=0.999);
  }

  function goTo(i){
    if (i<0 || i>=scenes.length) return;
    const prevIdx = current;
    current = i;
    stage.querySelectorAll('.scene').forEach((s,idx)=>{
      s.classList.toggle('active', idx===i);
    });
    const sc = stage.children[i];
    if (!built.has(i)){
      built.add(i);
      const ig = el('div','ignite'); ig.innerHTML='<span></span>';
      sc.appendChild(ig);
      setTimeout(()=>ig.remove(), 950);
    }
    counter.textContent = `${i+1} / ${scenes.length}`;
    $('#prevBtn').disabled = i===0;
    $('#nextBtn').disabled = i===scenes.length-1;
    arcWrap.classList.toggle('show', i>0);
    renderArc();
    if (typeof sc._onEnter === 'function' && !sc._entered){ sc._entered = true; sc._onEnter(); }
  }
  function next(){ goTo(current+1); }
  function prev(){ goTo(current-1); }

  $('#nextBtn').addEventListener('click', next);
  $('#prevBtn').addEventListener('click', prev);
  document.addEventListener('keydown', e=>{
    if (['Space','ArrowRight'].includes(e.code)){ e.preventDefault(); next(); }
    if (e.code==='ArrowLeft'){ prev(); }
  });
  let touchX=null;
  addEventListener('touchstart', e=> touchX = e.touches[0].clientX);
  addEventListener('touchend', e=>{
    if (touchX===null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 60){ dx<0 ? next() : prev(); }
    touchX = null;
  });
  navctl.classList.add('show-hint');
  setTimeout(()=>navctl.classList.remove('show-hint'), 5000);

  /* ============================================================
     SCENE BUILDERS
     ============================================================ */
  const R = C.relationship;

  function sceneShell(cls=''){
    const s = el('div','scene'); const inner = el('div','scene-inner '+cls); s.appendChild(inner);
    stage.appendChild(s); return inner;
  }

  // -------- 0. cover --------
  addScene(()=>{
    const s = sceneShell();
    s.innerHTML = `
      <p class="eyebrow">something I made for you</p>
      <h1 class="big" style="margin-top:18px">between <em>here</em><br>and there.</h1>
      <p class="lede" style="margin:22px auto 0">${R.personA.city} to ${R.personB.city}. headphones recommended.</p>
      <button class="cta" id="beginBtn" style="margin-top:34px">begin</button>`;
    s.querySelector('#beginBtn').addEventListener('click', next);
  });

  // -------- 1. you are here / i am here --------
  addScene(()=>{
    const s = sceneShell();
    s.innerHTML = `<p class="big">you are here.<br><em>i am here.</em></p>`;
  });

  // -------- 2. the distance (stat panel + map) --------
  addScene(()=>{
    const s = sceneShell();
    s.innerHTML = `<p class="eyebrow">the distance</p>
      <h2 class="big" style="font-size:clamp(2rem,5vw,3.2rem);margin-top:14px">two cities, one sky.</h2>
      <div id="dist-map">
        <svg viewBox="0 0 500 200" preserveAspectRatio="xMidYMid meet">
          <path class="map-line" d="M90,90 Q250,20 410,120"></path>
          <circle class="map-dot" cx="90" cy="90" r="4"></circle>
          <circle class="map-dot" cx="410" cy="120" r="4"></circle>
        </svg>
      </div>
      <div class="stat-grid">
        <div class="stat-cell"><div class="who">${R.personA.name}</div><div class="clock" id="clockA">--:--</div><div class="place">${R.personA.city}, ${R.personA.country}</div></div>
        <div class="stat-cell"><div class="who">${R.personB.name}</div><div class="clock" id="clockB">--:--</div><div class="place">${R.personB.city}, ${R.personB.country}</div></div>
        <div class="stat-wide">
          <div><div class="figure" id="daysSince">-</div><div class="label">days since ${R.metDate}</div></div>
          <div><div class="figure" id="tzDiff">-</div><div class="label">hours apart</div></div>
        </div>
      </div>`;
    function tick(){
      const now = new Date();
      const optsTime = tz => now.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',timeZone:tz});
      $('#clockA').textContent = optsTime(R.personA.timezone);
      $('#clockB').textContent = optsTime(R.personB.timezone);
      const days = daysBetween(new Date(R.relationshipStart), now);
      $('#daysSince').textContent = fmtNum(days);
      const offA = new Date(now.toLocaleString('en-US',{timeZone:R.personA.timezone}));
      const offB = new Date(now.toLocaleString('en-US',{timeZone:R.personB.timezone}));
      $('#tzDiff').textContent = Math.abs(Math.round((offA-offB)/3600000));
    }
    tick(); setInterval(tick, 1000*30);
  });

  // -------- 3. faith: under the same sky --------
  if (C.faith){
    addScene(()=>{
      const s = sceneShell();
      const moonBox = el('div');
      s.appendChild(moonBox);
      s.innerHTML += `<p class="eyebrow">${C.faith.eyebrow||''}</p>
        <h2 class="big" style="font-size:clamp(2rem,5vw,3rem);margin-top:14px">${C.faith.title||''}</h2>
        <p class="lede" style="margin:18px auto 0">${C.faith.intro||''}</p>
        <div class="term-list" style="margin-top:34px">
          ${C.faith.verses.map(v=>`<div class="term-row"><dt style="font-family:var(--mono);font-size:11px;color:var(--gold);letter-spacing:0.06em">${v.reference} — ${v.theme}</dt><dd style="font-family:var(--serif);font-size:1.3rem;margin-top:8px;color:var(--ivory)">${v.text}</dd></div>`).join('')}
        </div>`;
      s.prepend(moonBox);
      renderMoon(moonBox);
    });
  }

  // -------- 4/5/6. sequential card sets: timeline / artifacts / sealed --------
  function sequentialScene({eyebrow, title, items, renderItem}){
    addScene(()=>{
      const s = sceneShell('left');
      const head = el('div'); head.innerHTML = `<p class="eyebrow" style="text-align:center">${eyebrow}</p><h2 class="big" style="font-size:clamp(1.8rem,4.5vw,2.6rem);text-align:center;margin-top:12px">${title}</h2>`;
      s.appendChild(head);
      const wrap = el('div','seq-wrap'); s.appendChild(wrap);
      let idx = 0;
      function render(){
        wrap.innerHTML = `<div class="seq-count">${idx+1} of ${items.length}</div>`;
        const card = el('div','seq-card'); card.innerHTML = renderItem(items[idx]);
        wrap.appendChild(card);
        const ctl = el('div','seq-controls');
        ctl.innerHTML = `<button class="seq-btn" id="sp">back</button><button class="seq-btn" id="sn">${idx<items.length-1?'next':'continue →'}</button>`;
        wrap.appendChild(ctl);
        $('#sp',wrap).disabled = idx===0;
        $('#sp',wrap).addEventListener('click', ()=>{ idx=Math.max(0,idx-1); render(); });
        $('#sn',wrap).addEventListener('click', ()=>{
          if (idx<items.length-1){ idx++; render(); } else { next(); }
        });
      }
      render();
    });
  }
  if (C.timeline?.length) sequentialScene({
    eyebrow:'a timeline of firsts', title:'how it started.',
    items: C.timeline,
    renderItem: t => `<div class="date">${t.date||''} — ${t.type||''}</div><h3>${t.title||''}</h3><p>${t.long||t.short||''}</p>${t.quote?`<p style="font-family:var(--hand);font-size:1.3rem;color:var(--gold);margin-top:14px">"${t.quote}"</p>`:''}`
  });
  if (C.artifacts?.length) sequentialScene({
    eyebrow:'the archive', title:'things we kept.',
    items: C.artifacts,
    renderItem: a => `<div class="date">${a.type||''}${a.date?' — '+a.date:''}</div><h3>${a.title||''}</h3><p>${a.body||''}</p>${a.image?`<div class="frame-box" style="max-width:320px"><img src="${a.image}" alt=""></div>`:''}${a.spotify?`<a class="cta" href="${a.spotify}" target="_blank" rel="noopener" style="display:inline-block;text-decoration:none;margin-top:14px">open in spotify</a>`:''}`
  });

  // -------- 7. sound / audio player --------
  function audioScene({eyebrow, title, items}){
    addScene(()=>{
      const s = sceneShell();
      s.innerHTML = `<p class="eyebrow">${eyebrow}</p><h2 class="big" style="font-size:clamp(1.8rem,4.5vw,2.6rem);margin-top:12px">${title}</h2>`;
      items.forEach(track=>{
        const p = el('div','player');
        if (track.spotify){
          p.innerHTML = `<p style="font-family:var(--serif);font-size:1.2rem;margin-bottom:10px">${track.label||track.title||''}</p>
            <a class="cta" href="${track.spotify}" target="_blank" rel="noopener" style="display:inline-block;text-decoration:none">open in spotify</a>`;
        } else if (track.audio){
          const id = 'a'+Math.random().toString(36).slice(2);
          p.innerHTML = `<p style="font-family:var(--serif);font-size:1.2rem;margin-bottom:10px">${track.label||track.title||''}</p>
            <div class="player-row">
              <button class="play-btn" data-id="${id}"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></button>
              <div class="p-track"><div class="p-bar" data-id="${id}"><div class="p-fill" data-id="${id}"></div></div>
              <div class="p-time"><span data-cur="${id}">0:00</span><span data-dur="${id}">0:00</span></div></div>
            </div>
            <audio data-audio="${id}" src="${track.audio}" preload="none"></audio>`;
        } else {
          p.innerHTML = `<p style="font-family:var(--serif);font-size:1.2rem;margin-bottom:6px">${track.label||track.title||''}</p>
            <p class="lede" style="font-size:0.85rem">[audio not added yet — drop a file in /audio or a Spotify link in content.js]</p>`;
        }
        s.appendChild(p);
      });
      // wire audio players, one-at-a-time
      let activeAudio = null;
      s.querySelectorAll('audio').forEach(audio=>{
        const id = audio.dataset.audio;
        const btn = s.querySelector(`.play-btn[data-id="${id}"]`);
        const bar = s.querySelector(`.p-bar[data-id="${id}"]`);
        const fill = s.querySelector(`.p-fill[data-id="${id}"]`);
        const cur = s.querySelector(`[data-cur="${id}"]`);
        const dur = s.querySelector(`[data-dur="${id}"]`);
        const fmt = sec => `${Math.floor(sec/60)}:${String(Math.floor(sec%60)).padStart(2,'0')}`;
        if (!btn) return;
        btn.addEventListener('click', ()=>{
          if (activeAudio && activeAudio!==audio){ activeAudio.pause(); }
          if (audio.paused){ audio.play().catch(()=>{}); activeAudio = audio; }
          else { audio.pause(); }
        });
        audio.addEventListener('play', ()=>{ btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>'; });
        audio.addEventListener('pause', ()=>{ btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'; });
        audio.addEventListener('loadedmetadata', ()=>{ dur.textContent = fmt(audio.duration||0); });
        audio.addEventListener('timeupdate', ()=>{
          cur.textContent = fmt(audio.currentTime);
          fill.style.width = (audio.currentTime/(audio.duration||1)*100)+'%';
        });
        bar.addEventListener('click', e=>{
          const r = bar.getBoundingClientRect();
          audio.currentTime = (e.clientX-r.left)/r.width * (audio.duration||0);
        });
      });
    });
  }
  if (C.sound?.categories?.length){
    C.sound.categories.forEach(cat=>{
      audioScene({
        eyebrow: 'the sound of us', title: cat.label ? cat.label.toLowerCase() : 'songs, voices.',
        items: (cat.items||[]).map(it=>({ label: it.title, audio: it.audio, spotify: it.spotify }))
      });
    });
  }

  // -------- 8. flip grid: knowledge wall --------
  if (C.knowledgeWall?.length){
    addScene(()=>{
      const s = sceneShell();
      s.innerHTML = `<p class="eyebrow">things you should know</p><h2 class="big" style="font-size:clamp(1.8rem,4.5vw,2.6rem);margin-top:12px">a small dictionary of me.</h2>
        <div class="flip-grid">${C.knowledgeWall.map(k=>`
          <div class="flip-card"><div class="flip-inner">
            <div class="flip-face front">${k.front||''}</div>
            <div class="flip-face back">${k.back||''}</div>
          </div></div>`).join('')}</div>`;
      s.querySelectorAll('.flip-card').forEach(c=>c.addEventListener('click', ()=>c.classList.toggle('flipped')));
    });
  }

  // -------- 9. sealed cards --------
  if (C.sealedCards?.length){
    sequentialScene({
      eyebrow:'sealed', title:'things you don\u2019t know about me.',
      items: C.sealedCards,
      renderItem: () => ''
    });
    // override renderItem to a seal component after creation
    const lastScene = scenes[scenes.length-1];
    const origBuild = lastScene.build;
    lastScene.build = function(){
      const s = sceneShell('left');
      s.innerHTML = `<p class="eyebrow" style="text-align:center">sealed</p><h2 class="big" style="font-size:clamp(1.8rem,4.5vw,2.6rem);text-align:center;margin-top:12px">things you don\u2019t know about me.</h2>`;
      const wrap = el('div','seq-wrap'); s.appendChild(wrap);
      let idx=0;
      function render(){
        wrap.innerHTML = `<div class="seq-count">${idx+1} of ${C.sealedCards.length}</div>`;
        const card = el('div','seal-card');
        card.innerHTML = `<div class="seal-face"><div class="eyebrow" style="text-align:center;margin-bottom:14px">${C.sealedCards[idx].type||''}</div><div class="seal-mark">open</div><p class="prompt">click to break the seal</p><p class="reveal-text">${C.sealedCards[idx].body||''}</p></div>`;
        wrap.appendChild(card);
        card.querySelector('.seal-mark').addEventListener('click', ()=> card.querySelector('.seal-face').classList.add('open'));
        const ctl = el('div','seq-controls'); ctl.style.justifyContent='center';
        ctl.innerHTML = `<button class="seq-btn" id="sp">back</button><button class="seq-btn" id="sn">${idx<C.sealedCards.length-1?'next':'continue →'}</button>`;
        wrap.appendChild(ctl);
        $('#sp',wrap).disabled = idx===0;
        $('#sp',wrap).addEventListener('click', ()=>{ idx=Math.max(0,idx-1); render(); });
        $('#sn',wrap).addEventListener('click', ()=>{ if(idx<C.sealedCards.length-1){idx++;render();} else {next();} });
      }
      render();
    };
  }

  // -------- 10. locked list: open when --------
  if (C.openWhen?.length){
    addScene(()=>{
      const s = sceneShell();
      const listView = el('div');
      const detailView = el('div'); detailView.style.display='none';
      s.innerHTML = `<p class="eyebrow">open when</p><h2 class="big" style="font-size:clamp(1.8rem,4.5vw,2.6rem);margin-top:12px">a drawer of letters.</h2>`;
      s.appendChild(listView); s.appendChild(detailView);
      function isLocked(item){
        if (!item.lockedUntil) return false;
        return new Date() < new Date(item.lockedUntil);
      }
      listView.innerHTML = `<div class="lock-list">${C.openWhen.map((o,i)=>`
        <div class="lock-item ${isLocked(o)?'locked':''}" data-i="${i}">
          <span class="tag">${(o.label||'').toLowerCase()}</span>
          <span class="when">${isLocked(o)?('opens '+o.lockedUntil):'open now'}</span>
        </div>`).join('')}</div>`;
      listView.querySelectorAll('.lock-item').forEach(item=>{
        item.addEventListener('click', ()=>{
          const o = C.openWhen[item.dataset.i];
          if (isLocked(o)) return;
          listView.style.display='none'; detailView.style.display='block';
          detailView.innerHTML = `<div class="lock-detail"><span class="back">← back to the drawer</span><p>${o.body||''}</p>${o.audio?`<audio controls src="${o.audio}" style="margin-top:16px;width:100%"></audio>`:''}</div>`;
          detailView.querySelector('.back').addEventListener('click', ()=>{ detailView.style.display='none'; listView.style.display='block'; });
        });
      });
    });
  }

  // -------- 11. private language --------
  if (C.privateLanguage?.length){
    addScene(()=>{
      const s = sceneShell();
      s.innerHTML = `<p class="eyebrow">our private language</p><h2 class="big" style="font-size:clamp(1.8rem,4.5vw,2.6rem);margin-top:12px">words only we use.</h2>
        <dl class="term-list">${C.privateLanguage.map(t=>`<div class="term-row"><dt>${t.word||''}</dt><dd><span style="color:var(--mute)">a stranger would assume</span> ${t.others||''} <br><span style="color:var(--gold)">it actually means</span> ${t.actually||''}</dd></div>`).join('')}</dl>`;
    });
  }

  // -------- 12. poetry gallery --------
  if (C.poetry?.entries?.length){
    addScene(()=>{
      const s = sceneShell();
      s.innerHTML = `<p class="eyebrow">in another language</p><h2 class="big" style="font-size:clamp(1.8rem,4.5vw,2.6rem);margin-top:12px">a small gallery of verses.</h2>
        <div class="poetry-grid">${C.poetry.entries.map(p=>`
          <div class="poetry-item"><div class="urdu">${p.excerpt||''}</div><div class="author">${p.poet||'original'}${p.workTitle?' — '+p.workTitle:''}</div>${p.note?`<p style="color:var(--mute);margin-top:8px;font-size:0.9rem">${p.note}</p>`:''}</div>`).join('')}</div>`;
    });
  }

  // -------- 13. note wall --------
  if (C.littleThings?.length){
    addScene(()=>{
      const s = sceneShell();
      s.innerHTML = `<p class="eyebrow">the little things</p><h2 class="big" style="font-size:clamp(1.8rem,4.5vw,2.6rem);margin-top:12px">a wall of small things.</h2>
        <div class="note-wall">${C.littleThings.map(n=>`<div class="note">${n.text||n}</div>`).join('')}</div>`;
    });
  }

  // -------- 14. if you were here --------
  if (C.ifYouWereHere?.length){
    addScene(()=>{
      const s = sceneShell();
      s.innerHTML = `<p class="eyebrow">if you were here</p><h2 class="big" style="font-size:clamp(1.8rem,4.5vw,2.6rem);margin-top:12px">a few scenes I imagine.</h2>
        <div class="scenario-tabs">${C.ifYouWereHere.map((sc,i)=>`<div class="scenario-tab ${i===0?'active':''}" data-i="${i}">${sc.label||sc.title||('scene '+(i+1))}</div>`).join('')}</div>
        <div class="scenario-text" id="scText">${C.ifYouWereHere[0].text||C.ifYouWereHere[0].description||''}</div>`;
      s.querySelectorAll('.scenario-tab').forEach(tab=>{
        tab.addEventListener('click', ()=>{
          s.querySelectorAll('.scenario-tab').forEach(t=>t.classList.remove('active'));
          tab.classList.add('active');
          $('#scText',s).textContent = C.ifYouWereHere[tab.dataset.i].text || C.ifYouWereHere[tab.dataset.i].description || '';
        });
      });
    });
  }

  // -------- 15. future checklist --------
  if (C.future?.length){
    addScene(()=>{
      const s = sceneShell();
      const key = 'bhat-future-checklist';
      let done = {};
      try{ done = JSON.parse(localStorage.getItem(key)||'{}'); }catch(e){}
      s.innerHTML = `<p class="eyebrow">for later</p><h2 class="big" style="font-size:clamp(1.8rem,4.5vw,2.6rem);margin-top:12px">a checklist for someday.</h2>
        <div class="check-list">${C.future.map((f,i)=>`<div class="check-item ${done[i]?'done':''}" data-i="${i}"><div class="check-box"></div><span class="txt">${f.text||f}</span></div>`).join('')}</div>`;
      s.querySelectorAll('.check-item').forEach(item=>{
        item.addEventListener('click', ()=>{
          item.classList.toggle('done');
          done[item.dataset.i] = item.classList.contains('done');
          try{ localStorage.setItem(key, JSON.stringify(done)); }catch(e){}
        });
      });
    });
  }

  // -------- 16. first photograph --------
  if (C.firstPhotograph){
    addScene(()=>{
      const s = sceneShell();
      const fp = C.firstPhotograph;
      s.innerHTML = `<p class="eyebrow">someday</p><h2 class="big" style="font-size:clamp(1.8rem,4.5vw,2.6rem);margin-top:12px">the first photograph.</h2>
        <div class="frame-box">${fp.state==='FILLED' && fp.image ? `<img src="${fp.image}" alt="">` : `<div class="frame-empty">${fp.state==='RESERVED'?'reserved for the day we take our first photo together.':'this frame is waiting.'}</div>`}</div>
        ${fp.caption? `<p class="lede" style="margin-top:16px">${fp.caption}</p>`:''}`;
    });
  }

  // -------- 17. first meeting sequence --------
  if (C.firstMeeting){
    sequentialScene({
      eyebrow:'the first meeting', title:'a scene I keep imagining.',
      items: [
        {k:'where', v: C.firstMeeting.location},
        {k:'the time', v: C.firstMeeting.time},
        {k:'the weather', v: C.firstMeeting.weather},
        {k:'what I\u2019ll hear', v: C.firstMeeting.sounds},
        {k:'what I\u2019m thinking', v: C.firstMeeting.imThinking},
        {k:'what I\u2019m probably doing', v: C.firstMeeting.imProbablyDoing},
        {k:'what you\u2019re probably doing', v: C.firstMeeting.theyreProbablyDoing},
        {k:'what happens next', v: C.firstMeeting.whatHappensNext},
      ],
      renderItem: it => `<div class="date">${it.k}</div><p style="font-family:var(--serif);font-size:1.6rem;margin-top:14px;color:var(--ivory)">${it.v||''}</p>`
    });
  }

  // -------- today --------
  if (C.daily?.length){
    addScene(()=>{
      const s = sceneShell();
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(),0,0)) / 86400000);
      const pick = C.daily[dayOfYear % C.daily.length];
      s.innerHTML = `<p class="eyebrow">today</p><h2 class="big" style="font-size:clamp(1.8rem,4.5vw,2.6rem);margin-top:12px">for right now.</h2>
        <p class="lede" style="margin-top:18px;font-size:1.3rem;font-family:var(--serif);color:var(--ivory)">${pick.text||''}</p>`;
    });
  }

  // -------- 18. quiz --------
  if (C.quiz?.length){
    addScene(()=>{
      const s = sceneShell();
      s.innerHTML = `<p class="eyebrow">a small quiz</p><h2 class="big" style="font-size:clamp(1.8rem,4.5vw,2.6rem);margin-top:12px">how well do you know me?</h2>`;
      let qi=0, score=0;
      const qBox = el('div'); s.appendChild(qBox);
      function renderQ(){
        if (qi>=C.quiz.length){
          qBox.innerHTML = `<p class="quiz-q">${score} / ${C.quiz.length} — ${score===C.quiz.length? 'you know me completely.':'good. we have time to close the gap.'}</p>
            <button class="cta" id="qNext" style="margin-top:20px">continue →</button>`;
          $('#qNext').addEventListener('click', next);
          return;
        }
        const q = C.quiz[qi];
        qBox.innerHTML = `<p class="quiz-q">${q.q||''}</p>
          <div class="quiz-opts">${(q.options||[]).map((o,i)=>`<button class="quiz-opt" data-i="${i}">${o}</button>`).join('')}</div>
          <p class="lede" id="qExplain" style="margin-top:18px;min-height:1.4em"></p>`;
        qBox.querySelectorAll('.quiz-opt').forEach(btn=>{
          btn.addEventListener('click', ()=>{
            const correct = Number(q.correct ?? 0);
            qBox.querySelectorAll('.quiz-opt').forEach((b,i)=>{
              if (i===correct) b.classList.add('correct');
              else if (i===Number(btn.dataset.i)) b.classList.add('wrong');
              b.style.pointerEvents='none';
            });
            if (Number(btn.dataset.i)===correct) score++;
            $('#qExplain',qBox).textContent = q.explanation||'';
            setTimeout(()=>{ qi++; renderQ(); }, 1400);
          });
        });
      }
      renderQ();
    });
  }

  // -------- 19. prompt generator --------
  if (C.prompts?.length){
    addScene(()=>{
      const s = sceneShell();
      s.innerHTML = `<p class="eyebrow">random us</p><h2 class="big" style="font-size:clamp(1.8rem,4.5vw,2.6rem);margin-top:12px">a generator, for slow nights.</h2>
        <div class="prompt-box" id="pBox">${C.prompts[0].text||C.prompts[0]}</div>
        <button class="prompt-btn" id="pBtn">give us another</button>`;
      $('#pBtn',s).addEventListener('click', ()=>{
        const p = C.prompts[Math.floor(Math.random()*C.prompts.length)];
        $('#pBox',s).textContent = p.text||p;
      });
    });
  }

  // -------- 20. time capsules --------
  if (C.timeCapsules?.length){
    addScene(()=>{
      const s = sceneShell();
      s.innerHTML = `<p class="eyebrow">time capsules</p><h2 class="big" style="font-size:clamp(1.8rem,4.5vw,2.6rem);margin-top:12px">messages, dated in the future.</h2>
        <div class="lock-list">${C.timeCapsules.map(tc=>{
          const locked = tc.openDate && new Date() < new Date(tc.openDate);
          return `<div class="lock-item ${locked?'locked':''}"><span class="tag">${tc.label||tc.title||''}</span><span class="when">${locked?('opens '+tc.openDate):(tc.text||tc.message||'')}</span></div>`;
        }).join('')}</div>`;
    });
  }

  // -------- 21. the letter --------
  if (C.letter){
    addScene(()=>{
      const s = sceneShell('left');
      s.innerHTML = `<p class="eyebrow" style="text-align:center">${C.letter.eyebrow||'the letter'}</p>
        <h2 class="big" style="font-size:clamp(2rem,5vw,3rem);text-align:center;margin-top:14px">${C.letter.title||'to you.'}</h2>
        <div class="letter-body">${(C.letter.body||'').trim()}${C.letter.signature?`\n\n— ${C.letter.signature}`:''}</div>
        ${C.letter.finalLine?`<p class="lede" style="text-align:center;margin:26px auto 0;font-style:italic">${C.letter.finalLine}</p>`:''}`;
    });
  }

  // -------- 22. final voice note --------
  if (C.finalVoiceNote?.audio){
    audioScene({eyebrow:'before the quiet', title:'one last thing.', items:[{label:'a voice note', audio: C.finalVoiceNote.audio}]});
  }

  // -------- 23. closing --------
  addScene(()=>{
    const s = sceneShell();
    s.innerHTML = `<p class="big"><em>i\u2019ll see you soon.</em></p><p class="lede" style="margin-top:16px">${R.personA.name} & ${R.personB.name}. ${R.personA.city} — ${R.personB.city}.</p>`;
  });

  /* ---------- boot ---------- */
  window.addEventListener('load', ()=>{
    setTimeout(()=>{
      $('#loading').classList.add('gone');
      scenes.forEach(sc=>{ const container = sc.build(); });
      goTo(0);
    }, 900);
  });

})();
