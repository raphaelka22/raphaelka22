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
    const imgData = ctx.createImageData(w, h);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = Math.random() * 255 | 0;
      d[i] = d[i+1] = d[i+2] = v;
      d[i+3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
  }

  window.addEventListener('resize', resize);
  resize();
})();

/* ─── Custom Cursor ─── */
(function initCursor() {
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  let fx = 0, fy = 0;
  let cx = 0, cy = 0;

  window.addEventListener('mousemove', e => {
    cx = e.clientX;
    cy = e.clientY;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
  });

  (function animateFollower() {
    fx += (cx - fx) * 0.13;
    fy += (cy - fy) * 0.13;
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
    requestAnimationFrame(animateFollower);
  })();
})();

/* ─── Nav scroll state ─── */
(function initNav() {
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });
})();

/* ─── Fisheye / magnetic effect on works grid ─── */
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
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ratio = Math.max(0, 1 - dist / RADIUS);

      const scale  = 1 + (MAX_SCALE - 1) * ratio;
      const tiltX  = (-dy / (RADIUS / 2)) * MAX_TILT * ratio;
      const tiltY  = ( dx / (RADIUS / 2)) * MAX_TILT * ratio;

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

/* ─── Scroll-reveal ─── */
(function initReveal() {
  const targets = document.querySelectorAll(
    '.section-header, .work-card, .about-left, .about-right, .contact-top, .contact-bottom'
  );

  targets.forEach(el => el.setAttribute('data-reveal', ''));

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => io.observe(el));
})();

/* ─── Hero title animated gradient shift ─── */
(function initHeroParallax() {
  const hero  = document.querySelector('.hero');
  const grad  = document.querySelector('.hero-gradient');
  if (!hero || !grad) return;

  window.addEventListener('mousemove', e => {
    const nx = (e.clientX / window.innerWidth  - 0.5) * 2;
    const ny = (e.clientY / window.innerHeight - 0.5) * 2;
    grad.style.transform = `translate(${nx * 18}px, ${ny * 12}px)`;
  });
})();

/* ─── Skill pills hover ripple ─── */
(function initPillRipple() {
  document.querySelectorAll('.skill-pill').forEach(pill => {
    pill.addEventListener('click', e => {
      const r = document.createElement('span');
      r.style.cssText = `
        position:absolute; border-radius:50%; background:rgba(126,232,250,0.25);
        width:60px; height:60px; margin-top:-30px; margin-left:-30px;
        animation:ripple 0.5s linear; pointer-events:none;
        left:${e.offsetX}px; top:${e.offsetY}px;
      `;
      pill.style.position = 'relative';
      pill.style.overflow  = 'hidden';
      pill.appendChild(r);
      setTimeout(() => r.remove(), 500);
    });
  });

  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple {
      0%   { transform: scale(0); opacity: 1; }
      100% { transform: scale(4); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
})();
