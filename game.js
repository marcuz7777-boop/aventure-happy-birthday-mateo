(() => {
  'use strict';

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const groundBottom = 490;
  const keys = new Set();
  const player = { x: 92, y: 465, speed: 2.7 };
  let message = 'Explora el mapa. Acércate a los objetos y pulsa E.';
  let messageUntil = 0;
  let found = 0;
  let moving = false;

  const objectives = [
    { name: 'Árbol', x: 210, y: 238, visited: false, kind: 'tree', memory: 'Aquí comenzó una historia que todavía recuerdo con una sonrisa.' },
    { name: 'Videojuegos', x: 690, y: 245, visited: false, kind: 'computer', memory: 'Las partidas y las risas siempre hacen buenos recuerdos.' },
    { name: 'Series', x: 690, y: 405, visited: false, kind: 'tv', memory: 'Una serie compartida puede convertirse en una tradición.' },
    { name: 'Chistes', x: 270, y: 380, visited: false, kind: 'smile', memory: 'Algunos chistes son malos… pero igual nos hacen reír.' }
  ];
  const flowers = [];
  const rocks = [];
  let seed = 8723;
  function random() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
  for (let i = 0; i < 190; i++) flowers.push({ x: 18 + random() * 924, y: 18 + random() * 458, color: ['#ffd34e', '#e88c38', '#8bd5ff', '#e98aaa'][Math.floor(random() * 4)], phase: random() * Math.PI * 2 });
  for (let i = 0; i < 34; i++) rocks.push({ x: 18 + random() * 924, y: 18 + random() * 452, size: 4 + random() * 8 });

  function rect(x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
  function text(value, x, y, size, color, weight = '600', align = 'left') {
    ctx.fillStyle = color; ctx.font = `${weight} ${size}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`; ctx.textAlign = align; ctx.textBaseline = 'top'; ctx.fillText(value, x, y);
  }
  function drawBackground(time) {
    rect(0, 0, W, H, '#2da941');
    // Variaciones densas de césped para dar textura de videojuego pixel art.
    for (let i = 0; i < 1350; i++) {
      const x = (i * 197 + 31) % W;
      const y = (i * 113 + 17) % groundBottom;
      rect(x, y, 2 + (i % 4), 2 + (i % 2), i % 3 ? '#35b345' : '#27983b');
    }
    // Manchas luminosas y suaves sobre el césped.
    for (let i = 0; i < 18; i++) {
      const x = (i * 173 + 70) % W, y = (i * 97 + 38) % 450;
      ctx.fillStyle = 'rgba(116, 218, 74, .10)'; ctx.beginPath(); ctx.ellipse(x, y, 34, 17, -.3, 0, Math.PI * 2); ctx.fill();
    }
    // Borde oscuro de jardín y hierba en el límite inferior.
    rect(0, 0, W, 7, '#25472a'); rect(0, 0, 7, groundBottom, '#25472a'); rect(W - 7, 0, 7, groundBottom, '#25472a');
    for (let x = 0; x < W; x += 8) { rect(x, groundBottom - 5, 5, 5, x % 3 ? '#4a9d39' : '#78ad45'); rect(x + 2, groundBottom - 9, 2, 5, '#52943c'); }
    // Camino de tierra que entra al mapa desde la esquina inferior.
    rect(0, 472, 178, 18, '#b39b62'); rect(0, 472, 178, 4, '#d0b77d');
    rect(276, 484, 114, 6, '#b39b62'); rect(276, 484, 114, 3, '#d0b77d');

    for (const rock of rocks) {
      if ((rock.x > 610 && rock.y < 280) || (rock.x > 620 && rock.y > 340 && rock.y < 470)) continue;
      ctx.fillStyle = '#777f6a'; ctx.beginPath(); ctx.ellipse(rock.x, rock.y, rock.size, rock.size * .67, 0, 0, Math.PI * 2); ctx.fill();
      rect(rock.x - rock.size / 2, rock.y - rock.size / 2, rock.size, 2, '#a2a58a');
      rect(rock.x - 1, rock.y + 2, Math.max(2, rock.size / 2), 2, '#626c58');
    }
    for (const flower of flowers) {
      if ((flower.x > 615 && flower.x < 790 && flower.y > 200 && flower.y < 285) || (flower.x > 620 && flower.x < 790 && flower.y > 350 && flower.y < 450)) continue;
      const sway = Math.sin(time / 500 + flower.phase) * 1.2;
      rect(flower.x, flower.y + 2, 2, 8, '#34733a');
      ctx.fillStyle = flower.color;
      ctx.fillRect(flower.x - 4 + sway, flower.y - 2, 3, 3); ctx.fillRect(flower.x + 2 + sway, flower.y - 2, 3, 3);
      ctx.fillRect(flower.x - 1 + sway, flower.y - 5, 3, 3); ctx.fillRect(flower.x - 1 + sway, flower.y + 1, 3, 3);
      rect(flower.x + sway, flower.y - 1, 2, 2, '#f4e69a');
    }
  }
  function drawTree(time) {
    // Sombra y tronco con ramas retorcidas.
    ctx.fillStyle = 'rgba(20, 91, 39, .55)'; ctx.beginPath(); ctx.ellipse(210, 260, 100, 19, 0, 0, Math.PI * 2); ctx.fill();
    rect(187, 165, 42, 105, '#563321'); rect(195, 164, 25, 99, '#80502e'); rect(202, 177, 12, 88, '#a16b3a');
    rect(178, 216, 18, 12, '#70442a'); rect(164, 200, 21, 12, '#70442a'); rect(222, 207, 22, 12, '#70442a'); rect(231, 189, 14, 11, '#70442a');
    rect(184, 232, 10, 8, '#603a27'); rect(219, 225, 11, 8, '#603a27');
    // Copa orgánica por capas, con hojas que se mecen ligeramente.
    const sway = Math.sin(time / 1200) * 2;
    const blobs = [
      [210, 130, 104, 78, '#155d2d'], [172, 125, 70, 67, '#1b7134'], [247, 126, 70, 69, '#17652f'],
      [205, 91, 78, 70, '#267e38'], [160, 101, 57, 55, '#277f38'], [256, 98, 56, 57, '#247a35'],
      [180, 75, 44, 44, '#359641'], [222, 66, 52, 48, '#3da344'], [269, 92, 40, 42, '#32913d'],
      [143, 125, 39, 43, '#2b8539'], [285, 125, 35, 40, '#2a8137'], [190, 151, 53, 38, '#28813a'],
      [233, 151, 54, 35, '#247638']
    ];
    for (const [x, y, rx, ry, color] of blobs) { ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(x + sway * (y < 110 ? 1 : .35), y, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); }
    // Brillos por grupos pixelados.
    const highlights = [[150,91,19,14],[175,65,21,12],[200,55,18,11],[233,58,21,12],[267,78,18,12],[289,111,14,12],[158,133,18,12],[190,112,22,14],[226,98,22,13],[251,130,20,13],[183,154,16,10],[230,157,18,10]];
    for (const [x,y,w,h] of highlights) rect(x + sway, y, w, h, '#50ad45');
    for (const [x,y,w,h] of [[168,84,12,8],[213,69,14,7],[250,91,12,8],[146,116,11,8],[188,132,14,8],[275,132,11,8]]) rect(x + sway, y, w, h, '#65bd4c');
  }
  function drawComputer(time) {
    // Cable y sombra bajo la mesa.
    ctx.fillStyle = 'rgba(18, 78, 34, .55)'; ctx.beginPath(); ctx.ellipse(694, 306, 91, 13, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#303638'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(725, 231); ctx.bezierCurveTo(790, 231, 758, 257, 783, 250); ctx.stroke();
    // Mesa de madera.
    rect(620, 216, 154, 12, '#633b27'); rect(615, 226, 164, 14, '#9a6037'); rect(621, 239, 151, 5, '#bf8250');
    rect(625, 240, 10, 57, '#5b3827'); rect(758, 240, 10, 57, '#5b3827'); rect(628, 291, 30, 8, '#633b27'); rect(739, 271, 29, 8, '#633b27');
    rect(630, 248, 48, 36, '#75472d'); rect(682, 249, 57, 31, '#81502f');
    // Monitor CRT.
    rect(660, 116, 86, 101, '#282c2d'); rect(654, 124, 96, 83, '#55534d'); rect(660, 119, 84, 79, '#b9b9ae');
    rect(666, 126, 72, 62, '#343a40'); rect(670, 130, 64, 54, '#aeb4b6');
    rect(675, 135, 54, 44, '#758897'); rect(678, 138, 48, 38, '#929fa3');
    rect(714, 153, 6, 6, '#d33338'); rect(724, 153, 6, 6, '#2871da');
    rect(685, 188, 35, 5, '#333638'); rect(674, 207, 59, 9, '#6d706b'); rect(666, 214, 75, 7, '#c2c2b5');
    rect(659, 220, 88, 7, '#4b4d48');
    // Teclado, disquetes y ratón.
    rect(675, 230, 64, 16, '#cfc8ae'); rect(679, 233, 56, 9, '#e0dac4');
    for (let row = 0; row < 2; row++) for (let x = 681; x < 733; x += 7) rect(x, 234 + row * 4, 4, 2, '#77766d');
    rect(633, 228, 20, 24, '#d8d0b9'); rect(637, 232, 13, 13, '#343638'); rect(640, 235, 8, 6, '#a93e37'); rect(637, 246, 13, 2, '#eee3c5');
    ctx.fillStyle = '#d6ceb7'; ctx.beginPath(); ctx.ellipse(755, 237, 7, 10, -.25, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#f0e5c6'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(755, 230); ctx.lineTo(755, 237); ctx.stroke();
    rect(659, 224, 5, 3, '#62c361');
    // Parpadeo suave de pantalla.
    if (Math.sin(time / 1800) > .94) rect(676, 136, 51, 2, 'rgba(230,245,255,.55)');
  }
  function drawTV() {
    ctx.fillStyle = 'rgba(18, 78, 34, .5)'; ctx.beginPath(); ctx.ellipse(694, 472, 75, 11, 0, 0, Math.PI * 2); ctx.fill();
    rect(650, 400, 104, 11, '#704128'); rect(642, 410, 120, 13, '#a16a3d'); rect(650, 421, 105, 5, '#c18a53');
    rect(652, 423, 10, 46, '#603b28'); rect(743, 423, 10, 46, '#603b28'); rect(653, 463, 24, 6, '#603b28'); rect(731, 463, 24, 6, '#603b28');
    rect(657, 321, 78, 81, '#25292d'); rect(650, 329, 93, 72, '#3d4244'); rect(657, 324, 78, 68, '#151e25');
    rect(663, 332, 66, 53, '#367cbb'); rect(668, 337, 56, 43, '#4d9cdb');
    rect(669, 338, 14, 6, '#87cafa'); rect(664, 345, 4, 9, '#70b4e8'); rect(718, 389, 5, 3, '#54c77a');
    rect(664, 395, 63, 5, '#222629');
  }
  function drawSmile(time) {
    const bob = Math.sin(time / 290) * 5;
    const glow = .12 + (Math.sin(time / 400) + 1) * .08;
    ctx.fillStyle = 'rgba(255, 213, 59, .13)'; ctx.beginPath(); ctx.arc(270, 382 + bob, 65, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255, 215, 54, .12)'; ctx.beginPath(); ctx.arc(270, 382 + bob, 46, 0, Math.PI * 2); ctx.fill();
    // Pequeños destellos animados alrededor de la sonrisa.
    for (let i = 0; i < 10; i++) {
      const angle = i * Math.PI / 5 + time / 1800;
      const radius = 52 + Math.sin(time / 250 + i) * 5;
      const sx = 270 + Math.cos(angle) * radius, sy = 382 + bob + Math.sin(angle) * radius;
      rect(sx - 3, sy - 3, 6, 6, `rgba(255, 218, 66, ${glow + .16})`);
    }
    ctx.fillStyle = '#8b762c'; ctx.beginPath(); ctx.ellipse(270, 423, 24, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d8a933'; ctx.beginPath(); ctx.ellipse(270, 421, 18, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffc928'; ctx.beginPath(); ctx.arc(270, 382 + bob, 28, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#b87816'; ctx.lineWidth = 3; ctx.stroke();
    rect(261, 375 + bob, 4, 6, '#533614'); rect(275, 375 + bob, 4, 6, '#533614');
    ctx.strokeStyle = '#533614'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(270, 379 + bob, 13, .2, Math.PI - .2); ctx.stroke();
    return { x: 270, y: 382 + bob };
  }
  function drawPlayer(time) {
    const x = Math.round(player.x), step = moving ? Math.sin(time / 75) * 3 : 0, y = Math.round(player.y + (moving ? Math.abs(Math.sin(time / 75)) * -2 : 0));
    ctx.fillStyle = 'rgba(25, 75, 32, .65)'; ctx.beginPath(); ctx.ellipse(x, y + 15, 13, 5, 0, 0, Math.PI * 2); ctx.fill();
    // Animación sencilla de piernas y brazos al caminar.
    rect(x - 7, y + 10, 6, 8 + Math.max(0, step), '#344c9b'); rect(x + 1, y + 10, 6, 8 + Math.max(0, -step), '#344c9b');
    rect(x - 8 - Math.max(0, -step), y, 4, 9, '#e8b783'); rect(x + 5 + Math.max(0, step), y, 4, 9, '#e8b783');
    rect(x - 8, y - 14, 16, 15, '#493222'); rect(x - 6, y - 12, 12, 13, '#e8b783');
    rect(x - 8, y - 14, 16, 5, '#3b2920'); rect(x - 9, y - 9, 4, 5, '#3b2920');
    rect(x - 3, y - 7, 2, 2, '#30251f'); rect(x + 4, y - 7, 2, 2, '#30251f');
    rect(x - 9, y + 1, 18, 12, '#3283ca'); rect(x - 11, y + 2, 3, 7, '#e8b783'); rect(x + 8, y + 2, 3, 7, '#e8b783');
  }
  function drawObjectives() {
    // Pergamino tipo menú de aventura, con borde y remaches.
    rect(724, 16, 222, 145, '#604026'); rect(719, 12, 226, 145, '#9b6c3e');
    rect(724, 17, 216, 135, '#e5c99a'); rect(730, 22, 204, 125, '#f0dfb8');
    rect(739, 29, 186, 2, '#c3a878'); text('OBJETIVOS', 832, 31, 15, '#493521', '800', 'center');
    rect(739, 52, 186, 2, '#cdb78c');
    objectives.forEach((item, index) => {
      const y = 64 + index * 23;
      rect(744, y + 2, 12, 12, item.visited ? '#8d693c' : '#f6e8c7');
      ctx.strokeStyle = '#8d693c'; ctx.lineWidth = 1.5; ctx.strokeRect(744.5, y + 2.5, 11, 11);
      if (item.visited) { ctx.strokeStyle = '#fff0c8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(746, y + 8); ctx.lineTo(750, y + 12); ctx.lineTo(757, y + 3); ctx.stroke(); }
      text(item.name, 765, y, 16, '#493521', '600');
    });
    // Sello de cera decorativo.
    ctx.fillStyle = '#743326'; ctx.beginPath(); ctx.arc(921, 139, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#a64b37'; ctx.beginPath(); ctx.arc(921, 139, 10, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#6f2e26'; ctx.lineWidth = 2; ctx.stroke();
    for (const [x,y] of [[725,18],[937,20],[724,148],[938,148]]) { rect(x,y,5,5,'#79502f'); rect(x+1,y+1,2,2,'#d0aa72'); }
  }
  function wrapText(value, maxWidth) {
    const words = value.split(' '), lines = []; let line = '';
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (ctx.measureText(candidate).width > maxWidth && line) { lines.push(line); line = word; } else line = candidate;
    }
    if (line) lines.push(line);
    return lines;
  }
  function drawDialog(time) {
    rect(0, groundBottom, W, H - groundBottom, '#142719'); rect(0, groundBottom, W, 3, '#d0c49c');
    rect(14, groundBottom + 10, W - 28, H - groundBottom - 20, '#102c19');
    ctx.fillStyle = 'rgba(5, 19, 10, .45)'; ctx.fillRect(20, groundBottom + 16, W - 40, H - groundBottom - 32);
    ctx.strokeStyle = '#bca36f'; ctx.lineWidth = 2; ctx.strokeRect(14, groundBottom + 11, W - 28, H - groundBottom - 22);
    const currentMessage = time < messageUntil ? message : 'Explora el mapa. Acércate a los objetos y pulsa E.';
    ctx.font = '700 17px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
    const lines = wrapText(currentMessage, W - 62);
    lines.slice(0, 2).forEach((line, index) => text(line, 30, 522 + index * 22, 17, '#fff3d4', '700'));
    text('Mover: WASD  |  Interactuar: E', 30, 568, 15, '#d9e1d2', '600');
    text(`Recuerdos encontrados: ${found}/4`, 30, 599, 15, '#fff3d4', '700');
  }
  function draw(time) {
    drawBackground(time); drawTree(time); drawComputer(time); drawTV();
    const smile = drawSmile(time);
    for (const item of objectives) {
      if (item.visited) continue;
      const p = item.kind === 'smile' ? smile : item;
      const pulse = 3 + Math.sin(time / 220) * 3;
      ctx.strokeStyle = 'rgba(255, 231, 112, .35)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(p.x, p.y, 31 + pulse, 0, Math.PI * 2); ctx.stroke();
    }
    drawPlayer(time); drawObjectives(); drawDialog(time);
  }
  function interact() {
    let nearest = null, nearestDistance = Infinity;
    for (const item of objectives) {
      const d = Math.hypot(player.x - item.x, player.y - item.y);
      if (d < nearestDistance) { nearest = item; nearestDistance = d; }
    }
    if (nearest && nearestDistance < 62) {
      if (!nearest.visited) { nearest.visited = true; found++; message = `¡Encontraste el recuerdo: ${nearest.name}! ${nearest.memory}`; }
      else message = `Ya descubriste el recuerdo de ${nearest.name}.`;
    } else message = 'No hay nada cerca. Acércate a un objeto para interactuar.';
    messageUntil = performance.now() + 4200;
  }
  function frame(time) {
    let dx = 0, dy = 0;
    if (keys.has('a') || keys.has('A') || keys.has('ArrowLeft')) dx--;
    if (keys.has('d') || keys.has('D') || keys.has('ArrowRight')) dx++;
    if (keys.has('w') || keys.has('W') || keys.has('ArrowUp')) dy--;
    if (keys.has('s') || keys.has('S') || keys.has('ArrowDown')) dy++;
    if (dx && dy) { dx *= Math.SQRT1_2; dy *= Math.SQRT1_2; }
    moving = Boolean(dx || dy);
    player.x = Math.max(20, Math.min(940, player.x + dx * player.speed));
    player.y = Math.max(32, Math.min(477, player.y + dy * player.speed));
    draw(time);
    requestAnimationFrame(frame);
  }

  window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) event.preventDefault();
    keys.add(event.key);
    if (event.key.toLowerCase() === 'e' && !event.repeat) interact();
  });
  window.addEventListener('keyup', (event) => keys.delete(event.key));
  window.addEventListener('blur', () => keys.clear());
  document.getElementById('interact').addEventListener('click', interact);
  document.querySelectorAll('[data-key]').forEach((button) => {
    const key = button.dataset.key;
    button.addEventListener('pointerdown', (event) => { event.preventDefault(); keys.add(key); button.setPointerCapture(event.pointerId); });
    const release = () => keys.delete(key);
    button.addEventListener('pointerup', release); button.addEventListener('pointercancel', release); button.addEventListener('lostpointercapture', release);
  });
  requestAnimationFrame(frame);
})();
