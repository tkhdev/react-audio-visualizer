// Nebula visualization - flowing organic patterns with particles and gradients
import { getCanvasDimensions } from '../utils/getCanvasDimensions';

// Store previous frame data for smooth transitions
let previousData: Float32Array | null = null;
let particleSystem: Array<{
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}> = [];

export function drawNebula(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  data: ArrayLike<number>,
  backgroundColor: string,
  barColor: string | ((value: number) => string),
  mirror: boolean
): void {
  const { width, height } = getCanvasDimensions(canvas);
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.min(width, height) / 2;

  // Clear canvas with fade effect for trails
  if (backgroundColor === 'transparent') {
    context.fillStyle = 'rgba(0, 0, 0, 0.1)';
  } else {
    // Parse background color and add fade
    let r = 0, g = 0, b = 0;
    if (backgroundColor.startsWith('#')) {
      r = parseInt(backgroundColor.slice(1, 3), 16);
      g = parseInt(backgroundColor.slice(3, 5), 16);
      b = parseInt(backgroundColor.slice(5, 7), 16);
    }
    context.fillStyle = `rgba(${r}, ${g}, ${b}, 0.15)`;
  }
  context.fillRect(0, 0, width, height);

  // Convert data to Float32Array for smooth processing
  const currentData = new Float32Array(data.length);
  for (let i = 0; i < data.length; i++) {
    currentData[i] = data[i] / 255;
  }

  // Smooth data transition
  if (previousData && previousData.length === currentData.length) {
    for (let i = 0; i < currentData.length; i++) {
      currentData[i] = previousData[i] * 0.3 + currentData[i] * 0.7;
    }
  }
  previousData = new Float32Array(currentData);

  // Calculate overall energy
  let totalEnergy = 0;
  for (let i = 0; i < currentData.length; i++) {
    totalEnergy += currentData[i];
  }
  const avgEnergy = totalEnergy / currentData.length;

  // Update or create particles
  const particleCount = Math.min(150, Math.floor(avgEnergy * 200 + 50));
  
  // Remove dead particles
  particleSystem = particleSystem.filter(p => p.life > 0);
  
  // Add new particles based on energy
  while (particleSystem.length < particleCount) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * maxRadius * 0.3;
    particleSystem.push({
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      life: 1,
      maxLife: 0.5 + Math.random() * 0.5,
      size: 2 + Math.random() * 4,
    });
  }

  // Update and draw particles
  const layers = 3;
  for (let layer = 0; layer < layers; layer++) {
    const layerOffset = layer * (currentData.length / layers);
    
    for (let i = 0; i < particleSystem.length; i++) {
      const particle = particleSystem[i];
      
      // Get frequency data for this particle's position
      const angle = Math.atan2(particle.y - centerY, particle.x - centerX);
      const normalizedAngle = (angle + Math.PI) / (Math.PI * 2);
      const dataIndex = Math.floor(normalizedAngle * currentData.length + layerOffset) % currentData.length;
      const frequencyValue = currentData[dataIndex];
      
      // Update particle velocity based on frequency
      const forceAngle = angle + (frequencyValue - 0.5) * Math.PI * 0.5;
      const force = frequencyValue * 0.5;
      particle.vx += Math.cos(forceAngle) * force * 0.1;
      particle.vy += Math.sin(forceAngle) * force * 0.1;
      
      // Apply damping
      particle.vx *= 0.95;
      particle.vy *= 0.95;
      
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Boundary wrapping
      if (particle.x < 0) particle.x = width;
      if (particle.x > width) particle.x = 0;
      if (particle.y < 0) particle.y = height;
      if (particle.y > height) particle.y = 0;
      
      // Update life
      particle.life -= 0.01;
      
      // Draw particle with gradient
      const alpha = (particle.life / particle.maxLife) * frequencyValue * 0.8;
      const color = typeof barColor === 'function' 
        ? barColor(frequencyValue) 
        : barColor;
      
      // Parse color
      let r = 0, g = 255, b = 204;
      if (color.startsWith('#')) {
        r = parseInt(color.slice(1, 3), 16);
        g = parseInt(color.slice(3, 5), 16);
        b = parseInt(color.slice(5, 7), 16);
      }
      
      // Draw particle with glow
      const gradient = context.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size * (1 + frequencyValue * 2)
      );
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
      gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha * 0.5})`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(
        particle.x, 
        particle.y, 
        particle.size * (1 + frequencyValue * 2), 
        0, 
        Math.PI * 2
      );
      context.fill();
      
      // Draw core
      context.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 1.5})`;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.size * 0.3, 0, Math.PI * 2);
      context.fill();
    }
  }

  // Draw flowing bands
  const bandCount = 5;
  for (let band = 0; band < bandCount; band++) {
    const bandStart = Math.floor((band / bandCount) * currentData.length);
    const bandEnd = Math.floor(((band + 1) / bandCount) * currentData.length);
    
    let bandEnergy = 0;
    for (let i = bandStart; i < bandEnd; i++) {
      bandEnergy += currentData[i];
    }
    bandEnergy /= (bandEnd - bandStart);
    
    const radius = maxRadius * (0.3 + bandEnergy * 0.7);
    const segments = 64;
    
    context.beginPath();
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const dataIndex = Math.floor((i / segments) * currentData.length);
      const value = currentData[dataIndex];
      const r = radius * (0.8 + value * 0.4);
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      
      if (i === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }
    context.closePath();
    
    const color = typeof barColor === 'function' 
      ? barColor(bandEnergy) 
      : barColor;
    
    let r = 0, g = 255, b = 204;
    if (color.startsWith('#')) {
      r = parseInt(color.slice(1, 3), 16);
      g = parseInt(color.slice(3, 5), 16);
      b = parseInt(color.slice(5, 7), 16);
    }
    
    // Draw with gradient fill
    const gradient = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${bandEnergy * 0.3})`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    
    context.fillStyle = gradient;
    context.fill();
    
    // Draw outline
    context.strokeStyle = `rgba(${r}, ${g}, ${b}, ${bandEnergy * 0.6})`;
    context.lineWidth = 1;
    context.stroke();
  }

  // Mirror mode
  if (mirror) {
    context.save();
    context.scale(1, -1);
    context.translate(0, -height);
    
    // Redraw particles mirrored
    for (const particle of particleSystem) {
      const angle = Math.atan2(particle.y - centerY, particle.x - centerX);
      const normalizedAngle = (angle + Math.PI) / (Math.PI * 2);
      const dataIndex = Math.floor(normalizedAngle * currentData.length) % currentData.length;
      const frequencyValue = currentData[dataIndex];
      const alpha = frequencyValue * 0.8;
      const color = typeof barColor === 'function' 
        ? barColor(frequencyValue) 
        : barColor;
      
      let r = 0, g = 255, b = 204;
      if (color.startsWith('#')) {
        r = parseInt(color.slice(1, 3), 16);
        g = parseInt(color.slice(3, 5), 16);
        b = parseInt(color.slice(5, 7), 16);
      }
      
      const gradient = context.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size * (1 + frequencyValue * 2)
      );
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 0.5})`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.size * (1 + frequencyValue * 2), 0, Math.PI * 2);
      context.fill();
    }
    
    context.restore();
  }
}

