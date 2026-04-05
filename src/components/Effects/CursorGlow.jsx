import { useEffect, useRef, useState } from 'react';

// 全局鼠标特效 — 赛博朋克十字准星 + 旋转六边形 + 粒子拖尾 + 磁力吸附 + 点击涟漪
// 仅在非触屏桌面设备上启用
export default function CursorGlow() {
  const canvasRef = useRef(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // 检测触屏设备
  useEffect(() => {
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isNarrow = window.matchMedia('(max-width: 768px)').matches;
    setIsTouchDevice(hasTouchScreen && isNarrow);
  }, []);

  useEffect(() => {
    if (isTouchDevice) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let mouseX = -200, mouseY = -200;
    let smoothX = -200, smoothY = -200;
    let isHovering = false; // 悬停在可交互元素上
    let isPressed = false;
    let frame = 0; // 全局帧计数器（驱动旋转和脉冲动画）

    // 粒子系统
    const particles = [];
    const MAX_PARTICLES = 50;
    // 涟漪系统
    const ripples = [];
    // 轨迹系统 — 记录最近N帧鼠标位置，绘制渐隐尾迹线
    const trail = [];
    const TRAIL_LENGTH = 18;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    // 判断目标元素是否为可交互元素（按钮/链接等）
    const isInteractive = (el) => {
      if (!el) return false;
      const tag = el.tagName;
      if (tag === 'A' || tag === 'BUTTON' || tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return true;
      if (el.getAttribute('role') === 'button' || el.closest('a') || el.closest('button')) return true;
      return false;
    };

    const handleMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isHovering = isInteractive(e.target);

      // 拖尾粒子
      if (particles.length < MAX_PARTICLES) {
        const speed = Math.hypot(e.movementX || 0, e.movementY || 0);
        if (speed > 2) {
          particles.push({
            x: mouseX + (Math.random() - 0.5) * 8,
            y: mouseY + (Math.random() - 0.5) * 8,
            size: Math.random() * 2.5 + 1,
            life: 1,
            decay: Math.random() * 0.025 + 0.012,
            vx: (Math.random() - 0.5) * 1.2,
            vy: (Math.random() - 0.5) * 1.2,
            hue: 150 + Math.random() * 30,
          });
        }
      }
      // 轨迹记录
      trail.push({ x: mouseX, y: mouseY });
      if (trail.length > TRAIL_LENGTH) trail.shift();
    };

    const handleDown = () => { isPressed = true; };
    const handleUp = () => { isPressed = false; };

    const handleClick = (e) => {
      // 涟漪
      for (let i = 0; i < 3; i++) {
        ripples.push({ x: e.clientX, y: e.clientY, radius: 0, maxRadius: 50 + i * 35, life: 1, decay: 0.028 - i * 0.006 });
      }
      // 爆发粒子 — 六芒星方向
      for (let i = 0; i < 18; i++) {
        const angle = (Math.PI * 2 * i) / 18 + Math.random() * 0.3;
        const speed = Math.random() * 4 + 2;
        particles.push({
          x: e.clientX, y: e.clientY,
          size: Math.random() * 3 + 1.5, life: 1,
          decay: Math.random() * 0.018 + 0.008,
          vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
          hue: 140 + Math.random() * 40,
        });
      }
    };

    document.addEventListener('mousemove', handleMove, { passive: true });
    document.addEventListener('mousedown', handleDown);
    document.addEventListener('mouseup', handleUp);
    document.addEventListener('click', handleClick);

    // ===== 绘制函数 =====

    // 绘制六边形（旋转 + 缩放）
    const drawHexagon = (cx, cy, radius, rotation, alpha, lineWidth) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(cx, cy);
      ctx.rotate(rotation);
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        const px = Math.cos(a) * radius;
        const py = Math.sin(a) * radius;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(29, 185, 84, ${alpha})`;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
      ctx.restore();
    };

    // 绘制十字准星
    const drawCrosshair = (cx, cy, size, alpha) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = `rgba(29, 185, 84, ${alpha})`;
      ctx.lineWidth = 1.2;
      const gap = size * 0.3;
      // 四条准星线段
      ctx.beginPath();
      ctx.moveTo(cx, cy - size); ctx.lineTo(cx, cy - gap);
      ctx.moveTo(cx, cy + gap); ctx.lineTo(cx, cy + size);
      ctx.moveTo(cx - size, cy); ctx.lineTo(cx - gap, cy);
      ctx.moveTo(cx + gap, cy); ctx.lineTo(cx + size, cy);
      ctx.stroke();
      // 中心圆点
      ctx.fillStyle = `rgba(29, 185, 84, ${alpha * 1.2})`;
      ctx.beginPath();
      ctx.arc(cx, cy, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // 绘制虚线圆环（悬停时扩大的磁力场）
    const drawDashedRing = (cx, cy, radius, alpha, rotation) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(cx, cy);
      ctx.rotate(rotation);
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = `rgba(29, 185, 84, ${alpha * 0.6})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    };

    let animId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      // 平滑跟随（悬停时更快吸附）
      const lerpSpeed = isHovering ? 0.25 : 0.12;
      smoothX += (mouseX - smoothX) * lerpSpeed;
      smoothY += (mouseY - smoothY) * lerpSpeed;

      const pulse = Math.sin(frame * 0.04) * 0.5 + 0.5; // 0~1 脉冲
      const hoverScale = isHovering ? 1.4 : 1;
      const pressScale = isPressed ? 0.85 : 1;
      const scale = hoverScale * pressScale;

      // ① 大范围柔和辉光
      const glow = ctx.createRadialGradient(smoothX, smoothY, 0, smoothX, smoothY, 160 * scale);
      glow.addColorStop(0, `rgba(29, 185, 84, ${0.06 + pulse * 0.02})`);
      glow.addColorStop(0.4, 'rgba(29, 185, 84, 0.02)');
      glow.addColorStop(1, 'rgba(29, 185, 84, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(smoothX - 200, smoothY - 200, 400, 400);

      // ② 轨迹尾迹线（渐隐彩带）
      if (trail.length > 2) {
        ctx.beginPath();
        ctx.moveTo(trail[0].x, trail[0].y);
        for (let i = 1; i < trail.length; i++) {
          ctx.lineTo(trail[i].x, trail[i].y);
        }
        ctx.strokeStyle = 'rgba(29, 185, 84, 0.08)';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // ③ 外圈旋转六边形
      const hexRotation = frame * 0.012;
      drawHexagon(smoothX, smoothY, 22 * scale, hexRotation, 0.35 + pulse * 0.15, 1.2);
      // 内圈反向旋转六边形（双层视觉）
      drawHexagon(smoothX, smoothY, 14 * scale, -hexRotation * 1.5, 0.2 + pulse * 0.1, 0.8);

      // ④ 十字准星
      drawCrosshair(smoothX, smoothY, 10 * scale, 0.5 + pulse * 0.2);

      // ⑤ 悬停在按钮/链接上时 — 扩展虚线圆环 + 放大效果
      if (isHovering) {
        drawDashedRing(smoothX, smoothY, 30 * scale, 0.4, frame * 0.02);
        // 四角装饰线段
        const cornerSize = 6;
        const cornerDist = 26 * scale;
        ctx.save();
        ctx.strokeStyle = 'rgba(29, 185, 84, 0.5)';
        ctx.lineWidth = 1.5;
        const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
        corners.forEach(([dx, dy]) => {
          const cx = smoothX + dx * cornerDist;
          const cy = smoothY + dy * cornerDist;
          ctx.beginPath();
          ctx.moveTo(cx, cy); ctx.lineTo(cx + dx * cornerSize, cy);
          ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + dy * cornerSize);
          ctx.stroke();
        });
        ctx.restore();
      }

      // ⑥ 内核光点（呼吸脉冲）
      const coreR = (3 + pulse * 2) * pressScale;
      const coreGrad = ctx.createRadialGradient(smoothX, smoothY, 0, smoothX, smoothY, coreR * 3);
      coreGrad.addColorStop(0, `rgba(29, 185, 84, ${0.7 + pulse * 0.3})`);
      coreGrad.addColorStop(0.4, 'rgba(29, 185, 84, 0.2)');
      coreGrad.addColorStop(1, 'rgba(29, 185, 84, 0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(smoothX, smoothY, coreR * 3, 0, Math.PI * 2);
      ctx.fill();

      // ⑦ 粒子拖尾
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.life -= p.decay;
        p.vx *= 0.97; p.vy *= 0.97;
        if (p.life <= 0) { particles.splice(i, 1); continue; }

        ctx.globalAlpha = p.life * 0.7;
        const pg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5);
        pg.addColorStop(0, `hsla(${p.hue}, 80%, 60%, 0.9)`);
        pg.addColorStop(1, `hsla(${p.hue}, 80%, 60%, 0)`);
        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // ⑧ 涟漪
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 3;
        r.life -= r.decay;
        if (r.life <= 0 || r.radius > r.maxRadius) { ripples.splice(i, 1); continue; }

        ctx.globalAlpha = r.life * 0.35;
        ctx.strokeStyle = `rgba(29, 185, 84, ${r.life * 0.5})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('mouseup', handleUp);
      document.removeEventListener('click', handleClick);
    };
  }, [isTouchDevice]);

  if (isTouchDevice) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
