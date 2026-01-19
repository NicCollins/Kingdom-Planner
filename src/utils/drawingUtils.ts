import * as PIXI from "pixi.js";

export const pixelToHex = (
  pixelX: number,
  pixelY: number,
  hexSize: number
): { q: number; r: number } => {
  // Offset coordinates
  const x = (pixelX - 300) / hexSize;
  const y = (pixelY - 200) / hexSize;

  // Convert to axial coordinates
  const q = (x * Math.sqrt(3)) / 3 - y / 3;
  const r = (y * 2) / 3;

  // Convert to cube coordinates for proper rounding
  const s = -q - r;

  let rq = Math.round(q);
  let rr = Math.round(r);
  const rs = Math.round(s);

  const qDiff = Math.abs(rq - q);
  const rDiff = Math.abs(rr - r);
  const sDiff = Math.abs(rs - s);

  if (qDiff > rDiff && qDiff > sDiff) {
    rq = -rr - rs;
  } else if (rDiff > sDiff) {
    rr = -rq - rs;
  }

  return { q: rq, r: rr };
};

export const drawHex = (
  cx: number,
  cy: number,
  size: number,
  fillColor: number,
  lineColor: number,
  graphics: PIXI.Graphics
) => {
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const x = cx + size * Math.cos(angle);
    const y = cy + size * Math.sin(angle);

    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  graphics.closePath();
  graphics.fill({ color: fillColor });
  graphics.stroke({ color: lineColor, width: 2 });
};

export const drawExpeditionMarker = (
  selectedTarget: { q: number; r: number },
  hexSize: number,
  graphics: PIXI.Graphics
) => {
  const sx =
    300 + hexSize * Math.sqrt(3) * (selectedTarget.q + selectedTarget.r / 2);
  const sy = 200 + hexSize * (3 / 2) * selectedTarget.r;

  // Draw a targeting crosshair icon
  // Crosshair lines
  const size = hexSize * 0.6;
  graphics.moveTo(sx - size, sy);
  graphics.lineTo(sx + size, sy);
  graphics.moveTo(sx, sy - size);
  graphics.lineTo(sx, sy + size);
  graphics.stroke({ color: 0xffaa00, width: 3 });

  // Circle around it
  graphics.circle(sx, sy, hexSize * 0.5);
  graphics.fill({ color: 0xffd700, alpha: 0.2 });
  graphics.stroke({ color: 0xffaa00, width: 2 });
};

export const drawColonyMarker = (
  colonyLocation: { q: number; r: number },
  hexSize: number,
  graphics: PIXI.Graphics
) => {
  const colonyX =
    300 + hexSize * Math.sqrt(3) * (colonyLocation.q + colonyLocation.r / 2);
  const colonyY = 200 + hexSize * (3 / 2) * colonyLocation.r;

  graphics.circle(colonyX, colonyY, hexSize * 0.6);
  graphics.fill({ color: 0xffd700, alpha: 0.4 });
  graphics.stroke({ color: 0xffd700, width: 3 });

  graphics.circle(colonyX, colonyY, 4);
  graphics.fill({ color: 0xffd700 });
  graphics.stroke({ color: 0xffd700, width: 0 });
};
