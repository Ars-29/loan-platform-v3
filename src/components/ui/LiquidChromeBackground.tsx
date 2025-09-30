'use client';

import React, { useEffect, useRef } from 'react';

interface LiquidChromeBackgroundProps {
  className?: string;
}

export const LiquidChromeBackground: React.FC<LiquidChromeBackgroundProps> = ({ 
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

    const drawLiquidChrome = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Base gradient background using brand colors
      const baseGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      baseGradient.addColorStop(0, '#005b7c');
      baseGradient.addColorStop(0.3, '#008eab');
      baseGradient.addColorStop(0.7, '#01bcc6');
      baseGradient.addColorStop(1, '#005b7c');

      ctx.fillStyle = baseGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Create multiple liquid chrome layers - slower and more sophisticated
      const layers = [
        { color: '#01bcc6', opacity: 0.08, speed: 0.0003, scale: 0.005 },
        { color: '#008eab', opacity: 0.06, speed: 0.0002, scale: 0.004 },
        { color: '#005b7c', opacity: 0.04, speed: 0.0001, scale: 0.003 }
      ];

      layers.forEach((layer, layerIndex) => {
        ctx.globalAlpha = layer.opacity;
        
        // Create flowing liquid shapes
        for (let i = 0; i < 5; i++) {
          const centerX = (canvas.width / 5) * i + Math.sin(time * layer.speed + i) * 100;
          const centerY = canvas.height / 2 + Math.cos(time * layer.speed * 0.7 + i) * 150;
          
          const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, 200 + Math.sin(time * layer.speed + i) * 100
          );
          
          gradient.addColorStop(0, layer.color);
          gradient.addColorStop(0.7, layer.color + '80');
          gradient.addColorStop(1, 'transparent');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          
          // Create organic blob shape
          const points = 20;
          for (let j = 0; j < points; j++) {
            const angle = (j / points) * Math.PI * 2;
            const radius = 80 + Math.sin(time * layer.speed + angle * 3) * 30;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            if (j === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.closePath();
          ctx.fill();
        }
      });

      // Add flowing lines - more subtle
      ctx.globalAlpha = 0.15;
      ctx.strokeStyle = '#01bcc6';
      ctx.lineWidth = 1;

      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 3) {
          const y = (canvas.height / 8) * i + 
                   Math.sin(time * 0.001 + x * 0.005 + i) * 40 +
                   Math.cos(time * 0.0008 + x * 0.003 + i) * 20;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Add floating particles - fewer and more subtle
      ctx.globalAlpha = 0.3;
      for (let i = 0; i < 8; i++) {
        const particleX = (canvas.width / 8) * i + Math.sin(time * 0.0005 + i) * 50;
        const particleY = canvas.height / 2 + Math.cos(time * 0.0003 + i) * 150;
        const particleSize = 2 + Math.sin(time * 0.0008 + i) * 1;

        // Alternate particle colors
        const colors = ['#01bcc6', '#008eab', '#005b7c'];
        ctx.fillStyle = colors[i % 3];
        ctx.beginPath();
        ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Add mesh distortion effect - more subtle
      ctx.globalAlpha = 0.05;
      ctx.strokeStyle = '#008eab';
      ctx.lineWidth = 0.3;

      const gridSize = 30;
      const cols = Math.ceil(canvas.width / gridSize);
      const rows = Math.ceil(canvas.height / gridSize);

      for (let i = 0; i <= cols; i++) {
        ctx.beginPath();
        for (let j = 0; j <= rows; j++) {
          const x = i * gridSize;
          const y = j * gridSize;
          
          const distortionX = Math.sin(time * 0.0005 + x * 0.01) * 15;
          const distortionY = Math.cos(time * 0.0005 + y * 0.01) * 12;
          
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

      time += 16;
    };

    const animate = () => {
      drawLiquidChrome();
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
      className={`fixed inset-0 w-full h-full ${className}`}
      style={{ 
        background: 'linear-gradient(135deg, #005b7c 0%, #008eab 50%, #01bcc6 100%)',
        zIndex: 1
      }}
    />
  );
};

export default LiquidChromeBackground;
