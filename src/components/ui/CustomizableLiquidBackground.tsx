'use client';

import React, { useEffect, useRef } from 'react';

interface CustomizableLiquidBackgroundProps {
  className?: string;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  backgroundType?: 'solid' | 'gradient';
}

export const CustomizableLiquidBackground: React.FC<CustomizableLiquidBackgroundProps> = ({ 
  className = '',
  primaryColor = '#ec4899',
  secondaryColor = '#01bcc6',
  backgroundColor = '#ffffff',
  backgroundType = 'gradient'
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
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    // Helper function to create color variations and handle transparency
    const createColorVariations = (baseColor: string) => {
      // Handle both hex and rgb formats
      let r, g, b;
      
      if (baseColor.startsWith('#')) {
        // Convert hex to RGB
        const hex = baseColor.replace('#', '');
        r = parseInt(hex.substr(0, 2), 16);
        g = parseInt(hex.substr(2, 2), 16);
        b = parseInt(hex.substr(4, 2), 16);
      } else if (baseColor.startsWith('rgb')) {
        // Parse RGB values
        const rgbMatch = baseColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
          r = parseInt(rgbMatch[1]);
          g = parseInt(rgbMatch[2]);
          b = parseInt(rgbMatch[3]);
        } else {
          // Fallback to default values
          r = g = b = 128;
        }
      } else {
        // Fallback to default values
        r = g = b = 128;
      }

      // Create darker and lighter variations
      const darker = `rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)})`;
      const lighter = `rgb(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)})`;
      
      // Create rgba versions for transparency
      const withAlpha = (alpha: number) => `rgba(${r}, ${g}, ${b}, ${alpha})`;
      
      return {
        base: baseColor,
        darker,
        lighter,
        withAlpha
      };
    };

    const drawLiquidChrome = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const primaryVariations = createColorVariations(primaryColor);
      const secondaryVariations = createColorVariations(secondaryColor);

      // Base background - solid or gradient based on backgroundType
      if (backgroundType === 'solid') {
        // Use secondary color as solid background
        ctx.fillStyle = secondaryColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        // Use gradient background
        const baseGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        baseGradient.addColorStop(0, primaryVariations.darker);
        baseGradient.addColorStop(0.3, primaryColor);
        baseGradient.addColorStop(0.7, secondaryColor);
        baseGradient.addColorStop(1, secondaryVariations.darker);

        ctx.fillStyle = baseGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Blob shapes removed - liquid chrome layers commented out
      // const baseOpacity = backgroundType === 'solid' ? 2.5 : 1;
      // const layers = [
      //   { color: secondaryColor, opacity: 0.08 * baseOpacity, speed: 0.0003, scale: 0.005 },
      //   { color: primaryColor, opacity: 0.06 * baseOpacity, speed: 0.0002, scale: 0.004 },
      //   { color: secondaryVariations.darker, opacity: 0.04 * baseOpacity, speed: 0.0001, scale: 0.003 }
      // ];

      // layers.forEach((layer, layerIndex) => {
      //   ctx.globalAlpha = layer.opacity;
        
      //   // Create flowing liquid shapes
      //   for (let i = 0; i < 5; i++) {
      //     const centerX = (canvas.width / 5) * i + Math.sin(time * layer.speed + i) * 100;
      //     const centerY = canvas.height / 2 + Math.cos(time * layer.speed * 0.7 + i) * 150;
          
      //     const gradient = ctx.createRadialGradient(
      //       centerX, centerY, 0,
      //       centerX, centerY, 200 + Math.sin(time * layer.speed + i) * 100
      //     );
          
      //     // Get the color variations for this layer
      //     const layerVariations = createColorVariations(layer.color);
          
      //     gradient.addColorStop(0, layer.color);
      //     gradient.addColorStop(0.7, layerVariations.withAlpha(0.5));
      //     gradient.addColorStop(1, 'transparent');

      //     ctx.fillStyle = gradient;
      //     ctx.beginPath();
          
      //     // Create organic blob shape
      //     const points = 20;
      //     for (let j = 0; j < points; j++) {
      //       const angle = (j / points) * Math.PI * 2;
      //       const radius = 80 + Math.sin(time * layer.speed + angle * 3) * 30;
      //       const x = centerX + Math.cos(angle) * radius;
      //       const y = centerY + Math.sin(angle) * radius;
            
      //       if (j === 0) {
      //         ctx.moveTo(x, y);
      //       } else {
      //         ctx.lineTo(x, y);
      //       }
      //     }
      //     ctx.closePath();
      //     ctx.fill();
      //   }
      // });

      // Add flowing lines using template colors
      // Increase visibility for solid backgrounds
      const lineOpacity = backgroundType === 'solid' ? 0.25 : 0.15;
      ctx.globalAlpha = lineOpacity;
      ctx.strokeStyle = primaryColor; // Changed from secondaryColor to primaryColor
      ctx.lineWidth = backgroundType === 'solid' ? 1.5 : 1;

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

      // Add floating particles using template colors
      // Increase visibility for solid backgrounds
      const particleOpacity = backgroundType === 'solid' ? 0.5 : 0.3;
      ctx.globalAlpha = particleOpacity;
      const particleColors = [secondaryColor, primaryColor, secondaryVariations.darker];
      
      for (let i = 0; i < 8; i++) {
        const particleX = (canvas.width / 8) * i + Math.sin(time * 0.0005 + i) * 50;
        const particleY = canvas.height / 2 + Math.cos(time * 0.0003 + i) * 150;
        const particleSize = 2 + Math.sin(time * 0.0008 + i) * 1;

        ctx.fillStyle = particleColors[i % 3];
        ctx.beginPath();
        ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Add mesh distortion effect using template colors
      // Increase visibility for solid backgrounds
      const meshOpacity = backgroundType === 'solid' ? 0.12 : 0.05;
      ctx.globalAlpha = meshOpacity;
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = backgroundType === 'solid' ? 0.5 : 0.3;

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

      // Add extra visual effects for solid backgrounds to make animations more prominent
      if (backgroundType === 'solid') {
        // Add subtle glow effects
        ctx.globalAlpha = 0.08;
        for (let i = 0; i < 3; i++) {
          const glowX = (canvas.width / 3) * i + Math.sin(time * 0.0004 + i * 2) * 120;
          const glowY = canvas.height / 2 + Math.cos(time * 0.0003 + i * 2) * 100;
          
          const glowGradient = ctx.createRadialGradient(
            glowX, glowY, 0,
            glowX, glowY, 150
          );
          
          glowGradient.addColorStop(0, primaryVariations.withAlpha(0.3));
          glowGradient.addColorStop(0.5, primaryVariations.withAlpha(0.1));
          glowGradient.addColorStop(1, 'transparent');
          
          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(glowX, glowY, 150, 0, Math.PI * 2);
          ctx.fill();
        }

        // Add moving light streaks
        ctx.globalAlpha = 0.15;
        ctx.strokeStyle = primaryVariations.withAlpha(0.4);
        ctx.lineWidth = 2;
        
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          const startX = -100 + (time * 0.02 + i * 200) % (canvas.width + 200);
          const startY = (canvas.height / 4) * i + Math.sin(time * 0.001 + i) * 50;
          const endX = startX + 100;
          const endY = startY + Math.cos(time * 0.001 + i) * 30;
          
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }
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
  }, [primaryColor, secondaryColor, backgroundColor, backgroundType]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ 
        background: backgroundType === 'solid' 
          ? secondaryColor 
          : `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        zIndex: 1
      }}
    />
  );
};

export default CustomizableLiquidBackground;
