document.addEventListener("DOMContentLoaded", function () {
  const style = document.createElement("style");
  style.innerHTML =
   `
    #loro-container {
      position: absolute;
      bottom: 200px;
      left: 50px;
      width: auto;
      z-index: 9999;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    dotlottie-wc {
      width: 600px !important;
      height: auto !important;
    }

    #burbuja-loro {
      position: relative;
      background: #fff;
      color: #333;
      font-family: 'Fredoka', sans-serif;
      font-size: 22px;
      padding: 18px 24px;
      border-radius: 22px;
      border: 4px solid #FFD817;
      box-shadow: 0 5px 12px rgba(0, 0, 0, 0.25);
      max-width: 320px;
      text-align: center;
      animation: aparecer 0.4s ease-in-out;
    }

    #burbuja-loro::after {
      content: "";
      position: absolute;
      bottom: -20px;
      left: 60px;
      width: 0;
      height: 0;
      border-left: 18px solid transparent;
      border-right: 18px solid transparent;
      border-top: 20px solid #fff;
      filter: drop-shadow(0 -2px 2px rgba(0,0,0,0.15));
    }

    @keyframes aparecer {
      from { opacity: 0; transform: scale(0.9); }
      to   { opacity: 1; transform: scale(1); }
    }
  `;
  document.head.appendChild(style);

  const moduleScript = document.createElement("script");
  moduleScript.type = "module";
  moduleScript.src = "https://unpkg.com/@lottiefiles/dotlottie-wc@0.3.0/dist/dotlottie-wc.js";
  document.head.appendChild(moduleScript);

  const audio = document.createElement("audio");
  audio.id = "loro-audio";
  audio.src = "https://cdn.pixabay.com/audio/2022/03/16/audio_93049c8cd1.mp3";
  document.body.appendChild(audio);

  const container = document.createElement("div");
  container.id = "loro-container";
  container.innerHTML = `
    <div id="burbuja-loro">¡Hola! Soy Blas, tu compañero de juego 🦜</div>
    <dotlottie-wc 
    src="https://lottie.host/a26f74c8-389b-4c26-88ab-32f9180aa246/eyuxo2A5ZR.lottie"
      autoplay 
      loop>
    </dotlottie-wc>
  `;
  document.body.appendChild(container);

  window.mostrarMensajeLoro = function(texto) {
    const burbuja = document.getElementById('burbuja-loro');
    const audio = document.getElementById('loro-audio');
    if (burbuja) {
      burbuja.innerText = texto;
      burbuja.classList.remove('aparecer');
      void burbuja.offsetWidth;
      burbuja.classList.add('aparecer');
    }
    if (audio) {
      audio.currentTime = 0;
      audio.play();
    }
  };

  setTimeout(() => {
    mostrarMensajeLoro("¡Vamos a jugar juntos!");
  }, 1500);
});
