// Componente Loro Motivacional reutilizable
// Uso: renderLoro({ mensajes: ["mensaje1", "mensaje2", ...], imagen: "ruta/imagen.png" })

function renderLoro({ mensajes = ["Hola, soy Blas, tu compañero de aprendizaje"], imagen = '../images/loro.png' }) {
  // Evitar duplicados
  if (document.getElementById('loro-motivacional')) return;

  const loroDiv = document.createElement('div');
  loroDiv.id = 'loro-motivacional';
  loroDiv.style = 'position:fixed;bottom:30px;left:30px;z-index:3000;display:flex;flex-direction:column;align-items:center;gap:0;min-width:260px;';

  loroDiv.innerHTML = `
    <div style="position:relative;display:flex;align-items:flex-end;justify-content:center;width:100%;">
      <div id="burbuja-loro" style="background:#fffbe6;border-radius:18px 18px 0 18px;padding:16px 22px;box-shadow:0 2px 10px rgba(0,0,0,0.13);font-size:1.3rem;color:#006B3F;width:260px;min-height:44px;display:flex;align-items:center;justify-content:center;font-family:'Fredoka',sans-serif !important;position:relative;margin-bottom:-12px;transition:background 0.2s;word-break:break-word;">
        ${mensajes[0]}
        <span style="content:'';position:absolute;left:50%;bottom:-18px;transform:translateX(-50%);width:0;height:0;border-bottom:18px solid #fffbe6;border-left:18px solid transparent;border-right:18px solid transparent;"></span>
      </div>
      <canvas id="confetti-canvas" style="position:absolute;pointer-events:none;bottom:-30px;left:50%;transform:translateX(-50%);width:220px;height:180px;z-index:4000;display:none;"></canvas>
    </div>
    <img src="${imagen}" alt="Loro Motivacional" style="width:180px;height:180px;object-fit:contain;filter:drop-shadow(0 2px 8px rgba(0,0,0,0.18));">
  `;

  document.body.appendChild(loroDiv);

  // Mensajes rotativos solo si hay más de uno
  if (mensajes.length > 1) {
    let idxLoro = 0;
    setInterval(() => {
      idxLoro = (idxLoro + 1) % mensajes.length;
      document.getElementById('burbuja-loro').textContent = mensajes[idxLoro];
    }, 5000);
  }

  // Confeti SOLO en la zona del loro
  window.lanzarConfeti = function() {
    const loroDiv = document.getElementById('loro-motivacional');
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = loroDiv.offsetWidth;
    canvas.height = loroDiv.offsetHeight;
    canvas.style.display = 'block';
    const confettis = [];
    const colors = ['#ffd817','#4a94ff','#00b453','#ff6632','#ff86bb','#fffbe6'];
    for(let i=0;i<60;i++){
      confettis.push({
        x: Math.random()*canvas.width,
        y: Math.random()*-canvas.height,
        r: 6+Math.random()*8,
        d: Math.random()*canvas.height/2,
        color: colors[Math.floor(Math.random()*colors.length)],
        tilt: Math.random()*10-10,
        tiltAngle:0
      });
    }
    let frame=0;
    function draw(){
      ctx.clearRect(0,0,canvas.width,canvas.height);
      confettis.forEach(c=>{
        ctx.beginPath();
        ctx.ellipse(c.x,c.y,c.r,c.r/2,Math.PI/4,0,2*Math.PI);
        ctx.fillStyle=c.color;
        ctx.fill();
      });
      update();
      frame++;
      if(frame<80){
        requestAnimationFrame(draw);
      }else{
        canvas.style.display = 'none';
      }
    }
    function update(){
      confettis.forEach(c=>{
        c.y+=2+Math.random()*3;
        c.x+=Math.sin(frame/10+c.d)*2;
      });
    }
    draw();
  }
} 