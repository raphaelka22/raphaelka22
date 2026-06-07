/* ============================================================
   DESIGN PORTFOLIO — main.js
   ============================================================ */

/* ─── Noise Canvas ─── */
(function initNoise() {
  const canvas = document.getElementById('noiseCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    drawNoise();
  }

  function drawNoise() {
    const w = canvas.width, h = canvas.height;
    const img = ctx.createImageData(w, h);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = Math.random() * 255 | 0;
      d[i] = d[i+1] = d[i+2] = v;
      d[i+3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }

  window.addEventListener('resize', resize);
  resize();
})();

/* ─── Custom Cursor ─── */
(function initCursor() {
  const dot      = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  let fx = 0, fy = 0, cx = 0, cy = 0;

  window.addEventListener('mousemove', e => {
    cx = e.clientX; cy = e.clientY;
    dot.style.left = cx + 'px';
    dot.style.top  = cy + 'px';
  });

  (function loop() {
    fx += (cx - fx) * 0.13;
    fy += (cy - fy) * 0.13;
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
    requestAnimationFrame(loop);
  })();
})();

/* ─── Nav scroll state ─── */
(function initNav() {
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
})();

/* ================================================================
   INTRO ANIMATION
   ================================================================ */
(function initIntro() {
  const intro = document.getElementById('intro');
  if (!intro) return;

  document.body.style.overflow = 'hidden';

  /* Phase 1 — Names wipe in from both sides */
  setTimeout(() => intro.classList.add('show-names'), 280);

  /* Phase 2 — "Portfolio" emerges from blur */
  setTimeout(() => intro.classList.add('show-portfolio'), 1200);

  /* Phase 3 — Intro slides up off screen */
  setTimeout(() => {
    intro.classList.add('intro-exit');
    document.body.style.overflow = '';

    /* Trigger hero content entrance ~halfway through slide */
    setTimeout(() => document.body.classList.add('hero-ready'), 350);

  }, 2600);

  /* Remove from DOM entirely after slide completes */
  setTimeout(() => {
    if (intro.parentNode) intro.parentNode.removeChild(intro);
  }, 3550);
})();

/* ================================================================
   SCROLL ANIMATIONS — [data-anim] + IntersectionObserver
   ================================================================ */
(function initScrollAnimations() {
  /* Stagger delay per [data-delay] index */
  const STAGGER = 0.12; /* seconds between each step */

  const targets = document.querySelectorAll('[data-anim]');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el    = entry.target;
      const delay = parseFloat(el.dataset.delay || 0) * STAGGER;

      el.style.transitionDelay = delay + 's';
      el.classList.add('is-visible');
      io.unobserve(el);
    });
  }, { threshold: 0.12 });

  targets.forEach(el => io.observe(el));
})();

/* ================================================================
   FISHEYE / MAGNETIC TILT on works grid
   ================================================================ */
(function initFisheye() {
  const grid  = document.getElementById('worksGrid');
  if (!grid) return;
  const cards = Array.from(grid.querySelectorAll('.work-card'));

  const RADIUS    = 320;
  const MAX_SCALE = 1.045;
  const MAX_TILT  = 6;

  function getRects() {
    return cards.map(c => {
      const r = c.getBoundingClientRect();
      return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
    });
  }

  grid.addEventListener('mousemove', e => {
    const mx = e.clientX, my = e.clientY;
    const rects = getRects();

    cards.forEach((card, i) => {
      const { cx, cy } = rects[i];
      const dx = mx - cx, dy = my - cy;
      const dist  = Math.sqrt(dx * dx + dy * dy);
      const ratio = Math.max(0, 1 - dist / RADIUS);

      const scale = 1 + (MAX_SCALE - 1) * ratio;
      const tiltX = (-dy / (RADIUS / 2)) * MAX_TILT * ratio;
      const tiltY = ( dx / (RADIUS / 2)) * MAX_TILT * ratio;

      card.style.transform =
        `scale(${scale}) perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      card.style.zIndex = ratio > 0.1 ? '2' : '1';
    });
  });

  grid.addEventListener('mouseleave', () => {
    cards.forEach(card => {
      card.style.transform = '';
      card.style.zIndex    = '';
    });
  });
})();

/* ================================================================
   HERO PARALLAX — gradient shifts with mouse
   ================================================================ */
(function initHeroParallax() {
  const grad = document.querySelector('.hero-gradient');
  if (!grad) return;

  window.addEventListener('mousemove', e => {
    const nx = (e.clientX / window.innerWidth  - 0.5) * 2;
    const ny = (e.clientY / window.innerHeight - 0.5) * 2;
    grad.style.transform = `translate(${nx * 18}px, ${ny * 12}px)`;
  }, { passive: true });
})();

/* ================================================================
   SMOOTH SECTION SCROLL with active nav highlight
   ================================================================ */
(function initNavActive() {
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const links    = Array.from(document.querySelectorAll('.nav-links a'));

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      links.forEach(a => {
        a.classList.toggle('nav-active', a.getAttribute('href') === '#' + id);
      });
    });
  }, { threshold: 0.4 });

  sections.forEach(s => io.observe(s));
})();

/* ================================================================
   SKILL PILL RIPPLE
   ================================================================ */
(function initPillRipple() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple {
      0%   { transform: scale(0); opacity: 1; }
      100% { transform: scale(4); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  document.querySelectorAll('.skill-pill').forEach(pill => {
    pill.addEventListener('click', e => {
      const r = document.createElement('span');
      r.style.cssText = `
        position:absolute;border-radius:50%;background:rgba(107,158,255,0.25);
        width:60px;height:60px;margin-top:-30px;margin-left:-30px;
        animation:ripple 0.5s linear;pointer-events:none;
        left:${e.offsetX}px;top:${e.offsetY}px;
      `;
      pill.style.position = 'relative';
      pill.style.overflow  = 'hidden';
      pill.appendChild(r);
      setTimeout(() => r.remove(), 500);
    });
  });
})();
