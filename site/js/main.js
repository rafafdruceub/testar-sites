/* Movimento e barra fixa. Sem JS, tudo continua visível e os links funcionam.
   Gramática única: tudo sobe para o lugar sob uma luz que vem de cima.
   Com prefers-reduced-motion: nada se desloca; as mesmas entradas viram trocas de opacidade. */
(function () {
  var raiz = document.documentElement;
  var reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Barra fixa: só aparece quando nenhum grupo [data-cta] está na tela */
  var barra = document.querySelector('[data-barra]');
  var grupos = document.querySelectorAll('[data-cta]');
  if (barra && 'IntersectionObserver' in window) {
    var visiveis = new Set();
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) { e.isIntersecting ? visiveis.add(e.target) : visiveis.delete(e.target); });
      var mostrar = visiveis.size === 0;
      barra.classList.toggle('is-on', mostrar);
      if (mostrar) barra.removeAttribute('inert'); else barra.setAttribute('inert', '');
    }, { threshold: 0 });
    grupos.forEach(function (g) { io.observe(g); });
  }

  var gsap = window.gsap;
  if (!gsap) { raiz.classList.remove('anim'); return; }
  var ST = window.ScrollTrigger;
  var Split = window.SplitText;
  if (ST) gsap.registerPlugin(ST);
  if (Split) gsap.registerPlugin(Split);
  var EASE = 'expo.out';

  /* Entrada de um elemento ao rolar. No modo reduzido, só a opacidade muda. */
  function surge(alvo, v) {
    var de = { opacity: 0 };
    var para = {
      opacity: 1, duration: v.duracao || 1.1, ease: EASE, stagger: v.stagger || 0, delay: v.atraso || 0,
      scrollTrigger: { trigger: v.gatilho || alvo, start: v.inicio || 'top 88%', once: true }
    };
    if (reduzido) { para.duration = 0.7; para.ease = 'power1.out'; para.stagger = (v.stagger || 0) / 2; }
    else {
      ['y', 'yPercent', 'x', 'xPercent', 'scale'].forEach(function (k) {
        if (k in v) { de[k] = v[k]; para[k] = k === 'scale' ? 1 : 0; }
      });
    }
    return gsap.fromTo(alvo, de, para);
  }

  /* Títulos revelados linha a linha, cada linha subindo de dentro da própria máscara */
  function linhas(el, extra) {
    return Split.create(el, {
      type: 'lines', mask: 'lines', linesClass: 'linha', autoSplit: true,
      onSplit: function (self) {
        return gsap.from(self.lines, Object.assign({ yPercent: 118, duration: 1.25, ease: EASE, stagger: 0.11 }, extra));
      }
    });
  }

  /* 1. Abertura: o monograma sobe peça por peça, ainda apagado; uma faixa de luz passa por ele
        e acende cada peça na ordem em que é tocada (a onda, depois as duas barras). */
  function abertura() {
    var onda = '.mono-parte--onda', b1 = '.mono-parte--barra1', b2 = '.mono-parte--barra2';
    var titulo = document.querySelector('.hero__titulo');
    var resto = gsap.utils.toArray('.hero__texto > *:not(.hero__titulo)');
    var tl = gsap.timeline({ defaults: { ease: EASE } });

    if (reduzido) {
      tl.fromTo('.hero__topo', { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0)
        .fromTo([onda, b1, b2], { opacity: 0 }, { opacity: 0.3, duration: 0.6 }, 0)
        .fromTo('.hero__texto > *', { opacity: 0 }, { opacity: 1, duration: 0.7, stagger: 0.08 }, 0.2)
        .to(onda, { opacity: 1, duration: 0.6, ease: 'power1.out' }, 0.8)
        .to(b1, { opacity: 1, duration: 0.6, ease: 'power1.out' }, 1)
        .to(b2, { opacity: 1, duration: 0.6, ease: 'power1.out' }, 1.2);
    } else {
      tl.fromTo('.hero__topo', { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 1.1 }, 0)
        .fromTo(b1, { opacity: 0, yPercent: 26 }, { opacity: 0.3, yPercent: 0, duration: 1.5 }, 0.15)
        .fromTo(b2, { opacity: 0, yPercent: 34 }, { opacity: 0.3, yPercent: 0, duration: 1.5 }, 0.3)
        .fromTo(onda, { opacity: 0, xPercent: -14, yPercent: 8 }, { opacity: 0.3, xPercent: 0, yPercent: 0, duration: 1.5 }, 0.45);

      if (Split) { gsap.set(titulo, { opacity: 1 }); linhas(titulo, { delay: 0.55 }); }
      else tl.fromTo(titulo, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.1 }, 0.55);

      tl.fromTo(resto, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.09 }, 1.05)
        .fromTo('.hero__luz i', { xPercent: -20, opacity: 1 }, { xPercent: 420, duration: 1.7, ease: 'power2.inOut' }, 1.2)
        .to(onda, { opacity: 1, duration: 0.55, ease: 'power1.out' }, 1.65)
        .to(b1, { opacity: 1, duration: 0.55, ease: 'power1.out' }, 1.85)
        .to(b2, { opacity: 1, duration: 0.55, ease: 'power1.out' }, 2.05)
        .set('.hero__luz i', { opacity: 0 });
    }
    window.__amplaAnim = true;
    raiz.classList.remove('anim');
  }

  /* Na rolagem. Sem ScrollTrigger, nada é escondido: o conteúdo fica como está. */
  function rolagem() {
    if (!ST) return;

    /* 2. Parallax leve: o reflexo das torres desliza na laca e o monograma fica para trás */
    if (!reduzido) {
      var heroST = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
      gsap.to('.hero__reflexo', { yPercent: 22, ease: 'none', scrollTrigger: heroST });
      gsap.to('.hero__mono', { yPercent: -8, ease: 'none', scrollTrigger: Object.assign({}, heroST) });
    }

    /* 3. Títulos de seção: a mesma revelação por linha do título principal */
    gsap.utils.toArray('main .titulo').forEach(function (el) {
      if (Split && !reduzido) linhas(el, { scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
      else surge(el, {});
    });
    gsap.utils.toArray('main .texto').forEach(function (el) { surge(el, { y: 20, inicio: 'top 92%', atraso: 0.15 }); });

    /* 4. Fotos da clínica: o quadro sobe e a foto assenta dentro dele */
    gsap.utils.toArray('.foto').forEach(function (f, i) {
      surge(f, { y: 56, duracao: 1.3, atraso: i * 0.12 });
      if (!reduzido) gsap.fromTo(f.querySelector('img'), { scale: 1.18 }, { scale: 1, duration: 1.8, ease: EASE, delay: i * 0.12, scrollTrigger: { trigger: f, start: 'top 88%', once: true } });
    });

    surge('.link-insta', { y: 16, inicio: 'top 95%' });

    /* 5. Lista: o filete de cada linha corre da esquerda e o serviço sobe atrás dele */
    var itens = gsap.utils.toArray('.lista__item');
    var filetes = itens.map(function (i) { return i.querySelector('.lista__filete'); });
    var textos = gsap.utils.toArray('.lista__nome, .lista__nota');
    gsap.set(textos, { opacity: 0, y: reduzido ? 0 : 22 });
    if (!reduzido) gsap.set(filetes, { scaleX: 0 });
    ST.batch(itens, {
      start: 'top 92%', once: true,
      onEnter: function (lote) {
        var f = lote.map(function (i) { return i.querySelector('.lista__filete'); });
        var t = [];
        lote.forEach(function (i) { t.push.apply(t, i.querySelectorAll('.lista__nome, .lista__nota')); });
        if (!reduzido) gsap.to(f, { scaleX: 1, duration: 1.2, ease: 'power3.inOut', stagger: 0.1 });
        gsap.to(t, { opacity: 1, y: 0, duration: reduzido ? 0.7 : 1, ease: reduzido ? 'power1.out' : EASE, stagger: 0.08, delay: reduzido ? 0 : 0.12 });
      }
    });

    /* 6. Troca de campo de cor: o painel pérola sobe sobre a laca */
    surge('.avaliacoes__painel', { y: 110, scale: 0.965, duracao: 1.5, gatilho: '.avaliacoes', inicio: 'top 90%' });
    surge('.nota__num', { yPercent: 40, duracao: 1.3, atraso: 0.25, gatilho: '.avaliacoes', inicio: 'top 90%' });

    /* 7. Recepção: o quadro sobe e a foto desliza devagar dentro dele enquanto a página rola */
    surge('.recepcao', { y: 60, duracao: 1.3, inicio: 'top 90%' });
    if (!reduzido) gsap.fromTo('.recepcao__quadro img', { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.recepcao', start: 'top bottom', end: 'bottom top', scrub: true } });

    /* 8. Depoimentos: chegam um depois do outro */
    surge(gsap.utils.toArray('.depo'), { y: 34, stagger: 0.14, gatilho: '.depos', inicio: 'top 88%' });

    surge('.avaliacoes__google', { y: 16, inicio: 'top 95%' });

    /* 9. Fecho: as informações sobem e o "AMPLA" se ergue de dentro do próprio vão, como o letreiro */
    surge(gsap.utils.toArray('.ficha__bloco'), { y: 26, stagger: 0.1, gatilho: '.ficha', inicio: 'top 90%' });
    surge('.fecho__letreiro img', { yPercent: 105, duracao: 1.6, gatilho: '.fecho__marca', inicio: 'top 96%' });
  }

  /* As linhas dependem da fonte: espera ela carregar (embutida, é quase imediato) */
  var comecou = false;
  function comeca() {
    if (comecou) return;
    comecou = true;
    abertura();
    rolagem();
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(comeca);
  setTimeout(comeca, 700);
})();
