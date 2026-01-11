import { useState, useEffect, useRef } from "react";
import {
  GameState,
  ChronicleEntry,
  TimeSpeed,
  TIME_SPEEDS,
  HexTile,
} from "../types/game";
import { generateValidMap } from "../utils/mapGeneration";

export const useGameState = () => {
  const [gameStarted, setGameStarted] = useState(false);

  // Generate a validated map with proper ratios
  const [mapData, setMapData] = useState(() => generateValidMap());
  const mapTiles = mapData.tiles;
  const colonyLocation = mapData.colonyLocation;

  // Allow regenerating the map with a specific seed (useful for testing)
  const regenerateMap = (seed?: number) => {
    setMapData(generateValidMap(seed));
  };

  // Reveal starting area (3-tile radius around colony) - runs whenever map changes
  useEffect(() => {
    for (let q = -2; q <= 2; q++) {
      for (let r = -2; r <= 2; r++) {
        if (Math.abs(q + r) > 2) continue;
        const tile = mapTiles.get(
          `${colonyLocation.q + q},${colonyLocation.r + r}`
        );
        if (tile) tile.revealed = true;
      }
    }
  }, [mapData, mapTiles, colonyLocation]);

  const [state, setState] = useState<GameState>({
    population: 50,
    grain: 100,
    wood: 50,
    stone: 20,
    tools: 5,
    happiness: 1.0,

    farmers: 10,
    woodcutters: 5,
    gatherers: 3,
    idle: 32,

    day: 1,
    season: "Spring",
  });

  const [timeSpeed, setTimeSpeed] = useState<TimeSpeed>("normal");
  const [chronicle, setChronicle] = useState<ChronicleEntry[]>([
    {
      day: 1,
      message:
        "Your expedition has arrived at the new world. The air is thick with possibility and danger.",
      type: "info",
    },
  ]);
  const chronicleRef = useRef<HTMLDivElement>(null);
  const lastStarvationDay = useRef<number>(-1);
  const lastFlavorDay = useRef<number>(-1);

  const addChronicleEntry = (
    day: number,
    message: string,
    type: "info" | "warning" | "danger" = "info"
  ) => {
    setChronicle((prev) => [...prev, { day, message, type }]);
  };

  // Game tick
  useEffect(() => {
    if (timeSpeed === "paused" || !gameStarted) return;

    const tick = setInterval(() => {
      setState((prev) => {
        const newState = { ...prev };

        // Calculate terrain bonuses
        let fieldCount = 0,
          forestCount = 0,
          mountainCount = 0;
        mapTiles.forEach((tile) => {
          if (tile.revealed) {
            if (tile.terrain === "field") fieldCount++;
            if (tile.terrain === "forest") forestCount++;
            if (tile.terrain === "mountain") mountainCount++;
          }
        });

        const fieldMultiplier = Math.min(1.0, fieldCount / 10);
        const forestMultiplier = Math.min(1.0, forestCount / 5);
        const mountainMultiplier = Math.min(1.0, mountainCount / 3);

        const grainProduced = Math.floor(
          prev.farmers * 0.5 * prev.happiness * fieldMultiplier
        );
        const woodProduced = Math.floor(
          Math.min(prev.woodcutters, prev.tools) * 0.3 * forestMultiplier
        );
        const stoneProduced = Math.floor(
          prev.gatherers * 0.2 * mountainMultiplier
        );
        const grainConsumed = Math.floor(prev.population * 0.1);

        newState.grain = Math.max(
          0,
          prev.grain + grainProduced - grainConsumed
        );
        newState.wood = prev.wood + woodProduced;
        newState.stone = prev.stone + stoneProduced;

        // Happiness
        if (newState.grain === 0) {
          newState.happiness = Math.max(0.1, prev.happiness - 0.05);
          if (prev.grain > 0 && lastStarvationDay.current !== newState.day) {
            lastStarvationDay.current = newState.day;
            addChronicleEntry(
              newState.day,
              "The granaries stand empty. Hungry whispers grow louder in the night.",
              "danger"
            );
          }
        } else if (prev.happiness < 1.0) {
          newState.happiness = Math.min(1.0, prev.happiness + 0.01);
          if (prev.grain === 0) {
            lastStarvationDay.current = -1;
          }
        }

        newState.day = prev.day + 1;

        // Flavor text every 10 days
        if (newState.day % 10 === 0 && lastFlavorDay.current !== newState.day) {
          lastFlavorDay.current = newState.day;
          if (newState.happiness > 0.8) {
            const messages = [
              "The settlers hum work songs as they toil. Morale is high.",
              "Children play by the river. Your colony thrives.",
              "The evening fires burn bright with laughter and stories.",
            ];
            addChronicleEntry(
              newState.day,
              messages[Math.floor(Math.random() * messages.length)],
              "info"
            );
          } else if (newState.happiness < 0.4) {
            const messages = [
              "Grumbling voices echo from the workers' quarters.",
              "The settlers move slowly, their spirits flagging.",
              "Tension hangs heavy in the air. Something must change.",
            ];
            addChronicleEntry(
              newState.day,
              messages[Math.floor(Math.random() * messages.length)],
              "warning"
            );
          }
        }

        return newState;
      });
    }, TIME_SPEEDS[timeSpeed]);

    return () => clearInterval(tick);
  }, [timeSpeed, gameStarted, mapTiles]);

  const allocateLabor = (job: string, amount: number) => {
    setState((prev) => {
      const total =
        prev.farmers + prev.woodcutters + prev.gatherers + prev.idle;
      if (total !== prev.population) return prev;

      const newState = {
        ...prev,
        [job]: Math.max(0, Math.min(prev.population, amount)),
      };
      newState.idle =
        prev.population -
        (newState.farmers + newState.woodcutters + newState.gatherers);

      return newState;
    });
  };

  return {
    state,
    allocateLabor,
    timeSpeed,
    setTimeSpeed,
    gameStarted,
    setGameStarted,
    chronicle,
    chronicleRef,
    mapTiles,
    colonyLocation,
    regenerateMap,
    currentSeed: mapData.seed,
  };
};
