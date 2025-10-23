'use client';

import React, { useEffect, useRef } from 'react';

interface GridDistortionBackgroundProps {
  className?: string;
}

export const GridDistortionBackground: React.FC<GridDistortionBackgroundProps> = ({ 
  className = '' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const gridSize = 20;
      const cols = Math.ceil(canvas.width / gridSize);
      const rows = Math.ceil(canvas.height / gridSize);

      // Create gradient for the grid
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#F7F1E9');
      gradient.addColorStop(0.3, '#EBDBC7');
      gradient.addColorStop(0.7, '#EBDBC7');
      gradient.addColorStop(1, '#F7F1E9');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw distorted grid
      ctx.strokeStyle = '#01bcc6';
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = 0.3;

      for (let i = 0; i <= cols; i++) {
        ctx.beginPath();
        for (let j = 0; j <= rows; j++) {
          const x = i * gridSize;
          const y = j * gridSize;
          
          // Create distortion effect
          const distortionX = Math.sin(time * 0.001 + x * 0.01) * 10;
          const distortionY = Math.cos(time * 0.001 + y * 0.01) * 8;
          
          const distortedX = x + distortionX;
          const distortedY = y + distortionY;

          if (j === 0) {
            ctx.moveTo(distortedX, distortedY);
          } else {
            ctx.lineTo(distortedX, distortedY);
          }
        }
        ctx.stroke();
      }

      // Draw vertical lines
      for (let i = 0; i <= cols; i++) {
        ctx.beginPath();
        for (let j = 0; j <= rows; j++) {
          const x = i * gridSize;
          const y = j * gridSize;
          
          const distortionX = Math.sin(time * 0.001 + x * 0.01) * 10;
          const distortionY = Math.cos(time * 0.001 + y * 0.01) * 8;
          
          const distortedX = x + distortionX;
          const distortedY = y + distortionY;

          if (i === 0) {
            ctx.moveTo(distortedX, distortedY);
          } else {
            ctx.lineTo(distortedX, distortedY);
          }
        }
        ctx.stroke();
      }

      // Add floating orbs
      ctx.globalAlpha = 0.6;
      for (let i = 0; i < 8; i++) {
        const orbX = (canvas.width / 8) * i + Math.sin(time * 0.002 + i) * 50;
        const orbY = canvas.height / 2 + Math.cos(time * 0.001 + i) * 100;
        const orbSize = 20 + Math.sin(time * 0.003 + i) * 10;

        const orbGradient = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, orbSize);
        orbGradient.addColorStop(0, '#01bcc6');
        orbGradient.addColorStop(0.5, '#008eab');
        orbGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = orbGradient;
        ctx.beginPath();
        ctx.arc(orbX, orbY, orbSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Add subtle wave patterns
      ctx.globalAlpha = 0.2;
      ctx.strokeStyle = '#008eab';
      ctx.lineWidth = 2;

      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 2) {
          const y = canvas.height / 3 * (i + 1) + 
                   Math.sin(time * 0.001 + x * 0.005) * 30 +
                   Math.cos(time * 0.0008 + x * 0.003) * 20;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      time += 16; // 60fps
    };

    const animate = () => {
      drawGrid();
      animationId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 ${className}`}
      style={{ background: 'linear-gradient(135deg, #F7F1E9 0%, #EBDBC7 100%)' }}
    />
  );
};

export default GridDistortionBackground;
