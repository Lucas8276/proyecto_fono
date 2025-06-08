// Variable global para el audio
let globalAudio = null;

// Función para inicializar el sonido
function initSound() {
  // Si ya existe una instancia de audio, la reutilizamos
  if (!globalAudio) {
    globalAudio = new Audio('/public/musica.mp4');
    globalAudio.loop = true;
    globalAudio.volume = 0.5;
    
    // Asegurarnos de que el audio siga reproduciéndose
    globalAudio.addEventListener('ended', () => {
      globalAudio.play().catch(e => console.error('Error al reiniciar:', e));
    });
  }

  // Verificar el estado del sonido
  let sonido = sessionStorage.getItem('sonido_activado');
  if (sonido === null) {
    sonido = 'true';
    sessionStorage.setItem('sonido_activado', 'true');
  }

  // Reproducir o pausar según el estado
  if (sonido === 'true') {
    // Intentar reproducir el audio
    const playPromise = globalAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log('Error al reproducir el audio:', error);
        // Intentar reproducir después de una interacción del usuario
        document.addEventListener('click', () => {
          globalAudio.play().catch(e => console.error('Error en segundo intento:', e));
        }, { once: true });
      });
    }
  }

  // Actualizar el botón de sonido si existe
  const soundBtn = document.getElementById('sound-btn');
  const soundIcon = document.getElementById('sound-icon');
  const soundText = document.getElementById('sound-text');

  if (soundBtn && soundIcon && soundText) {
    if (sonido === 'true') {
      soundIcon.textContent = '🔊';
      soundText.textContent = 'Sonido Activado';
      soundBtn.style.background = '#ffd817';
      soundBtn.style.color = '#333';
    } else {
      soundIcon.textContent = '🔇';
      soundText.textContent = 'Sonido Desactivado';
      soundBtn.style.background = '#eee';
      soundBtn.style.color = '#888';
    }

    // Agregar evento al botón de sonido
    soundBtn.onclick = function() {
      if (sonido === 'true') {
        sessionStorage.setItem('sonido_activado', 'false');
        globalAudio.pause();
        soundIcon.textContent = '🔇';
        soundText.textContent = 'Sonido Desactivado';
        soundBtn.style.background = '#eee';
        soundBtn.style.color = '#888';
        sonido = 'false';
      } else {
        sessionStorage.setItem('sonido_activado', 'true');
        globalAudio.play().catch(error => {
          console.log('Error al reproducir el audio:', error);
        });
        soundIcon.textContent = '🔊';
        soundText.textContent = 'Sonido Activado';
        soundBtn.style.background = '#ffd817';
        soundBtn.style.color = '#333';
        sonido = 'true';
      }
    };
  }
}

// Inicializar el sonido cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initSound);

// Intentar reproducir después de cualquier interacción del usuario
document.addEventListener('click', () => {
  if (globalAudio && sessionStorage.getItem('sonido_activado') === 'true') {
    globalAudio.play().catch(e => console.error('Error al reproducir después de interacción:', e));
  }
}, { once: true });

// Guardar el tiempo actual del audio antes de cambiar de página
window.addEventListener('beforeunload', () => {
  if (globalAudio) {
    sessionStorage.setItem('audioTime', globalAudio.currentTime);
  }
});

// Restaurar el tiempo del audio al cargar una nueva página
window.addEventListener('load', () => {
  if (globalAudio && sessionStorage.getItem('audioTime')) {
    globalAudio.currentTime = parseFloat(sessionStorage.getItem('audioTime'));
  }
}); 