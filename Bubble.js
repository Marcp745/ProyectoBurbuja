/* ════════════════════════════════════════════
   Bubble.js — Física y dibujo de la burbuja
   ════════════════════════════════════════════ */

class Bubble {

  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');

    // Posición: fija en x, variable en y
    this.x      = canvas.width * 0.25;
    this.y      = canvas.height * 0.5;
    this.radio  = canvas.width * 0.055;   // tamaño relativo al canvas

    // Física
    this.velocidadY = 0;
    // Valores por frame a 60 fps. Se escalan con delta para que se sienta igual
    // tanto en equipos lentos como rápidos.
    this.gravedad   = canvas.height * 0.00048;
    this.fuerza     = canvas.height * -0.0125;
    this.velocidadMaxCaida = canvas.height * 0.011;
  }

  // Llamado al tocar la pantalla
  saltar() {
    this.velocidadY = this.fuerza;
  }

  // Actualiza la posición cada frame
  actualizar(delta = 1) {
    this.velocidadY = Math.min(this.velocidadY + this.gravedad * delta, this.velocidadMaxCaida);
    this.y += this.velocidadY * delta;
  }

  // Dibuja la burbuja en el canvas
  dibujar() {
    const ctx = this.ctx;
    const r   = this.radio;

    ctx.save();
    ctx.translate(this.x, this.y);

    // Una inclinación sutil da sensación de que la burbuja responde al impulso.
    ctx.rotate(Math.max(-0.12, Math.min(0.12, this.velocidadY * 0.012)));

    // Cuerpo con gradiente (efecto de burbuja)
    const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
    grad.addColorStop(0,   'rgba(255, 255, 255, 0.9)');
    grad.addColorStop(0.3, 'rgba(100, 210, 255, 0.85)');
    grad.addColorStop(1,   'rgba(0, 120, 200, 0.6)');

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Borde
    ctx.strokeStyle = 'rgba(150, 230, 255, 0.7)';
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    // Brillo pequeño arriba-izquierda
    ctx.beginPath();
    ctx.ellipse(-r * 0.3, -r * 0.35, r * 0.2, r * 0.12, -0.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();

    ctx.restore();
  }

  // Devuelve true si la burbuja salió de los límites
  salioDePantalla() {
    return (
      this.y - this.radio < 0 ||
      this.y + this.radio > this.canvas.height
    );
  }

  // Área de colisión (un poco más pequeña para ser justos)
  getHitbox() {
    const margen = this.radio * 0.25;
    return {
      x: this.x - this.radio + margen,
      y: this.y - this.radio + margen,
      w: (this.radio - margen) * 2,
      h: (this.radio - margen) * 2,
    };
  }

  // Reinicia la burbuja al centro
  reiniciar() {
    this.y          = this.canvas.height * 0.5;
    this.velocidadY = 0;
  }
}
