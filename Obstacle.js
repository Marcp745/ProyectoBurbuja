/* ════════════════════════════════════════════
   Obstacle.js — Generación y dibujo de corales
   ════════════════════════════════════════════ */

class Obstacle {

  constructor(canvas, velocidad = 3) {
    this.canvas    = canvas;
    this.ctx       = canvas.getContext('2d');
    this.ancho     = canvas.width * 0.14;
    this.velocidad = velocidad;
    this.pasado    = false;   // se vuelve true cuando la burbuja lo supera

    // Hueco aleatorio entre 20% y 72% de la altura de la pantalla
    const tamHueco   = canvas.height * 0.28;
    const minY       = canvas.height * 0.18;
    const maxY       = canvas.height * 0.72;
    const centroHueco = minY + Math.random() * (maxY - minY);

    this.x          = canvas.width + this.ancho;  // empieza fuera de pantalla
    this.altoTop    = centroHueco - tamHueco / 2;
    this.inicioBot  = centroHueco + tamHueco / 2;
    this.altoBot    = canvas.height - this.inicioBot;
  }

  // Mueve el obstáculo hacia la izquierda
  actualizar() {
    this.x -= this.velocidad;
  }

  // ¿Ya salió completamente por la izquierda?
  fueraDePantalla() {
    return this.x + this.ancho < 0;
  }

  // ¿La burbuja acaba de pasar este obstáculo? (para sumar punto)
  verificarPunto(bubbleX) {
    if (!this.pasado && bubbleX > this.x + this.ancho) {
      this.pasado = true;
      return true;
    }
    return false;
  }

  // Dibuja el par de corales (arriba y abajo)
  dibujar() {
    this._dibujarCoral(this.x, 0, this.altoTop, 'arriba');
    this._dibujarCoral(this.x, this.inicioBot, this.altoBot, 'abajo');
  }

  // Dibuja un coral individual
  _dibujarCoral(x, y, alto, lado) {
    if (alto <= 0) return;

    const ctx = this.ctx;
    const w   = this.ancho;
    const r   = 8;

    ctx.save();

    // Base cálida para que se perciba como coral, no como una pared verde.
    const grad = ctx.createLinearGradient(x, y, x + w, y);
    grad.addColorStop(0,   '#b94363');
    grad.addColorStop(0.5, '#ff8a65');
    grad.addColorStop(1,   '#a93659');

    // Forma del coral con esquinas redondeadas en la punta
    ctx.beginPath();
    if (lado === 'arriba') {
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.arcTo(x + w, y, x + w, y + r, r);
      ctx.lineTo(x + w, y + alto - r);
      ctx.arcTo(x + w, y + alto, x + w - r, y + alto, r);
      ctx.lineTo(x + r, y + alto);
      ctx.arcTo(x, y + alto, x, y + alto - r, r);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
    } else {
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + alto - r);
      ctx.arcTo(x + w, y + alto, x + w - r, y + alto, r);
      ctx.lineTo(x + r, y + alto);
      ctx.arcTo(x, y + alto, x, y + alto - r, r);
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Borde y textura orgánica
    ctx.strokeStyle = 'rgba(106, 35, 65, 0.65)';
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    // Pólipos redondos y ramitas en el borde del hueco.
    const puntas = [0.12, 0.32, 0.54, 0.76, 0.93];
    const bordeY = lado === 'arriba' ? y + alto : y;
    const dir = lado === 'arriba' ? 1 : -1;
    puntas.forEach((frac, indice) => {
      const px = x + w * frac;
      const largo = 7 + (indice % 2) * 5;
      ctx.beginPath();
      ctx.moveTo(px, bordeY);
      ctx.quadraticCurveTo(px + (indice % 2 ? 4 : -4), bordeY + dir * largo * .55, px + (indice % 2 ? 7 : -7), bordeY + dir * largo);
      ctx.strokeStyle = '#ff9d7a';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(px, bordeY + dir * 3, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = indice % 2 ? '#ffb199' : '#f36f8f';
      ctx.fill();
    });

    // Pequeños poros, visibles sin distraer durante el juego.
    ctx.fillStyle = 'rgba(255, 225, 210, .35)';
    for (let py = y + 18; py < y + alto - 12; py += 23) {
      ctx.beginPath();
      ctx.arc(x + w * .35, py, 1.4, 0, Math.PI * 2);
      ctx.arc(x + w * .7, py + 8, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Rectángulos para la detección de colisiones
  getHitboxes() {
    return [
      { x: this.x, y: 0,             w: this.ancho, h: this.altoTop  },
      { x: this.x, y: this.inicioBot, w: this.ancho, h: this.altoBot  },
    ];
  }
}
