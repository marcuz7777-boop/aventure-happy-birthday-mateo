(() => {
  'use strict';

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const W = canvas.width;
  const H = canvas.height;
  const groundBottom = 405;
  const keys = new Set();
  const player = { x: 82, y: 350, speed: 2.5 };
  let moving = false;
  let message = 'Explora el mapa. Acércate a los objetos y pulsa E.';
  let messageUntil = 0;
  let found = 0;

  const objectives = [
    { name: 'Árbol', x: 205, y: 175, visited: false, kind: 'tree', memory: 'Aquí comenzó una historia que todavía recuerdo con una sonrisa.' },
    { name: 'Videojuegos', x: 700, y: 205, visited: false, kind: 'computer', memory: 'Las partidas y las risas siempre hacen buenos recuerdos.' },
    { name: 'Series', x: 700, y: 330, visited: false, kind: 'tv', memory: 'Una serie compartida puede convertirse en una tradición.' },
    { name: 'Chistes', x: 460, y: 320, visited: false, kind: 'smile', memory: 'Algunos chistes son malos… pero igual nos hacen reír.' }
  ];
  const flowers = [];
  const rocks = [];
  let seed = 8723;
  function random() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
  for (let i = 0; i < 115; i++) flowers.push({ x: 20 + random() * 920, y: 22 + random() * 370, color: ['#ffd34e', '#e88cbc', '#8bd5ff'][Math.floor(random() * 3)], phase: random() * Math.PI * 2 });
  for (let i = 0; i < 25; i++) rocks.push({ x: 20 + random() * 920, y: 22 + random() * 365, size: 3 + random() * 5 });

  function rect(x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
  function text(value, x, y, size, color, weight = '600', align = 'left') {
    ctx.fillStyle = color; ctx.font = `${weight} ${size}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`; ctx.textAlign = align; ctx.textBaseline = 'top'; ctx.fillText(value, x, y);
  }
  function drawBackground(time) {
    rect(0, 0, W, H, '#39a84a');
    for (let i = 0; i < 700; i++) {
      const x = (i * 197 + 31) % W, y = (i * 113 + 17) % groundBottom;
      rect(x, y, 2 + i % 3, 2, i % 2 ? '#46b653' : '#329a42');
    }
    rect(0, 0, W, 8, '#24472a'); rect(0, 0, 8, groundBottom, '#24472a'); rect(W - 8, 0, 8, groundBottom, '#24472a');
    rect(20, 365, 180, 34, '#b8a06a'); rect(20, 365, 180, 4, '#d0b77d');
    for (const rock of rocks) {
      ctx.fillStyle = '#777f6a'; ctx.beginPath(); ctx.ellipse(rock.x, rock.y, rock.size, rock.size * .65, 0, 0, Math.PI * 2); ctx.fill();
      rect(rock.x - rock.size / 2, rock.y - rock.size / 2, rock.size, 2, '#a2a58a');
    }
    for (const flower of flowers) {
      const sway = Math.sin(time / 500 + flower.phase) * 1.2;
      rect(flower.x, flower.y + 2, 2, 7, '#34733a');
      ctx.fillStyle = flower.color;
      ctx.fillRect(flower.x - 3 + sway, flower.y - 2, 3, 3); ctx.fillRect(flower.x + 2 + sway, flower.y - 2, 3, 3);
      ctx.fillRect(flower.x - 1 + sway, flower.y - 5, 3, 3); ctx.fillRect(flower.x - 1 + sway, flower.y + 1, 3, 3);
      rect(flower.x, flower.y - 1, 2, 2, '#f4e69a');
    }
  }
  function drawTree(time) {
    ctx.fillStyle = '#267c37'; ctx.beginPath(); ctx.ellipse(205, 235, 82, 15, 0, 0, Math.PI * 2); ctx.fill();
    rect(189, 145, 32, 96, '#70442a'); rect(196, 151, 14, 83, '#986039');
    rect(171, 183, 15, 9, '#70442a'); rect(218, 172, 18, 9, '#70442a');
    const sway = Math.sin(time / 1300) * 2;
    const leaves = [[-62,-16,124,76,'#176c32'],[-52,-43,105,78,'#25863b'],[-31,-62,70,56,'#3ba74b'],[-78,4,70,48,'#27883b'],[15,0,70,52,'#2b9140'],[-32,-23,65,54,'#4bb166'],[42,-13,35,40,'#4fb34f'],[-96,8,32,30,'#2f8b3d']];
    for (const [dx,dy,w,h,color] of leaves) rect(205 + dx + sway, 138 + dy, w, h, color);
    rect(162 + sway,119,18,14,'#53bd52'); rect(227 + sway,93,18,14,'#53bd52'); rect(192 + sway,75,20,12,'#5bc458');
  }
  function drawComputer() {
    ctx.fillStyle = 'rgba(20,70,30,.35)'; ctx.beginPath(); ctx.ellipse(700,270,82,10,0,0,Math.PI*2); ctx.fill();
    rect(638,225,125,12,'#704127'); rect(632,237,137,11,'#9a6037');
    rect(640,248,9,38,'#613c27'); rect(752,248,9,38,'#613c27'); rect(649,238,100,4,'#bd8250');
    rect(662,155,78,66,'#343a3b'); rect(667,160,68,54,'#b6b9ad'); rect(672,165,58,44,'#707e87');
    rect(680,216,42,7,'#8f9690'); rect(673,222,58,4,'#c2c3b9');
    rect(669,229,48,7,'#ddd4b7'); for (let x=672;x<714;x+=7) rect(x,231,4,2,'#77766d');
    rect(641,229,13,12,'#d8d0b9'); rect(644,232,7,3,'#843d38');
    ctx.fillStyle='#d6ceb7'; ctx.beginPath(); ctx.ellipse(741,234,5,7,0,0,Math.PI*2); ctx.fill();
    rect(714,181,6,6,'#d33338'); rect(724,181,6,6,'#2871da');
  }
  function drawTV() {
    rect(645,351,112,9,'#75472b'); rect(638,360,126,11,'#a16a3d');
    rect(647,371,8,18,'#66402b'); rect(748,371,8,18,'#66402b');
    rect(660,300,82,55,'#34383a'); rect(666,306,70,42,'#18232a'); rect(671,311,60,32,'#4d9cdb');
    rect(676,315,10,4,'#89cafa'); rect(713,349,4,3,'#54c77a');
  }
  function drawSmile(time) {
    const bob = Math.sin(time / 300) * 3;
    ctx.fillStyle='rgba(255,215,54,.15)'; ctx.beginPath(); ctx.arc(460,305+bob,55,0,Math.PI*2); ctx.fill();
    for (let i=0;i<8;i++) { const a=i*Math.PI/4+time/1800, r=42+Math.sin(time/250+i)*4; rect(460+Math.cos(a)*r-2,305+bob+Math.sin(a)*r-2,5,5,'#ffdb48'); }
    ctx.fillStyle='#d8a933'; ctx.beginPath(); ctx.ellipse(460,341,24,6,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#ffc928'; ctx.beginPath(); ctx.arc(460,305+bob,24,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#b87816'; ctx.lineWidth=3; ctx.stroke();
    rect(452,298+bob,3,5,'#533614'); rect(465,298+bob,3,5,'#533614');
    ctx.strokeStyle='#533614'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(460,302+bob,11,.2,Math.PI-.2); ctx.stroke();
    return {x:460,y:305+bob};
  }
  function drawPlayer(time) {
    const x=Math.round(player.x), bob=moving?Math.abs(Math.sin(time/75))*-2:0, y=Math.round(player.y+bob), step=moving?Math.sin(time/75)*3:0;
    ctx.fillStyle='#28652f'; ctx.beginPath(); ctx.ellipse(x,y+13,11,4,0,0,Math.PI*2); ctx.fill();
    rect(x-7,y-13,14,13,'#493222'); rect(x-6,y-11,12,12,'#e8b783'); rect(x-7,y-13,14,4,'#3b2920'); rect(x-8,y-8,3,5,'#3b2920');
    rect(x-2,y-7,2,2,'#30251f'); rect(x+4,y-7,2,2,'#30251f'); rect(x-8,y,16,12,'#3283ca');
    rect(x-10-Math.max(0,-step),y+1,3,8,'#e8b783'); rect(x+7+Math.max(0,step),y+1,3,8,'#e8b783');
    rect(x-6,y+12,5,7+Math.max(0,step),'#344c9b'); rect(x+2,y+12,5,7+Math.max(0,-step),'#344c9b');
  }
  function drawObjectives() {
    rect(690,12,254,128,'#72512f'); rect(694,16,246,120,'#ead8ad'); rect(701,23,232,2,'#c3a878');
    text('OBJETIVOS',817,25,16,'#493521','800','center');
    objectives.forEach((item,index)=>{
      const y=52+index*19; rect(708,y+2,12,12,item.visited?'#8d693c':'#f6e8c7');
      ctx.strokeStyle='#8d693c'; ctx.lineWidth=1.5; ctx.strokeRect(708.5,y+2.5,11,11);
      if(item.visited){ctx.strokeStyle='#fff0c8';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(710,y+8);ctx.lineTo(714,y+12);ctx.lineTo(720,y+4);ctx.stroke();}
      text(item.name,728,y,14,'#493521','600');
    });
    ctx.fillStyle='#743326';ctx.beginPath();ctx.arc(922,126,14,0,Math.PI*2);ctx.fill();ctx.fillStyle='#a64b37';ctx.beginPath();ctx.arc(922,126,10,0,Math.PI*2);ctx.fill();
  }
  function drawDialog(time) {
    rect(0,groundBottom,W,H-groundBottom,'#142719'); rect(0,groundBottom,W,3,'#d0c49c');
    rect(12,groundBottom+10,W-24,H-groundBottom-20,'rgba(15,35,20,.88)');
    ctx.strokeStyle='#bca36f';ctx.lineWidth=2;ctx.strokeRect(13,groundBottom+11,W-26,H-groundBottom-22);
    const current=time<messageUntil?message:'Explora el mapa. Acércate a los objetos y pulsa E.';
    text(current,30,426,17,'#fff3d4','700');
    text('Mover: WASD  |  Interactuar: E',30,462,14,'#d9e1d2','600');
    text(`Recuerdos encontrados: ${found}/4`,30,492,15,'#fff3d4','700');
  }
  function draw(time) {
    drawBackground(time); drawTree(time); drawComputer(); drawTV();
    const smile=drawSmile(time);
    for(const item of objectives){if(item.visited)continue;const p=item.kind==='smile'?smile:item;ctx.strokeStyle='rgba(255,231,112,.4)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,29+Math.sin(time/220)*2,0,Math.PI*2);ctx.stroke();}
    drawPlayer(time); drawObjectives(); drawDialog(time);
  }
  function interact() {
    let nearest=null, distance=Infinity;
    for(const item of objectives){const d=Math.hypot(player.x-item.x,player.y-item.y);if(d<distance){nearest=item;distance=d;}}
    if(nearest&&distance<58){if(!nearest.visited){nearest.visited=true;found++;message=`¡Encontraste el recuerdo: ${nearest.name}! ${nearest.memory}`;}else message=`Ya descubriste el recuerdo de ${nearest.name}.`;}
    else message='No hay nada cerca. Acércate a un objeto para interactuar.';
    messageUntil=performance.now()+4200;
  }
  function frame(time) {
    let dx=0,dy=0;
    if(keys.has('a')||keys.has('A')||keys.has('ArrowLeft'))dx--;
    if(keys.has('d')||keys.has('D')||keys.has('ArrowRight'))dx++;
    if(keys.has('w')||keys.has('W')||keys.has('ArrowUp'))dy--;
    if(keys.has('s')||keys.has('S')||keys.has('ArrowDown'))dy++;
    if(dx&&dy){dx*=Math.SQRT1_2;dy*=Math.SQRT1_2;}
    moving=Boolean(dx||dy);
    player.x=Math.max(19,Math.min(941,player.x+dx*player.speed));
    player.y=Math.max(24,Math.min(384,player.y+dy*player.speed));
    draw(time); requestAnimationFrame(frame);
  }
  window.addEventListener('keydown',event=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(event.key))event.preventDefault();keys.add(event.key);if(event.key.toLowerCase()==='e'&&!event.repeat)interact();});
  window.addEventListener('keyup',event=>keys.delete(event.key));
  window.addEventListener('blur',()=>keys.clear());
  document.getElementById('interact').addEventListener('click',interact);
  document.querySelectorAll('[data-key]').forEach(button=>{const key=button.dataset.key;button.addEventListener('pointerdown',event=>{event.preventDefault();keys.add(key);button.setPointerCapture(event.pointerId);});const release=()=>keys.delete(key);button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);});
  requestAnimationFrame(frame);
})();
