"use client";

import React, { useRef, useEffect } from 'react';

// Color palette from the Clutter screenshot
const COLORS = [
  '#FFD600', // yellow
  '#00B2FF', // blue
  '#FFFFFF', // white
  '#FFB800', // orange-yellow
  '#00FFB2', // teal
  '#FF6F00', // orange
  '#B2FF00', // lime
  '#FF00B2', // magenta
];

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

// Starburst shape
type Star = {
  x: number;
  y: number;
  radius: number;
  points: number;
  color: string;
  angle: number;
  speed: number;
  glow: number;
};

// Orbiting dot
type OrbitDot = {
  cx: number;
  cy: number;
  orbitRadius: number;
  angle: number;
  speed: number;
  color: string;
  size: number;
};

export const ClutterBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const stars = useRef<Star[]>([]);
  const orbits = useRef<OrbitDot[]>([]);
  const dots = useRef<{x: number, y: number, color: string, size: number, vx: number, vy: number}[]>([]);

  // Initialize elements
  useEffect(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    // Starbursts
    stars.current = Array.from({ length: 8 }, () => ({
      x: randomBetween(0.05, 0.95) * w,
      y: randomBetween(0.05, 0.95) * h,
      radius: randomBetween(60, 160),
      points: Math.floor(randomBetween(8, 18)),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      angle: randomBetween(0, Math.PI * 2),
      speed: randomBetween(-0.001, 0.001),
      glow: randomBetween(16, 32),
    }));
    // Orbits
    orbits.current = Array.from({ length: 12 }, () => ({
      cx: randomBetween(0.1, 0.9) * w,
      cy: randomBetween(0.1, 0.9) * h,
      orbitRadius: randomBetween(100, 420),
      angle: randomBetween(0, Math.PI * 2),
      speed: randomBetween(0.0007, 0.0025),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: randomBetween(2, 6),
    }));
    // Dots
    dots.current = Array.from({ length: 180 }, () => ({
      x: randomBetween(0, w),
      y: randomBetween(0, h),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: randomBetween(1, 2.5),
      vx: randomBetween(-0.07, 0.07),
      vy: randomBetween(-0.07, 0.07),
    }));
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let w = window.innerWidth;
    let h = window.innerHeight;
    if (canvas) {
      canvas.width = w;
      canvas.height = h;
    }

    function drawStar(star: Star) {
      if (!ctx) return;
      ctx.save();
      ctx.translate(star.x, star.y);
      ctx.rotate(star.angle);
      ctx.beginPath();
      for (let i = 0; i < star.points * 2; i++) {
        const r = i % 2 === 0 ? star.radius : star.radius * 0.4;
        const a = (i * Math.PI) / star.points;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.strokeStyle = star.color;
      ctx.globalAlpha = 0.7;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = star.color;
      ctx.shadowBlur = star.glow;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    function drawOrbit(orbit: OrbitDot) {
      if (!ctx) return;
      ctx.save();
      ctx.beginPath();
      ctx.arc(orbit.cx, orbit.cy, orbit.orbitRadius, 0, Math.PI * 2);
      ctx.strokeStyle = orbit.color;
      ctx.globalAlpha = 0.18;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 10]);
      ctx.shadowColor = orbit.color;
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      // Draw dot
      const dotX = orbit.cx + Math.cos(orbit.angle) * orbit.orbitRadius;
      const dotY = orbit.cy + Math.sin(orbit.angle) * orbit.orbitRadius;
      ctx.beginPath();
      ctx.arc(dotX, dotY, orbit.size, 0, Math.PI * 2);
      ctx.fillStyle = orbit.color;
      ctx.shadowColor = orbit.color;
      ctx.shadowBlur = 12;
      ctx.globalAlpha = 0.8;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    function drawDots() {
      if (!ctx) return;
      for (const dot of dots.current) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        ctx.fillStyle = dot.color;
        ctx.globalAlpha = 0.8;
        ctx.shadowColor = dot.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        ctx.restore();
      }
    }

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      // Animate stars
      for (const star of stars.current) {
        star.angle += star.speed;
        drawStar(star);
      }
      // Animate orbits
      for (const orbit of orbits.current) {
        // Mouse parallax effect
        const mx = (mouse.current.x - w / 2) / w;
        const my = (mouse.current.y - h / 2) / h;
        orbit.angle += orbit.speed + mx * 0.003 + my * 0.002;
        drawOrbit(orbit);
      }
      // Animate dots
      for (const dot of dots.current) {
        dot.x += dot.vx + ((mouse.current.x - dot.x) * 0.00013);
        dot.y += dot.vy + ((mouse.current.y - dot.y) * 0.00013);
        // Wrap around
        if (dot.x < 0) dot.x = w;
        if (dot.x > w) dot.x = 0;
        if (dot.y < 0) dot.y = h;
        if (dot.y > h) dot.y = 0;
      }
      drawDots();
      animationId = requestAnimationFrame(animate);
    }
    animate();

    // Resize handler
    function handleResize() {
      w = window.innerWidth;
      h = window.innerHeight;
      if (canvas) {
        canvas.width = w;
        canvas.height = h;
      }
    }
    window.addEventListener('resize', handleResize);

    // Mouse move handler
    function handleMouseMove(e: MouseEvent) {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    }
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1,
        pointerEvents: 'none', // Let UI elements be clickable
        mixBlendMode: 'lighter' as any,
      }}
      aria-hidden="true"
    />
  );
}; 