import React, { useRef, useEffect, useState } from "react";
import * as PIXI from "pixi.js";
import { HexTile, TerrainType } from "../types/game";

interface HexMapProps {
  mapTiles: Map<string, HexTile>;
  colonyLocation: { q: number; r: number };
  selectedTarget: { q: number; r: number } | null;
  onHexSelect?: (q: number, r: number) => void;
}

export const HexMap: React.FC<HexMapProps> = ({
  mapTiles,
  colonyLocation,
  selectedTarget,
  onHexSelect,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const graphicsRef = useRef<PIXI.Graphics | null>(null);

  // Track revealed tiles count to trigger redraws only when it changes
  const revealedCountRef = useRef(0);
  const [shouldRedraw, setShouldRedraw] = useState(0);

  // Track if we need to initialize PixiJS
  const [pixiInitialized, setPixiInitialized] = useState(false);

  // Count revealed tiles and trigger redraw only when count changes
  useEffect(() => {
    let revealedCount = 0;
    mapTiles.forEach((tile) => {
      if (tile.revealed) revealedCount++;
    });

    if (revealedCount !== revealedCountRef.current) {
      revealedCountRef.current = revealedCount;
      setShouldRedraw((prev) => prev + 1);
    }
  }, [mapTiles]);

  useEffect(() => {
    if (!containerRef.current || pixiInitialized) return;

    let mounted = true;

    // Improved pixel to hex conversion using cube coordinates
    const pixelToHex = (
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

    const initPixi = async () => {
      const app = new PIXI.Application();

      await app.init({
        width: 600,
        height: 400,
        backgroundColor: 0x1a1a1a,
      });

      if (!mounted || !containerRef.current) {
        app.destroy(true);
        return;
      }

      containerRef.current.appendChild(app.canvas);
      appRef.current = app;
      setPixiInitialized(true);

      const hexSize = 25;
      const graphics = new PIXI.Graphics();

      // Make stage interactive
      app.stage.eventMode = "static";
      app.stage.hitArea = app.screen;

      // Add click handler only
      app.stage.on("pointerdown", (event) => {
        const pos = event.global;
        const hex = pixelToHex(pos.x, pos.y, hexSize);
        const tile = mapTiles.get(`${hex.q},${hex.r}`);

        if (tile && !tile.revealed && onHexSelect) {
          onHexSelect(hex.q, hex.r);
        }
      });

      const terrainColors: Record<TerrainType, number> = {
        field: 0x8b7355,
        forest: 0x2d5016,
        mountain: 0x606060,
        water: 0x1e3a5f,
      };

      const terrainBorders: Record<TerrainType, number> = {
        field: 0xaa9070,
        forest: 0x88aa44,
        mountain: 0x888888,
        water: 0x4a6fa5,
      };

      const drawHex = (
        cx: number,
        cy: number,
        size: number,
        fillColor: number,
        lineColor: number
      ) => {
        graphics.lineStyle(2, lineColor);
        graphics.beginFill(fillColor);

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
        graphics.endFill();
      };

      const redrawMap = () => {
        graphics.clear();

        // Draw all tiles
        mapTiles.forEach((tile) => {
          const x = 300 + hexSize * Math.sqrt(3) * (tile.q + tile.r / 2);
          const y = 200 + hexSize * (3 / 2) * tile.r;

          if (tile.revealed) {
            drawHex(
              x,
              y,
              hexSize,
              terrainColors[tile.terrain],
              terrainBorders[tile.terrain]
            );
          } else {
            drawHex(x, y, hexSize, 0x0a0a0a, 0x333333);
          }
        });

        // Draw selection marker if a hex is selected
        if (selectedTarget) {
          const tile = mapTiles.get(`${selectedTarget.q},${selectedTarget.r}`);
          if (tile && !tile.revealed) {
            const sx =
              300 +
              hexSize *
                Math.sqrt(3) *
                (selectedTarget.q + selectedTarget.r / 2);
            const sy = 200 + hexSize * (3 / 2) * selectedTarget.r;

            // Draw a targeting crosshair icon
            graphics.lineStyle(3, 0xffaa00);

            // Crosshair lines
            const size = hexSize * 0.6;
            graphics.moveTo(sx - size, sy);
            graphics.lineTo(sx + size, sy);
            graphics.moveTo(sx, sy - size);
            graphics.lineTo(sx, sy + size);

            // Circle around it
            graphics.lineStyle(2, 0xffaa00);
            graphics.drawCircle(sx, sy, hexSize * 0.5);
          }
        }

        // Draw colony marker
        const colonyX =
          300 +
          hexSize * Math.sqrt(3) * (colonyLocation.q + colonyLocation.r / 2);
        const colonyY = 200 + hexSize * (3 / 2) * colonyLocation.r;

        graphics.lineStyle(3, 0xffd700);
        graphics.beginFill(0xffd700, 0.3);
        graphics.drawCircle(colonyX, colonyY, hexSize * 0.6);
        graphics.endFill();

        graphics.lineStyle(0);
        graphics.beginFill(0xffd700);
        graphics.drawCircle(colonyX, colonyY, 4);
        graphics.endFill();
      };

      redrawMap();
      graphicsRef.current = graphics;
      app.stage.addChild(graphics);
    };

    initPixi();

    return () => {
      mounted = false;
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
        setPixiInitialized(false);
      }
    };
  }, []); // Empty dependencies - only run once on mount

  // Redraw only when tiles are revealed or target changes
  useEffect(() => {
    if (graphicsRef.current && pixiInitialized) {
      const graphics = graphicsRef.current;
      const hexSize = 25;

      graphics.clear();

      const terrainColors: Record<TerrainType, number> = {
        field: 0x8b7355,
        forest: 0x2d5016,
        mountain: 0x606060,
        water: 0x1e3a5f,
      };

      const terrainBorders: Record<TerrainType, number> = {
        field: 0xaa9070,
        forest: 0x88aa44,
        mountain: 0x888888,
        water: 0x4a6fa5,
      };

      const drawHex = (
        cx: number,
        cy: number,
        size: number,
        fillColor: number,
        lineColor: number
      ) => {
        graphics.lineStyle(2, lineColor);
        graphics.beginFill(fillColor);

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
        graphics.endFill();
      };

      // Draw all tiles
      mapTiles.forEach((tile) => {
        const x = 300 + hexSize * Math.sqrt(3) * (tile.q + tile.r / 2);
        const y = 200 + hexSize * (3 / 2) * tile.r;

        if (tile.revealed) {
          drawHex(
            x,
            y,
            hexSize,
            terrainColors[tile.terrain],
            terrainBorders[tile.terrain]
          );
        } else {
          drawHex(x, y, hexSize, 0x0a0a0a, 0x333333);
        }
      });

      // Draw selection marker
      if (selectedTarget) {
        const tile = mapTiles.get(`${selectedTarget.q},${selectedTarget.r}`);
        if (tile && !tile.revealed) {
          const sx =
            300 +
            hexSize * Math.sqrt(3) * (selectedTarget.q + selectedTarget.r / 2);
          const sy = 200 + hexSize * (3 / 2) * selectedTarget.r;

          graphics.lineStyle(3, 0xffaa00);
          const size = hexSize * 0.6;
          graphics.moveTo(sx - size, sy);
          graphics.lineTo(sx + size, sy);
          graphics.moveTo(sx, sy - size);
          graphics.lineTo(sx, sy + size);

          graphics.lineStyle(2, 0xffaa00);
          graphics.drawCircle(sx, sy, hexSize * 0.5);
        }
      }

      // Draw colony marker
      const colonyX =
        300 +
        hexSize * Math.sqrt(3) * (colonyLocation.q + colonyLocation.r / 2);
      const colonyY = 200 + hexSize * (3 / 2) * colonyLocation.r;

      graphics.lineStyle(3, 0xffd700);
      graphics.beginFill(0xffd700, 0.3);
      graphics.drawCircle(colonyX, colonyY, hexSize * 0.6);
      graphics.endFill();

      graphics.lineStyle(0);
      graphics.beginFill(0xffd700);
      graphics.drawCircle(colonyX, colonyY, 4);
      graphics.endFill();
    }
  }, [selectedTarget, shouldRedraw, colonyLocation, pixiInitialized]);

  return <div ref={containerRef} className="border border-gray-700 rounded" />;
};
