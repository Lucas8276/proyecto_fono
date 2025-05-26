// loro.js

// Inyectar estilos
const style = document.createElement('style');
style.innerHTML = 
`
  #loro-container {
    position: fixed;
    bottom: 20px;
    left: 20px;
    width: 120px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  #loro {
    width: 100px;
    height: auto;
    animation: float 2s ease-in-out infinite;
  }

  .plumas {
    display: flex;
    gap: 4px;
    margin-top: 6px;
  }

  .pluma {
    width: 14px;
    height: 20px;
    border-radius: 4px;
    background: #ccc;
    transition: background 0.3s;
  }

  @keyframes float {
    0% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
    100% { transform: translateY(0); }
  }
`;
document.head.appendChild(style);

// Inyectar HTML del loro
const loroHTML = `
  <div id="loro-container">
    <img src="imagenes/loro.png" alt="LoroLolo" id="loro">
    <div class="plumas">
      <div class="pluma" id="pluma1"></div>
      <div class="pluma" id="pluma2"></div>
      <div class="pluma" id="pluma3"></div>
      <div class="pluma" id="pluma4"></div>
      <div class="pluma" id="pluma5"></div>
    </div>
  </div>
`;
document.body.insertAdjacentHTML('beforeend', loroHTML);

// Presentación una sola vez
if (!localStorage.getItem('loro_saludo')) {
  Swal.fire({
    title: "¡Hola!",
    text: "Soy LoroLolo 🦜 y voy a acompañarte en esta aventura. ¡Vamos a divertirnos aprendiendo!",
    imageUrl: "imagenes/loro.png",
    imageWidth: 100,
    confirmButtonText: "¡Vamos!"
  });
  localStorage.setItem('loro_saludo', 'true');
}

// Pintar plumas según secciones completadas
const colores = ['#FFD817', '#FF6632', '#FF86BB', '#00b453', '#0074FF'];
const claves = ['semantica_completa', 'fonetica_completa', 'fonologia_completa', 'morfosintaxis_completa', 'pragmatica_completa'];

claves.forEach((clave, i) => {
  if (localStorage.getItem(clave)) {
    document.getElementById(`pluma${i + 1}`).style.background = colores[i];
  }
});

// Frases motivadoras
const frases = [
  "¡Excelente trabajo!",
  "¡Lo estás haciendo genial!",
  "¡Sos un campeón!",
  "¡No te rindas!",
  "¡Estoy muy orgulloso de vos!"
];

// Función global para usar desde cualquier juego
window.loroMotiva = () => {
  const frase = frases[Math.floor(Math.random() * frases.length)];
  Swal.fire("LoroLolo dice:", frase, "info");
};
