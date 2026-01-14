// src/hooks/useGameState.ts - Updated with new resource system

import { useState, useEffect, useRef } from "react";
import {
  GameState,
  ChronicleEntry,
  TimeSpeed,
  TIME_SPEEDS,
  Expedition,
  calculateTotalFood,
} from "../types/game";
import { generateValidMap } from "../utils/mapGeneration";
import {
  hexDistance,
  calculateExpeditionDuration,
  revealExpeditionArea,
  checkExpeditionLoss,
} from "../utils/expeditionUtils";

export const useGameState = () => {
  const [gameStarted, setGameStarted] = useState(false);

  const [mapData, setMapData] = useState(() => generateValidMap());
  const mapTiles = mapData.tiles;
  const colonyLocation = mapData.colonyLocation;

  const regenerateMap = (seed?: number) => {
    setMapData(generateValidMap(seed));
  };

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

    // Food resources - starting provisions
    rations: 100,
    berries: 0,
    smallGame: 0,
    largeGame: 0,
    grain: 20,

    // Wood resources
    sticks: 50,
    logs: 20,

    // Stone resources
    rocks: 30,
    stone: 10,

    tools: 5,
    happiness: 1.0,

    // Labor - starting allocation
    gatherers: 15,
    hunters: 5,
    farmers: 0,
    woodcutters: 5,
    stoneWorkers: 3,
    idle: 22,

    day: 1,
    season: "Spring",
  });

  const [timeSpeed, setTimeSpeed] = useState<TimeSpeed>("normal");
  const [chronicle, setChronicle] = useState<ChronicleEntry[]>([
    {
      day: 1,
      message:
        "Your expedition has arrived. The land offers both bounty and challenge.",
      type: "info",
    },
  ]);
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [mapRevealCounter, setMapRevealCounter] = useState(0);

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

  const startExpedition = (
    targetQ: number,
    targetR: number,
    workers: number
  ) => {
    if (state.idle < workers) {
      addChronicleEntry(
        state.day,
        "Not enough idle workers for expedition!",
        "warning"
      );
      return false;
    }

    const targetTile = mapTiles.get(`${targetQ},${targetR}`);
    if (!targetTile || targetTile.revealed) {
      return false;
    }

    const distance = hexDistance(
      colonyLocation.q,
      colonyLocation.r,
      targetQ,
      targetR
    );
    const duration = calculateExpeditionDuration(distance);

    const newExpedition: Expedition = {
      id: `exp_${Date.now()}`,
      targetQ,
      targetR,
      workers,
      startDay: state.day,
      arrivalDay: state.day + duration,
      status: "in-progress",
    };

    setExpeditions((prev) => [...prev, newExpedition]);

    setState((prev) => ({
      ...prev,
      idle: prev.idle - workers,
    }));

    addChronicleEntry(
      state.day,
      `Expedition of ${workers} settlers departs to explore distant lands. Expected return: Day ${newExpedition.arrivalDay}.`,
      "info"
    );

    return true;
  };

  // Game tick
  useEffect(() => {
    if (timeSpeed === "paused" || !gameStarted) return;

    const tick = setInterval(() => {
      setState((prev) => {
        const newState = { ...prev };

        // Count available terrain
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

        // Production multipliers based on terrain
        const fieldMult = Math.min(1.0, fieldCount / 10);
        const forestMult = Math.min(1.0, forestCount / 5);
        const mountainMult = Math.min(1.0, mountainCount / 3);

        // GATHERERS: berries, sticks, rocks (fields & forests)
        const gatherTerrainMult = Math.min(
          1.0,
          (fieldCount + forestCount) / 15
        );
        const berriesGathered = Math.floor(
          prev.gatherers * 0.3 * gatherTerrainMult * prev.happiness
        );
        const sticksGathered = Math.floor(
          prev.gatherers * 0.4 * gatherTerrainMult * prev.happiness
        );
        const rocksGathered = Math.floor(
          prev.gatherers * 0.2 * gatherTerrainMult * prev.happiness
        );

        // HUNTERS: small game (fields & forests), large game (forests only)
        const huntFieldMult = Math.min(1.0, (fieldCount + forestCount) / 12);
        const huntForestMult = Math.min(1.0, forestCount / 5);
        const smallGameHunted = Math.floor(
          prev.hunters * 0.4 * huntFieldMult * prev.happiness
        );
        const largeGameHunted = Math.floor(
          prev.hunters * 0.2 * huntForestMult * prev.happiness
        );

        // WOODCUTTERS: logs (forests only, tool-limited)
        const logsChopped = Math.floor(
          Math.min(prev.woodcutters, prev.tools) * 0.3 * forestMult
        );

        // STONE WORKERS: stone (mountains only)
        const stoneMined = Math.floor(prev.stoneWorkers * 0.2 * mountainMult);

        // Update resources
        newState.berries = prev.berries + berriesGathered;
        newState.smallGame = prev.smallGame + smallGameHunted;
        newState.largeGame = prev.largeGame + largeGameHunted;
        newState.sticks = prev.sticks + sticksGathered;
        newState.logs = prev.logs + logsChopped;
        newState.rocks = prev.rocks + rocksGathered;
        newState.stone = prev.stone + stoneMined;

        // Food consumption
        const foodNeeded = prev.population * 0.1;
        const totalFood = calculateTotalFood(prev);

        if (totalFood >= foodNeeded) {
          let remaining = foodNeeded;

          // Consume in priority order: berries -> rations -> small game -> large game
          const berriesNeeded = Math.min(
            newState.berries,
            Math.ceil(remaining / 0.3)
          );
          newState.berries = Math.max(0, newState.berries - berriesNeeded);
          remaining -= berriesNeeded * 0.3;

          if (remaining > 0) {
            const rationsNeeded = Math.min(
              newState.rations,
              Math.ceil(remaining / 1.0)
            );
            newState.rations = Math.max(0, newState.rations - rationsNeeded);
            remaining -= rationsNeeded * 1.0;
          }

          if (remaining > 0) {
            const smallGameNeeded = Math.min(
              newState.smallGame,
              Math.ceil(remaining / 0.8)
            );
            newState.smallGame = Math.max(
              0,
              newState.smallGame - smallGameNeeded
            );
            remaining -= smallGameNeeded * 0.8;
          }

          if (remaining > 0) {
            const largeGameNeeded = Math.min(
              newState.largeGame,
              Math.ceil(remaining / 2.0)
            );
            newState.largeGame = Math.max(
              0,
              newState.largeGame - largeGameNeeded
            );
          }

          if (prev.happiness < 1.0) {
            newState.happiness = Math.min(1.0, prev.happiness + 0.01);
          }
        } else {
          newState.happiness = Math.max(0.1, prev.happiness - 0.05);
          if (lastStarvationDay.current !== newState.day) {
            lastStarvationDay.current = newState.day;
            addChronicleEntry(
              newState.day,
              "Food supplies depleted. The colony goes hungry.",
              "danger"
            );
          }
        }

        newState.day = prev.day + 1;

        // Process expeditions
        setExpeditions((prevExpeditions) => {
          const updated = prevExpeditions.map((exp) => {
            if (
              exp.status === "in-progress" &&
              exp.arrivalDay <= newState.day
            ) {
              const distance = hexDistance(
                colonyLocation.q,
                colonyLocation.r,
                exp.targetQ,
                exp.targetR
              );

              if (checkExpeditionLoss(distance)) {
                addChronicleEntry(
                  newState.day,
                  `The expedition to distant lands has gone missing. ${exp.workers} souls lost to the wilderness.`,
                  "danger"
                );
                return { ...exp, status: "lost" as const };
              } else {
                if (exp.status === "in-progress") {
                  const revealedCount = revealExpeditionArea(
                    mapTiles,
                    colonyLocation.q,
                    colonyLocation.r,
                    exp.targetQ,
                    exp.targetR
                  );

                  setMapRevealCounter((prev) => prev + 1);
                  setState((s) => ({ ...s, idle: s.idle + exp.workers }));

                  const targetTile = mapTiles.get(
                    `${exp.targetQ},${exp.targetR}`
                  );
                  const terrainDesc = targetTile
                    ? targetTile.terrain === "water"
                      ? "a great water"
                      : targetTile.terrain === "mountain"
                      ? "towering peaks"
                      : targetTile.terrain === "forest"
                      ? "dense woodlands"
                      : "fertile fields"
                    : "unknown lands";

                  addChronicleEntry(
                    newState.day,
                    `Expedition returns! They discovered ${terrainDesc} and mapped their journey, revealing ${revealedCount} hexes. ${exp.workers} settlers rejoin the colony.`,
                    "info"
                  );
                }
                return { ...exp, status: "completed" as const };
              }
            }
            return exp;
          });

          return updated.filter(
            (exp) =>
              exp.status === "in-progress" || newState.day - exp.arrivalDay < 5
          );
        });

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
  }, [timeSpeed, gameStarted, mapTiles, colonyLocation]);

  const allocateLabor = (job: string, amount: number) => {
    setState((prev) => {
      const total =
        prev.gatherers +
        prev.hunters +
        prev.farmers +
        prev.woodcutters +
        prev.stoneWorkers +
        prev.idle;
      if (total !== prev.population) return prev;

      const newState = {
        ...prev,
        [job]: Math.max(0, Math.min(prev.population, amount)),
      };
      newState.idle =
        prev.population -
        (newState.gatherers +
          newState.hunters +
          newState.farmers +
          newState.woodcutters +
          newState.stoneWorkers);

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
    expeditions,
    startExpedition,
    mapRevealCounter,
  };
};
