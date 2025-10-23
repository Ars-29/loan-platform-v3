'use client';

import React, { useEffect, useRef } from 'react';

interface PrismaticBurstBackgroundProps {
  className?: string;
}

export const PrismaticBurstBackground: React.FC<PrismaticBurstBackgroundProps> = ({ 
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

    const drawPrismaticBurst = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Base gradient background
      const baseGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height)
      );
      baseGradient.addColorStop(0, '#F7F1E9');
      baseGradient.addColorStop(0.5, '#EBDBC7');
      baseGradient.addColorStop(1, '#F7F1E9');

      ctx.fillStyle = baseGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Create prismatic burst effect
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const burstRadius = Math.min(canvas.width, canvas.height) * 0.8;

      // Multiple burst layers with different colors
      const burstLayers = [
        { color: '#01bcc6', opacity: 0.2, speed: 0.001, radius: burstRadius },
        { color: '#008eab', opacity: 0.15, speed: 0.0008, radius: burstRadius * 0.8 },
        { color: '#005b7c', opacity: 0.1, speed: 0.0006, radius: burstRadius * 0.6 }
      ];

      burstLayers.forEach((layer, layerIndex) => {
        ctx.globalAlpha = layer.opacity;
        
        // Create burst rays
        const rays = 24;
        for (let i = 0; i < rays; i++) {
          const angle = (i / rays) * Math.PI * 2 + time * layer.speed;
          const startRadius = 50 + Math.sin(time * layer.speed + i) * 20;
          const endRadius = layer.radius + Math.cos(time * layer.speed + i) * 100;
          
          const startX = centerX + Math.cos(angle) * startRadius;
          const startY = centerY + Math.sin(angle) * startRadius;
          const endX = centerX + Math.cos(angle) * endRadius;
          const endY = centerY + Math.sin(angle) * endRadius;

          // Create gradient for each ray
          const rayGradient = ctx.createLinearGradient(startX, startY, endX, endY);
          rayGradient.addColorStop(0, layer.color);
          rayGradient.addColorStop(0.5, layer.color + '80');
          rayGradient.addColorStop(1, 'transparent');

          ctx.strokeStyle = rayGradient;
          ctx.lineWidth = 2 + Math.sin(time * layer.speed + i) * 1;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }

        // Add rotating orbs around the burst
        const orbCount = 8;
        for (let i = 0; i < orbCount; i++) {
          const orbAngle = (i / orbCount) * Math.PI * 2 + time * layer.speed * 2;
          const orbRadius = layer.radius * 0.3 + Math.sin(time * layer.speed + i) * 30;
          const orbX = centerX + Math.cos(orbAngle) * orbRadius;
          const orbY = centerY + Math.sin(orbAngle) * orbRadius;
          const orbSize = 15 + Math.sin(time * layer.speed + i) * 5;

          const orbGradient = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, orbSize);
          orbGradient.addColorStop(0, layer.color);
          orbGradient.addColorStop(0.7, layer.color + '80');
          orbGradient.addColorStop(1, 'transparent');

          ctx.fillStyle = orbGradient;
          ctx.beginPath();
          ctx.arc(orbX, orbY, orbSize, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Add floating geometric shapes
      ctx.globalAlpha = 0.3;
      for (let i = 0; i < 12; i++) {
        const shapeX = (canvas.width / 12) * i + Math.sin(time * 0.001 + i) * 100;
        const shapeY = canvas.height / 2 + Math.cos(time * 0.0008 + i) * 150;
        const shapeSize = 20 + Math.sin(time * 0.002 + i) * 10;
        const shapeRotation = time * 0.001 + i;

        ctx.save();
        ctx.translate(shapeX, shapeY);
        ctx.rotate(shapeRotation);

        // Create different geometric shapes
        const shapeType = i % 3;
        if (shapeType === 0) {
          // Triangle
          ctx.fillStyle = '#01bcc6';
          ctx.beginPath();
          ctx.moveTo(0, -shapeSize);
          ctx.lineTo(-shapeSize, shapeSize);
          ctx.lineTo(shapeSize, shapeSize);
          ctx.closePath();
          ctx.fill();
        } else if (shapeType === 1) {
          // Square
          ctx.fillStyle = '#008eab';
          ctx.fillRect(-shapeSize/2, -shapeSize/2, shapeSize, shapeSize);
        } else {
          // Circle
          ctx.fillStyle = '#005b7c';
          ctx.beginPath();
          ctx.arc(0, 0, shapeSize/2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // Add subtle grid overlay
      ctx.globalAlpha = 0.1;
      ctx.strokeStyle = '#01bcc6';
      ctx.lineWidth = 0.5;

      const gridSize = 40;
      const cols = Math.ceil(canvas.width / gridSize);
      const rows = Math.ceil(canvas.height / gridSize);

      for (let i = 0; i <= cols; i++) {
        const x = i * gridSize;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      for (let i = 0; i <= rows; i++) {
        const y = i * gridSize;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      time += 16;
    };

    const animate = () => {
      drawPrismaticBurst();
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

export default PrismaticBurstBackground;
