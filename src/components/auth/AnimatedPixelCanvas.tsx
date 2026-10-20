import React, { useEffect, useRef } from 'react';

interface PixelCell {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  alpha: number;
  targetAlpha: number;
  color: string;
  speed: number;
  phase: number;
  driftX: number;
  driftY: number;
}

export const AnimatedPixelCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 700);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 900);

    const pixelGrid = 20;

    // Palette of green, lime, cyan, and blue
    const colorPalette = [
      '#10b981', // Emerald green
      '#059669', // Deep green
      '#34d399', // Bright mint green
      '#84cc16', // Vibrant lime
      '#a3e635', // Light lime
      '#65a30d', // Deep lime
      '#06b6d4', // Cyan
      '#22d3ee', // Electric cyan
      '#3b82f6', // Vivid blue
      '#60a5fa', // Sky blue
    ];

    // Generate clusters of abstract pixels reminiscent of Indus
    const pixels: PixelCell[] = [];
    const numPixels = Math.floor((width * height) / 3800);

    for (let i = 0; i < numPixels; i++) {
      const col = Math.floor(Math.random() * (width / pixelGrid));
      const row = Math.floor(Math.random() * (height / pixelGrid));
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      const baseAlpha = 0.15 + Math.random() * 0.7;

      pixels.push({
        x: col * pixelGrid,
        y: row * pixelGrid,
        size: pixelGrid - 3,
        baseAlpha,
        alpha: Math.random() * baseAlpha,
        targetAlpha: baseAlpha,
        color,
        speed: 0.008 + Math.random() * 0.018,
        phase: Math.random() * Math.PI * 2,
        driftX: (Math.random() - 0.5) * 0.15,
        driftY: -0.1 - Math.random() * 0.2, // Gentle upward drift
      });
    }

    let time = 0;

    const render = () => {
      time += 0.015;

      // Dark forest-green and black gradient background
      const bgGradient = ctx.createLinearGradient(0, 0, width, height);
      bgGradient.addColorStop(0, '#020d06'); // Deep dark forest-black
      bgGradient.addColorStop(0.4, '#04160d'); // Dark forest green
      bgGradient.addColorStop(0.8, '#030f08'); // Night green
      bgGradient.addColorStop(1, '#010503'); // Pure abyss black
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Subtle atmospheric radial forest glow in the center-left
      const radialGlow = ctx.createRadialGradient(
        width * 0.35,
        height * 0.45,
        20,
        width * 0.35,
        height * 0.45,
        Math.max(width, height) * 0.7
      );
      radialGlow.addColorStop(0, 'rgba(16, 185, 129, 0.14)');
      radialGlow.addColorStop(0.5, 'rgba(6, 182, 212, 0.06)');
      radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      // Subtle background grid lines
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.035)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += pixelGrid) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += pixelGrid) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Render pixels
      for (let i = 0; i < pixels.length; i++) {
        const p = pixels[i];

        if (!prefersReducedMotion) {
          // Floating and breathing animation
          p.alpha += (p.targetAlpha - p.alpha) * p.speed;
          if (Math.abs(p.targetAlpha - p.alpha) < 0.02) {
            p.targetAlpha = Math.random() > 0.4 ? p.baseAlpha : 0.05;
          }

          p.y += p.driftY;
          p.x += p.driftX;

          // Wrap around edges gracefully
          if (p.y < -p.size) p.y = height + p.size;
          if (p.x < -p.size) p.x = width + p.size;
          if (p.x > width + p.size) p.x = -p.size;
        }

        const wave = Math.sin(time + p.phase + (p.x / 150));
        const effectiveAlpha = Math.max(0.04, Math.min(1, p.alpha * (0.8 + 0.3 * wave)));

        ctx.save();
        ctx.globalAlpha = effectiveAlpha;
        ctx.fillStyle = p.color;

        // Draw crisp pixel block with rounded corners
        const r = 2; // subtle corner radius for modern pixel art
        const px = Math.round(p.x);
        const py = Math.round(p.y);
        const sz = p.size;

        ctx.beginPath();
        ctx.roundRect(px, py, sz, sz, r);
        ctx.fill();

        // Extra glow on prominent lime and cyan pixels
        if (effectiveAlpha > 0.55 && (p.color === '#84cc16' || p.color === '#22d3ee' || p.color === '#10b981')) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.fill();
        }

        ctx.restore();
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
      if (prefersReducedMotion) render();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block"
      aria-hidden="true"
    />
  );
};
