const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let fuenteX = 100;
let vFuente = 0;
let vObs = 0;
let ondas = [];
let tiempo = 0;
let animando = true;
const c = 343; // Velocidad del sonido
let audioContext, oscillator, gainNode;

function calcular() {
  const f = parseFloat(document.getElementById("frecuencia").value);
  vFuente = parseFloat(document.getElementById("vFuente").value);
  vObs = parseFloat(document.getElementById("vObs").value);

  const fPercibida = f * ((c + vObs) / (c - vFuente));
  document.getElementById("resultado").innerText = fPercibida.toFixed(2);

  ondas = [];
  tiempo = 0;
  fuenteX = 100;

  if (document.getElementById("activarSonido").checked) {
    iniciarSonido(fPercibida);
  } else {
    detenerSonido();
  }
}

function iniciarSonido(frecuencia) {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  detenerSonido();
  oscillator = audioContext.createOscillator();
  gainNode = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frecuencia, audioContext.currentTime);
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start();
}

function detenerSonido() {
  if (oscillator) {
    oscillator.stop();
    oscillator.disconnect();
    oscillator = null;
  }
}

function dibujar() {
  if (!animando) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Observador
  let obsX = canvas.width - 100 + vObs * 0.05 * tiempo;
  ctx.fillStyle = "blue";
  ctx.beginPath();
  ctx.arc(obsX, canvas.height / 2, 12, 0, Math.PI * 2);
  ctx.fill();

  // Fuente
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(fuenteX, canvas.height / 2, 12, 0, Math.PI * 2);
  ctx.fill();

  // Dibujar ondas
  if (tiempo % 15 === 0) {
    ondas.push({ x: fuenteX, r: 1 });
  }
  ctx.strokeStyle = "white";
  ondas.forEach(o => {
    o.r += 2;
    ctx.beginPath();
    ctx.arc(o.x, canvas.height / 2, o.r, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Mover fuente
  fuenteX += vFuente * 0.05;
  tiempo++;
  ondas = ondas.filter(o => o.r < 600);

  // Actualizar volumen según distancia
  if (gainNode && document.getElementById("activarSonido").checked) {
    const distancia = Math.abs(obsX - fuenteX);
    const volumen = Math.max(0.05, Math.min(1, 1 / (distancia / 50)));
    gainNode.gain.setValueAtTime(volumen, audioContext.currentTime);
  }

  requestAnimationFrame(dibujar);
}

function toggleSimulacion() {
  animando = !animando;
  if (animando) {
    dibujar();
  } else {
    detenerSonido();
  }
}

calcular();
dibujar();

const btnAyuda = document.getElementById('btnAyuda');
const cajaAyuda = document.getElementById('cajaAyuda');

btnAyuda.addEventListener('click', () => {
  cajaAyuda.classList.toggle('show');
  if (cajaAyuda.classList.contains('show')) {
    btnAyuda.textContent = '✖ Cerrar ayuda';
  } else {
    btnAyuda.textContent = '❓ Ayuda';
  }
});
