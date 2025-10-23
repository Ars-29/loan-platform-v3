'use client';

import React, { useEffect, useRef } from 'react';

interface MeshBackgroundProps {
  className?: string;
}

export const MeshBackground: React.FC<MeshBackgroundProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const drawMesh = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create gradient mesh
      const gradient1 = ctx.createRadialGradient(
        canvas.width * 0.3, canvas.height * 0.3, 0,
        canvas.width * 0.3, canvas.height * 0.3, canvas.width * 0.8
      );
      gradient1.addColorStop(0, '#01bcc6');
      gradient1.addColorStop(0.5, '#008eab');
      gradient1.addColorStop(1, 'transparent');

      const gradient2 = ctx.createRadialGradient(
        canvas.width * 0.7, canvas.height * 0.7, 0,
        canvas.width * 0.7, canvas.height * 0.7, canvas.width * 0.6
      );
      gradient2.addColorStop(0, '#005b7c');
      gradient2.addColorStop(0.5, '#008eab');
      gradient2.addColorStop(1, 'transparent');

      const gradient3 = ctx.createRadialGradient(
        canvas.width * 0.1, canvas.height * 0.8, 0,
        canvas.width * 0.1, canvas.height * 0.8, canvas.width * 0.5
      );
      gradient3.addColorStop(0, '#01bcc6');
      gradient3.addColorStop(0.7, '#008eab');
      gradient3.addColorStop(1, 'transparent');

      // Apply gradients with opacity
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.globalAlpha = 0.1;
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.globalAlpha = 0.08;
      ctx.fillStyle = gradient3;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.globalAlpha = 1;
    };

    const animate = () => {
      drawMesh();
      requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();

    window.addEventListener('resize', resizeCanvas);

    return () => {
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

export default MeshBackground;
