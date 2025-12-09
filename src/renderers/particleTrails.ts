import { getCanvasDimensions } from '../utils/getCanvasDimensions';

// Particle trails
const particleTrails: { x: number; y: number; vx: number; vy: number; life: number; history: { x: number; y: number }[] }[] = [];

export function drawParticleTrails(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  data: ArrayLike<number>,
  backgroundColor: string,
  barColor: string | ((value: number) => string),
  mirror: boolean
): void {
  const { width, height } = getCanvasDimensions(canvas);
  const centerY = height / 2;

  if (backgroundColor === 'transparent') {
    context.clearRect(0, 0, width, height);
  } else {
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
  }

  const particleCount = Math.min(data.length, 50);
  const step = Math.floor(data.length / particleCount);
  const xStep = width / particleCount;

  // Initialize particles
  if (particleTrails.length !== particleCount) {
    particleTrails.length = 0;
    for (let i = 0; i < particleCount; i++) {
      particleTrails.push({
        x: i * xStep,
        y: centerY,
        vx: 0,
        vy: 0,
        life: 1,
        history: []
      });
    }
  }

  for (let i = 0; i < particleCount; i++) {
    const dataIndex = i * step;
    const value = data[dataIndex];
    const normalizedValue = value / 255;
    
    const particle = particleTrails[i];
    const targetY = centerY - (normalizedValue - 0.5) * height * 0.8;
    
    particle.vy += (targetY - particle.y) * 0.1;
    particle.vy *= 0.9; // Damping
    particle.y += particle.vy;
    
    // Add to history
    particle.history.push({ x: particle.x, y: particle.y });
    if (particle.history.length > 20) {
      particle.history.shift();
    }

    const color = typeof barColor === 'function' ? barColor(normalizedValue) : barColor;
    
    // Draw trail
    if (particle.history.length > 1) {
      context.lineWidth = 2;
      context.beginPath();
      for (let j = 0; j < particle.history.length; j++) {
        const point = particle.history[j];
        const alpha = j / particle.history.length;
        let rgba = color;
        if (color.startsWith('#')) {
          const r = parseInt(color.slice(1, 3), 16);
          const g = parseInt(color.slice(3, 5), 16);
          const b = parseInt(color.slice(5, 7), 16);
          rgba = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } else if (color.startsWith('rgb')) {
          rgba = color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
        }
        context.strokeStyle = rgba;
        if (j === 0) {
          context.moveTo(point.x, point.y);
        } else {
          context.lineTo(point.x, point.y);
        }
      }
      context.stroke();
    }

    // Draw particle
    context.fillStyle = color;
    context.beginPath();
    context.arc(particle.x, particle.y, 4, 0, Math.PI * 2);
    context.fill();
  }
}

