// js/mesh-cursor.js
// Lightweight Mesh + Neon Cursor
/*(() => {
  // feature-detect: disable on touch / small screens
  if (typeof window === 'undefined') return;
  const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 1;
  if (window.innerWidth <= 900) {
    // hide canvas/cursor if present
    const c = document.getElementById('mesh-canvas');
    const n = document.getElementById('neon-cursor');
    if (c) c.style.display = 'none';
    if (n) n.style.display = 'none';
    return;
  }
    */


  // DOM
  const canvas = document.getElementById('mesh-canvas');
  const cursor = document.getElementById('neon-cursor');

  if (!canvas || !cursor) {
    console.warn('mesh-cursor: missing #mesh-canvas or #neon-cursor');
    // We can't use 'return' here since we removed the function wrapper.
    // We will let the script continue, but the rendering functions will fail gracefully.
}

  // Canvas setup & pixel ratio
  const ctx = canvas.getContext('2d');
  let width = 0, height = 0, DPR = Math.max(1, window.devicePixelRatio || 1);

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    canvas.width = Math.floor(width * DPR);
    canvas.height = Math.floor(height * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    buildGrid(); // rebuild node positions on resize
  }
  window.addEventListener('resize', resize, { passive: true });

  // grid nodes
  const nodes = [];
  const cell = 120; // spacing between nodes (tweak for density)
  function buildGrid() {
    nodes.length = 0;
    const cols = Math.ceil(width / cell) + 1;
    const rows = Math.ceil(height / cell) + 1;
    const jitter = 18; // node jitter
    for (let y = -1; y <= rows; y++) {
      for (let x = -1; x <= cols; x++) {
        const nx = x * cell + (Math.random() * jitter - jitter / 2);
        const ny = y * cell + (Math.random() * jitter - jitter / 2);
        nodes.push({
          x: nx,
          y: ny,
          ox: nx,
          oy: ny,
          vx: 0,
          vy: 0,
          r: 1 + Math.random() * 2
        });
      }
    }
  }

  // pointer state
  const pointer = { x: width / 2, y: height / 2, active: false };
  window.addEventListener('pointermove', (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.active = true;
    // show cursor
    cursor.classList.add('visible');
    cursor.style.transform = `translate(${pointer.x}px, ${pointer.y}px) translate(-50%, -50%)`;
  }, { passive: true });

  // hide cursor on leave
  window.addEventListener('pointerleave', () => {
    pointer.active = false;
    cursor.classList.remove('visible');
  });

  // interactive hover scaling: enlarge cursor when on interactive elements
  const interactiveSelector = 'a, button, input, .btn, .nav-link';
  document.addEventListener('pointerover', (e) => {
    if (e.target && e.target.closest && e.target.closest(interactiveSelector)) {
      cursor.classList.add('cursor-large');
    }
  }, true);
  document.addEventListener('pointerout', (e) => {
    if (e.target && e.target.closest && e.target.closest(interactiveSelector)) {
      cursor.classList.remove('cursor-large');
    }
  }, true);

  // animation loop
  let last = performance.now();
  function tick(now) {
    const dt = Math.min(40, now - last) / 16.666; // normalized
    last = now;
    updateNodes(dt);
    render();
    requestAnimationFrame(tick);
  }

  // Node physics: gentle float and attraction to original position; react to pointer
  function updateNodes(dt) {
    const repelRadius = 160; // how far pointer affects nodes
    const repelForce = 0.28; // strength of pointer repulsion
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];

      // small noise float
      n.vx += (Math.sin((n.ox + nowSeed + i) * 0.002) * 0.02) * dt;
      n.vy += (Math.cos((n.oy + nowSeed + i) * 0.002) * 0.02) * dt;

      // spring to original pos
      const k = 0.06;
      n.vx += (n.ox - n.x) * k * dt;
      n.vy += (n.oy - n.y) * k * dt;

      // pointer repulsion
      if (pointer.active) {
        const dx = n.x - pointer.x;
        const dy = n.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < repelRadius * repelRadius) {
          const d = Math.sqrt(d2) || 1;
          const f = (1 - d / repelRadius) * repelForce * dt;
          n.vx += (dx / d) * f;
          n.vy += (dy / d) * f;
        }
      }

      // damping
      n.vx *= 0.92;
      n.vy *= 0.92;
      n.x += n.vx * dt;
      n.y += n.vy * dt;
    }
  }

  // small seed for per-node noise
  const nowSeed = Math.random() * 10000;

  // Render mesh: draw nodes and connecting lines for neighbours
  function render() {
    // clear
    ctx.clearRect(0, 0, width, height);

    // subtle background glow (keeps mesh readable)
    //ctx.fillStyle = 'rgba(2,6,23,0.0)';
    //ctx.fillRect(0, 0, width, height);

    // draw lines
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      // draw line to a subset of nearby nodes for performance
      for (let j = i + 1; j < i + 6 && j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < cell * 1.05) {
          // line alpha stronger when closer and when near pointer
          let alpha = 0.08 + (1 - dist / (cell * 1.05)) * 0.15;
          // boost alpha if near pointer
          if (pointer.active) {
            const md = Math.hypot((a.x + b.x) / 2 - pointer.x, (a.y + b.y) / 2 - pointer.y);
            alpha += Math.max(0, (1 - md / 420)) * 0.20;
          }
          ctx.strokeStyle = `rgba(34,197,94, ${Math.min(alpha, 0.48)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // draw subtle nodes
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const distToPointer = Math.hypot(n.x - pointer.x, n.y - pointer.y);
      let alpha = 0.06;
      if (pointer.active && distToPointer < 180) {
        alpha = 0.12 + (1 - distToPointer / 180) * 0.6;
      }
      ctx.fillStyle = `rgba(167,243,208, ${alpha})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // init
  function init() {
    resize();
    requestAnimationFrame(tick);
  }

  // Start
  init();


