/* ════════════════════════════════════════════
   Game.js — Game loop y lógica del juego
   ════════════════════════════════════════════ */

class Game {

  constructor() {
    this.canvas     = document.getElementById('gameCanvas');
    this.ctx        = this.canvas.getContext('2d');

    // Estado del juego: 'idle' | 'jugando' | 'pausado' | 'muerto'
    this.estado     = 'idle';
    this.puntaje    = 0;
    this.burbuja    = null;
    this.obstaculos = [];

    // Control de tiempo para generar obstáculos
    this.ultimoObstaculo  = 0;
    this.intervalo        = 1800;  // ms entre obstáculos

    // Partículas de fondo (burbujas decorativas)
    this.particulas = [];
    this.ultimoFrame = 0;

    // Ajusta el tamaño del canvas al cargar y al cambiar tamaño
    this._ajustarCanvas();
    window.addEventListener('resize', () => this._ajustarCanvas());

    // Escucha tap y clic
    this._escucharInput();
  }

  // ─── Inicia o reinicia una partida ───────────
  iniciar() {
    this._ajustarCanvas();

    this.estado     = 'jugando';
    this.puntaje    = 0;
    this.obstaculos = [];
    this.ultimoObstaculo = 0;
    this.intervalo  = 1800;
    this.ultimoFrame = 0;

    // Velocidad base de obstáculos (escala con tamaño de pantalla)
    this.velocidadBase = this.canvas.width * 0.009;

    this.burbuja = new Bubble(this.canvas);
    this._crearParticulas();

    // Muestra puntaje en 0
    document.getElementById('score-display').textContent = '0';

    // Arranca el loop
    requestAnimationFrame(ts => this._loop(ts));
  }

  // ─── Loop principal: se llama ~60 veces por segundo ───
  _loop(timestamp) {
    if (this.estado !== 'jugando') return;

    // Evita saltos físicos tras una pestaña en segundo plano.
    const delta = this.ultimoFrame ? Math.min(2, (timestamp - this.ultimoFrame) / (1000 / 60)) : 1;
    this.ultimoFrame = timestamp;
    this._actualizar(timestamp, delta);
    this._dibujar();

    requestAnimationFrame(ts => this._loop(ts));
  }

  // ─── Actualiza toda la lógica ─────────────────
  _actualizar(timestamp, delta) {

    // Mueve la burbuja
    this.burbuja.actualizar(delta);

    // Genera un obstáculo nuevo cuando pasa suficiente tiempo
    if (timestamp - this.ultimoObstaculo > this.intervalo) {
      const vel = this.velocidadBase + this.puntaje * 0.03;
      this.obstaculos.push(new Obstacle(this.canvas, vel));
      this.ultimoObstaculo = timestamp;

      // Reduce el intervalo para aumentar dificultad (mínimo 900ms)
      this.intervalo = Math.max(900, 1800 - this.puntaje * 12);
    }

    // Actualiza obstáculos
    this.obstaculos.forEach(obs => {
      obs.actualizar();

      // ¿La burbuja pasó este obstáculo? → punto
      if (obs.verificarPunto(this.burbuja.x)) {
        this.puntaje++;
        document.getElementById('score-display').textContent = this.puntaje;
      }
    });

    // Elimina los obstáculos que ya salieron por la izquierda
    this.obstaculos = this.obstaculos.filter(o => !o.fueraDePantalla());

    // Mueve las partículas decorativas
    this._actualizarParticulas();

    // ¿Colisión? → fin del juego
    if (this.burbuja.salioDePantalla() || this._hayColision()) {
      this._terminar();
    }
  }

  // ─── Detecta colisión burbuja ↔ corales ───────
  _hayColision() {
    const hb = this.burbuja.getHitbox();

    for (const obs of this.obstaculos) {
      for (const rect of obs.getHitboxes()) {
        // Intersección entre dos rectángulos (AABB)
        if (
          hb.x < rect.x + rect.w &&
          hb.x + hb.w > rect.x   &&
          hb.y < rect.y + rect.h &&
          hb.y + hb.h > rect.y
        ) {
          return true;
        }
      }
    }
    return false;
  }

