// One-shot canvas confetti burst, fired when a student completes a full workout loop.
export function launchConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const COLORS = ["#F5C400", "#2352c8", "#00c853", "#fff", "#f44336", "#1B3487"];
  const particles = Array.from({ length: 140 }, () => ({
    x: Math.random() * canvas.width,
    y: canvas.height * (Math.random() * 0.4),
    vx: (Math.random() - 0.5) * 7,
    vy: -(Math.random() * 6 + 3),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    w: Math.random() * 10 + 5,
    h: Math.random() * 5 + 3,
    rot: Math.random() * 360,
    rotV: (Math.random() - 0.5) * 10,
  }));
  let raf;
  const tick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.18;
      p.rot += p.rotV;
      if (p.y < canvas.height + 20) alive = true;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (alive) raf = requestAnimationFrame(tick);
    else canvas.remove();
  };
  raf = requestAnimationFrame(tick);
  setTimeout(() => { cancelAnimationFrame(raf); canvas.remove(); }, 5000);
}
