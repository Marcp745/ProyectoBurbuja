/* ════════════════════════════════════════════
   UI.js — Pantallas, puntaje y localStorage
   ════════════════════════════════════════════ */

const UI = {

  // ─── Muestra una pantalla y oculta las demás ──
  // nombre: 'start' | 'game' | 'gameover'
  mostrarPantalla(nombre) {
    document.querySelectorAll('.screen').forEach(s => {
      s.classList.remove('active');
    });
    document.getElementById('screen-' + nombre).classList.add('active');
  },

  // ─── Guarda el high score en localStorage ─────
  guardarRecord(puntaje) {
    const actual = this.cargarRecord();
    if (puntaje > actual) {
      localStorage.setItem('burbuja_record', puntaje);
    }
  },

  // ─── Carga el high score guardado ─────────────
  cargarRecord() {
    return parseInt(localStorage.getItem('burbuja_record') || '0');
  },

  // ─── Muestra la pantalla de Game Over ─────────
  mostrarGameOver(puntajeFinal) {
    this.guardarRecord(puntajeFinal);

    const record = this.cargarRecord();

    // Actualiza los valores en pantalla
    document.getElementById('final-score').textContent  = puntajeFinal;
    document.getElementById('final-record').textContent = record;

    // Muestra el badge de "¡Nuevo récord!" si corresponde
    const badge = document.getElementById('nuevo-record');
    if (puntajeFinal >= record && puntajeFinal > 0) {
      badge.classList.remove('oculto');
    } else {
      badge.classList.add('oculto');
    }

    this.mostrarPantalla('gameover');
  },

  // ─── Actualiza el récord en la pantalla de inicio ──
  actualizarRecordInicio() {
    document.getElementById('high-score-display').textContent = this.cargarRecord();
  },

  // ─── Configura todos los botones ──────────────
  inicializar() {

    // Botón JUGAR
    document.getElementById('btn-play').addEventListener('click', () => {
      UI.mostrarPantalla('game');
      game.iniciar();
    });

    // Botón REINTENTAR
    document.getElementById('btn-retry').addEventListener('click', () => {
      UI.mostrarPantalla('game');
      game.iniciar();
    });

    // Botón INICIO
    document.getElementById('btn-home').addEventListener('click', () => {
      UI.actualizarRecordInicio();
      UI.mostrarPantalla('start');
    });

    document.getElementById('btn-pause').addEventListener('click', () => game.pausar());
    document.getElementById('btn-resume').addEventListener('click', () => game.continuar());
    document.getElementById('btn-restart-pause').addEventListener('click', () => {
      document.getElementById('pause-menu').classList.add('oculto');
      game.iniciar();
    });
    document.getElementById('btn-home-pause').addEventListener('click', () => {
      document.getElementById('pause-menu').classList.add('oculto');
      game.estado = 'idle';
      UI.actualizarRecordInicio();
      UI.mostrarPantalla('start');
    });

    // Muestra el récord guardado al abrir la app
    this.actualizarRecordInicio();
  }
};

// Arranca la UI cuando el HTML termina de cargar
document.addEventListener('DOMContentLoaded', () => {
  UI.inicializar();
});
