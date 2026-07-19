export const triggerConfetti = () => {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = (canvas.width = window.innerWidth);
  const height = (canvas.height = window.innerHeight);

  const colors = ['#0ea5e9', '#10b981', '#f97316', '#8b5cf6', '#ec4899', '#f43f5e'];
  const particles: Array<{
    x: number;
    y: number;
    size: number;
    color: string;
    speedX: number;
    speedY: number;
    rotation: number;
    rotationSpeed: number;
    opacity: number;
  }> = [];

  // Generate particles from bottom center and sides
  for (let i = 0; i < 120; i++) {
    particles.push({
      x: width / 2 + (Math.random() * 60 - 30),
      y: height + 20,
      size: Math.random() * 8 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedX: Math.random() * 12 - 6,
      speedY: -(Math.random() * 16 + 10),
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 6 - 3,
      opacity: 1,
    });
  }

  // Left and right bursts too
  for (let i = 0; i < 30; i++) {
    particles.push({
      x: -10,
      y: height * 0.7,
      size: Math.random() * 8 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedX: Math.random() * 8 + 8,
      speedY: -(Math.random() * 12 + 6),
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 6 - 3,
      opacity: 1,
    });
    particles.push({
      x: width + 10,
      y: height * 0.7,
      size: Math.random() * 8 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedX: -(Math.random() * 8 + 8),
      speedY: -(Math.random() * 12 + 6),
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 6 - 3,
      opacity: 1,
    });
  }

  const animate = () => {
    ctx.clearRect(0, 0, width, height);
    let alive = false;

    particles.forEach((p) => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.speedY += 0.35; // Gravity
      p.speedX *= 0.98; // Friction
      p.rotation += p.rotationSpeed;
      
      if (p.speedY > 0) {
        p.opacity -= 0.015;
      }

      if (p.opacity > 0 && p.y < height && p.x > -50 && p.x < width + 50) {
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    });

    if (alive) {
      requestAnimationFrame(animate);
    } else {
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    }
  };

  animate();
};
