import React, { useRef, useEffect, useState } from "react";
import * as PIXI from "pixi.js";
import { HexTile, TerrainType } from "../types/game";
import {
  drawColonyMarker,
  drawExpeditionMarker,
  drawHex,
  pixelToHex,
} from "@/utils/drawingUtils";

interface HexMapProps {
  mapTiles: Map<string, HexTile>;
  colonyLocation: { q: number; r: number };
  selectedTarget: { q: number; r: number } | null;
  onHexSelect?: (q: number, r: number) => void;
  mapRevealCounter?: number;
}

export const HexMap: React.FC<HexMapProps> = ({
  mapTiles,
  colonyLocation,
  selectedTarget,
  onHexSelect,
  mapRevealCounter = 0,
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
              terrainBorders[tile.terrain],
              graphics
            );
          } else {
            drawHex(x, y, hexSize, 0x0a0a0a, 0x333333, graphics);
          }
        });

        // Draw selection marker if a hex is selected
        if (selectedTarget) {
          const tile = mapTiles.get(`${selectedTarget.q},${selectedTarget.r}`);
          if (tile && !tile.revealed) {
            drawExpeditionMarker(selectedTarget, hexSize, graphics);
          }
        }

        // Draw colony marker
        drawColonyMarker(colonyLocation, hexSize, graphics);
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
            terrainBorders[tile.terrain],
            graphics
          );
        } else {
          drawHex(x, y, hexSize, 0x0a0a0a, 0x333333, graphics);
        }
      });

      // Draw selection marker
      if (selectedTarget) {
        const tile = mapTiles.get(`${selectedTarget.q},${selectedTarget.r}`);
        if (tile && !tile.revealed) {
          drawExpeditionMarker(selectedTarget, hexSize, graphics);
        }
      }

      // Draw colony marker
      drawColonyMarker(colonyLocation, hexSize, graphics);
    }
  }, [
    selectedTarget,
    shouldRedraw,
    colonyLocation,
    pixiInitialized,
    mapRevealCounter,
  ]);

  return <div ref={containerRef} className="border border-gray-700 rounded" />;
};
