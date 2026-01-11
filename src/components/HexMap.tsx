import React, { useRef, useEffect, useState } from "react";
import * as PIXI from "pixi.js";
import { HexTile, TerrainType } from "../types/game";

interface HexMapProps {
  mapTiles: Map<string, HexTile>;
  colonyLocation: { q: number; r: number };
  onHexClick?: (q: number, r: number) => void;
}

export const HexMap: React.FC<HexMapProps> = ({
  mapTiles,
  colonyLocation,
  onHexClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const [hoveredHex, setHoveredHex] = useState<{ q: number; r: number } | null>(
    null
  );

  useEffect(() => {
    if (!containerRef.current || appRef.current) return;

    let mounted = true;

    // Convert pixel coordinates to hex coordinates
    const pixelToHex = (
      pixelX: number,
      pixelY: number,
      hexSize: number
    ): { q: number; r: number } => {
      const x = (pixelX - 300) / (hexSize * Math.sqrt(3));
      const y = (pixelY - 200) / (hexSize * 1.5);

      const q = Math.round(x - y / 3);
      const r = Math.round((y * 2) / 3);

      return { q, r };
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

      const hexSize = 25;
      const graphics = new PIXI.Graphics();

      // Make stage interactive
      app.stage.eventMode = "static";
      app.stage.hitArea = app.screen;

      // Add mouse move handler for hover effect
      app.stage.on("pointermove", (event) => {
        const pos = event.global;
        const hex = pixelToHex(pos.x, pos.y, hexSize);
        const tile = mapTiles.get(`${hex.q},${hex.r}`);
        if (tile && !tile.revealed) {
          setHoveredHex(hex);
        } else {
          setHoveredHex(null);
        }
      });

      // Add click handler
      app.stage.on("pointerdown", (event) => {
        if (onHexClick) {
          const pos = event.global;
          const hex = pixelToHex(pos.x, pos.y, hexSize);
          onHexClick(hex.q, hex.r);
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
        graphics.beginFill(fillColor);
        graphics.lineStyle(2, lineColor);

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
          // Check if this is the hovered hex
          const isHovered =
            hoveredHex && hoveredHex.q === tile.q && hoveredHex.r === tile.r;
          drawHex(x, y, hexSize, 0x0a0a0a, isHovered ? 0xffaa00 : 0x333333);
        }
      });

      // Draw colony marker
      const colonyX =
        300 +
        hexSize * Math.sqrt(3) * (colonyLocation.q + colonyLocation.r / 2);
      const colonyY = 200 + hexSize * (3 / 2) * colonyLocation.r;

      graphics.beginFill(0xffd700, 0.3);
      graphics.lineStyle(3, 0xffd700);
      graphics.drawCircle(colonyX, colonyY, hexSize * 0.6);
      graphics.endFill();

      graphics.beginFill(0xffd700);
      graphics.lineStyle(0);
      graphics.drawCircle(colonyX, colonyY, 4);
      graphics.endFill();

      app.stage.addChild(graphics);
    };

    initPixi();

    return () => {
      mounted = false;
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
  }, [mapTiles, colonyLocation, hoveredHex, onHexClick]);

  return <div ref={containerRef} className="border border-gray-700 rounded" />;
};
