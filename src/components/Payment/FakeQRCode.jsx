// 伪二维码组件 — 根据输入字符串生成确定性像素图案
// 仅用于演示/模拟，不具备真实扫码功能
// 采用 mulberry32 做确定性 PRNG，保证同一 value 渲染相同图案

function hash32(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 绘制 QR 风格定位角：3x3 外框 + 中心方块
function FinderPattern({ x, y, cell, color }) {
  const s = cell;
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="0" y="0" width={7 * s} height={7 * s} fill={color} />
      <rect x={s} y={s} width={5 * s} height={5 * s} fill="#fff" />
      <rect x={2 * s} y={2 * s} width={3 * s} height={3 * s} fill={color} />
    </g>
  );
}

export default function FakeQRCode({ value = '', size = 220, color = '#111', bg = '#fff', density = 0.48 }) {
  const modules = 29; // 模块数量 (固定为 29x29)
  const cell = size / modules;
  const seed = hash32(value || 'default');
  const rand = mulberry32(seed);

  // 生成数据模块（避开三个定位角和分隔区）
  const cells = [];
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      const inTL = r < 8 && c < 8;
      const inTR = r < 8 && c >= modules - 8;
      const inBL = r >= modules - 8 && c < 8;
      if (inTL || inTR || inBL) continue;
      if (rand() < density) {
        cells.push(<rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill={color} />);
      }
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      className="block"
    >
      <rect width={size} height={size} fill={bg} />
      {cells}
      {/* 三个定位角 */}
      <FinderPattern x={0} y={0} cell={cell} color={color} />
      <FinderPattern x={(modules - 7) * cell} y={0} cell={cell} color={color} />
      <FinderPattern x={0} y={(modules - 7) * cell} cell={cell} color={color} />
    </svg>
  );
}