  // ─── Termina el juego ─────────────────────────
  _terminar() {
    this.estado = 'muerto';
    UI.mostrarGameOver(this.puntaje);  // le pasa el puntaje a UI.js
  }

  pausar() {
    if (this.estado !== 'jugando') return;
    this.estado = 'pausado';
    document.getElementById('pause-menu').classList.remove('oculto');
  }

  continuar() {
    if (this.estado !== 'pausado') return;
    this.estado = 'jugando';
    this.ultimoFrame = 0;
    document.getElementById('pause-menu').classList.add('oculto');
    requestAnimationFrame(ts => this._loop(ts));
  }

  // ─── Dibuja todo el frame ─────────────────────
  _dibujar() {
    const ctx = this.ctx;
    const W   = this.canvas.width;
    const H   = this.canvas.height;

    // Fondo degradado (océano)
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0,   '#0D1B2A');
    bg.addColorStop(0.5, '#0A2540');
    bg.addColorStop(1,   '#071622');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Partículas decorativas
    this._dibujarParticulas();

    // Líneas de agua sutiles
    ctx.strokeStyle = 'rgba(30, 80, 130, 0.18)';
    ctx.lineWidth   = 1;
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.moveTo(0, H * (i / 6));
      ctx.lineTo(W, H * (i / 6));
      ctx.stroke();
    }

    // Obstáculos y burbuja
    this.obstaculos.forEach(o => o.dibujar());
    this.burbuja.dibujar();
  }

  // ─── Ajusta el canvas al tamaño de pantalla ───
  _ajustarCanvas() {
    const MAX_W = 430;
    const RATIO = 16 / 9;
    const w = Math.min(window.innerWidth, MAX_W);
    const h = Math.min(window.innerHeight, Math.floor(w * RATIO));

    this.canvas.width  = Math.floor(w);
    this.canvas.height = Math.floor(h);
    this.canvas.style.width  = w + 'px';
    this.canvas.style.height = h + 'px';
  }

  // ─── Escucha toque / clic ─────────────────────
  _escucharInput() {
    const handler = event => {
      event.preventDefault();
      if (this.estado === 'jugando') this.burbuja.saltar();
    };
    this.canvas.addEventListener('pointerdown', handler);
    window.addEventListener('keydown', event => {
      if (event.repeat) return;
      if (event.code === 'ShiftLeft' || event.code === 'ShiftRight' || event.code === 'Space') {
        event.preventDefault();
        if (this.estado === 'jugando') this.burbuja.saltar();
      }
      if (event.code === 'KeyP' || event.code === 'Escape') {
        event.preventDefault();
        this.estado === 'jugando' ? this.pausar() : this.continuar();
      }
    });
  }

  // ─── Partículas de fondo (burbujas pequeñas) ──
  _crearParticulas() {
    this.particulas = [];
    const cantidad = Math.floor(this.canvas.width / 12);
    for (let i = 0; i < cantidad; i++) {
      this.particulas.push({
        x:     Math.random() * this.canvas.width,
        y:     Math.random() * this.canvas.height,
        r:     1 + Math.random() * 3,
        vel:   0.3 + Math.random() * 0.5,
        alpha: 0.1 + Math.random() * 0.25,
      });
    }
  }

  _actualizarParticulas() {
    this.particulas.forEach(p => {
      p.y -= p.vel;
      if (p.y < -p.r) {
        p.y = this.canvas.height + p.r;
        p.x = Math.random() * this.canvas.width;
      }
    });
  }

  _dibujarParticulas() {
    const ctx = this.ctx;
    this.particulas.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(100, 200, 255, ${p.alpha})`;
      ctx.fill();
    });
  }
}

// Instancia global que UI.js usará
const game = new Game();
