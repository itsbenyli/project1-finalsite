function getTrail() {
  var t = localStorage.getItem("trail");
  return t ? JSON.parse(t) : [];
}

function saveTrail(arr) {
  localStorage.setItem("trail", JSON.stringify(arr));
}

function getClickCount() {
  var c = localStorage.getItem("clickCount");
  return c ? JSON.parse(c) : {};
}

function saveClickCount(obj) {
  localStorage.setItem("clickCount", JSON.stringify(obj));
}

function clearAll() {
  localStorage.removeItem("trail");
  localStorage.removeItem("clickCount");
  window.location.reload();
}

function goStone(el) {
  var id = el.getAttribute("data-stone");
  var url = el.getAttribute("href");
  var arr = getTrail();
  arr.push(id);
  if (arr.length > 8) arr = arr.slice(-8);
  saveTrail(arr);
  var count = getClickCount();
  count[id] = (count[id] || 0) + 1;
  saveClickCount(count);
  window.location.href = url;
  return false;
}

function drawTrail(svgId, scopeId) {
  var arr = getTrail();
  var svg = document.getElementById(svgId);
  var scope = document.getElementById(scopeId);
  if (!svg || !scope || arr.length < 2) return;
  svg.innerHTML = "";
  var svgBox = svg.getBoundingClientRect();
  var pts = [];
  arr.forEach(function(id) {
    var el = scope.querySelector('[data-stone="' + id + '"]');
    if (el) {
      var r = el.getBoundingClientRect();
      pts.push({
        x: (r.left + r.width / 2) - svgBox.left,
        y: (r.top + r.height / 2) - svgBox.top
      });
    }
  });
  for (var i = 0; i < pts.length - 1; i++) {
    var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", pts[i].x);
    line.setAttribute("y1", pts[i].y);
    line.setAttribute("x2", pts[i + 1].x);
    line.setAttribute("y2", pts[i + 1].y);
    line.setAttribute("stroke", "rgba(255,255,255,0.8)");
    line.setAttribute("stroke-width", svgId === "miniLines" ? "3" : "6");
    line.setAttribute("stroke-linecap", "round");
    svg.appendChild(line);
  }
}

// ---------- 4. 黑圆交互 & Chinatown 精准探测 (左上角触发版) ----------
const circle = document.getElementById('dragCircle');
const circleContent = circle ? circle.querySelector('.circle-content p') : null;
const originalText = circleContent ? circleContent.innerText : "";

const chinaText = document.querySelector('a[href="chinatown-stone.html"]'); 
const chinaStone = document.querySelector('.rock[data-stone="chinatown"]'); 

if (circle) {
  let isDragging = false;
  let startX, startY, initialX, initialY;

  const handleStart = (e) => {
    isDragging = true;
    circle.classList.add('expanded');
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    startX = clientX;
    startY = clientY;
    initialX = circle.offsetLeft;
    initialY = circle.offsetTop;
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);
  };

  const handleMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    const dx = clientX - startX;
    const dy = clientY - startY;
    
    circle.style.left = (initialX + dx) + 'px';
    circle.style.top = (initialY + dy) + 'px';
    
    checkCollision();
  };

  const checkCollision = () => {
    const r1 = circle.getBoundingClientRect();
    
    const checkX = r1.left;
    const checkY = r1.top;

    const r2 = chinaText ? chinaText.getBoundingClientRect() : null;
    const r3 = chinaStone ? chinaStone.getBoundingClientRect() : null;

    // 判断左上角坐标是否在目标矩形内
    const hitText = r2 && (checkX >= r2.left && checkX <= r2.right && checkY >= r2.top && checkY <= r2.bottom);
    const hitStone = r3 && (checkX >= r3.left && checkX <= r3.right && checkY >= r3.top && checkY <= r3.bottom);

    if (hitText || hitStone) {
      circle.classList.add('rainbow-mode');
      if (circleContent) circleContent.innerText = "HAPPY CHINESE NEW YEAR";
    } else {
      circle.classList.remove('rainbow-mode');
      if (circleContent) circleContent.innerText = originalText;
    }
  };

  const handleEnd = () => {
    isDragging = false;
    circle.classList.remove('expanded');
    circle.classList.remove('rainbow-mode');
    if (circleContent) circleContent.innerText = originalText;
    document.removeEventListener('mousemove', handleMove);
    document.removeEventListener('touchmove', handleMove);
    document.removeEventListener('mouseup', handleEnd);
    document.removeEventListener('touchend', handleEnd);
  };

  circle.addEventListener('mousedown', handleStart);
  circle.addEventListener('touchstart', handleStart, { passive: false });
}

function init() {
  setTimeout(function() {
    drawTrail("trailLines", "mainTrail");
    drawTrail("miniLines", "miniInner");
    var current = document.body.getAttribute("data-current");
    if (current) {
      var activeMini = document.querySelector('.miniStone[data-stone="' + current + '"]');
      if (activeMini) activeMini.classList.add("active");
    }
  }, 100);
}
window.onload = init;
window.onresize = init;