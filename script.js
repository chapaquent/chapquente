/* =================================================================
   CHAPA QUENTE — script.js
   1. Fundo animado de brasas (canvas)
   2. Revelação de seções ao rolar (scroll reveal)
   3. Menu mobile
   4. Sombra do nav ao rolar
   ================================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* ================================================================
     1. FUNDO ANIMADO DE BRASAS
     Partículas pequenas que sobem lentamente, com brilho e fade.
     Performance: usa requestAnimationFrame e reutiliza partículas.
     ================================================================ */
  const canvas = document.getElementById("bg-embers");
  const ctx = canvas.getContext("2d");

  let W, H, particles, dpr;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.width = window.innerWidth * dpr;
    H = canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
  }

  // Cores das brasas
  const cores = [
    [230, 91, 25],   // laranja
    [242, 169, 0],   // amarelo
    [198, 40, 40],   // vermelho
  ];

  function criarParticulas() {
    // Densidade proporcional à tela, com limite para performance
    const alvo = Math.min(Math.floor((window.innerWidth * window.innerHeight) / 18000), 70);
    particles = [];
    for (let i = 0; i < alvo; i++) {
      particles.push(novaParticula(true));
    }
  }

  function novaParticula(inicial) {
    const cor = cores[Math.floor(Math.random() * cores.length)];
    return {
      x: Math.random() * W,
      y: inicial ? Math.random() * H : H + 10 * dpr,
      r: (Math.random() * 2.2 + 0.8) * dpr,
      vy: -(Math.random() * 0.4 + 0.15) * dpr,  // sobe lento
      vx: (Math.random() - 0.5) * 0.3 * dpr,   // leve deriva horizontal
      vida: Math.random(),
      vidaTotal: Math.random() * 0.5 + 0.5,
      cor: cor,
      brilho: Math.random() * 0.5 + 0.3,
    };
  }

  function animar() {
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      p.x += p.vx;
      p.y += p.vy;
      p.vida += 0.003;

      // Fade in e fade out baseado na vida
      let alpha;
      if (p.vida < 0.2) {
        alpha = (p.vida / 0.2) * p.brilho;
      } else if (p.vida > 0.8) {
        alpha = ((1 - p.vida) / 0.2) * p.brilho;
      } else {
        alpha = p.brilho;
      }
      alpha = Math.max(0, alpha);

      // Desenha o brilho (halo)
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
      grad.addColorStop(0, `rgba(${p.cor[0]},${p.cor[1]},${p.cor[2]},${alpha})`);
      grad.addColorStop(1, `rgba(${p.cor[0]},${p.cor[1]},${p.cor[2]},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
      ctx.fill();

      // Núcleo
      ctx.fillStyle = `rgba(${p.cor[0]},${p.cor[1]},${p.cor[2]},${alpha * 1.4})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      // Reinicia partícula que saiu da tela
      if (p.y < -20 * dpr || p.vida >= 1) {
        particles[i] = novaParticula(false);
      }
    }

    requestAnimationFrame(animar);
  }

  // Inicializa
  resize();
  criarParticulas();
  animar();

  // Recria partículas ao redimensionar (com debounce)
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      criarParticulas();
    }, 200);
  });


  /* ================================================================
     2. REVELAÇÃO DE SEÇÕES AO ROLAR
     Adiciona classe .visible aos elementos .reveal quando aparecem.
     ================================================================ */
  const reveals = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          // Pequeno atraso escalonado para elementos na mesma seção
          setTimeout(() => {
            entry.target.classList.add("visible");
          }, idx * 80);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px",
    });

    reveals.forEach((el) => observer.observe(el));
  } else {
    // Fallback: mostra tudo
    reveals.forEach((el) => el.classList.add("visible"));
  }


  /* ================================================================
     3. MENU MOBILE
     ================================================================ */
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    toggle.classList.toggle("open", isOpen);
    toggle.setAttribute("aria-expanded", isOpen);
    toggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
  });

  // Fecha menu ao clicar em um link
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });


  /* ================================================================
     4. SOMBRA DO NAV AO ROLAR
     ================================================================ */
  const nav = document.querySelector(".nav");
  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 40);
  });


  /* ================================================================
     5. ANO AUTOMÁTICO NO RODAPÉ
     ================================================================ */
  const anoEl = document.getElementById("ano");
  if (anoEl) {
    anoEl.textContent = new Date().getFullYear();
  }

});
