import React, { useState, useEffect, useRef } from "react";
import * as PIXI from "pixi.js";

// Terrain types
type TerrainType = "field" | "forest" | "mountain" | "water";

interface HexTile {
  q: number;
  r: number;
  terrain: TerrainType;
  revealed: boolean;
}

// Generate procedural terrain using a simple noise-like function
const generateTerrain = (q: number, r: number): TerrainType => {
  // Use position-based pseudo-random generation
  const hash = (q * 374761393 + r * 668265263) & 0xffffffff;
  const value = ((hash ^ (hash >> 16)) & 0xffff) / 0xffff;

  if (value < 0.1) return "water";
  if (value < 0.3) return "mountain";
  if (value < 0.6) return "forest";
  return "field";
};

// Time speed options (in milliseconds)
const TIME_SPEEDS = {
  paused: 0,
  slow: 2000, // 1 tick every 2 seconds
  normal: 1000, // 1 tick every second
  fast: 500, // 2 ticks per second
  veryFast: 250, // 4 ticks per second
} as const;

type TimeSpeed = keyof typeof TIME_SPEEDS;

// Game State Management
const useGameState = () => {
  const [gameStarted, setGameStarted] = useState(false);

  // Initialize map tiles
  const [mapTiles] = useState<Map<string, HexTile>>(() => {
    const tiles = new Map<string, HexTile>();
    // Generate a 15x15 hex grid
    for (let q = -7; q <= 7; q++) {
      for (let r = -7; r <= 7; r++) {
        if (Math.abs(q + r) > 7) continue;
        const key = `${q},${r}`;
        tiles.set(key, {
          q,
          r,
          terrain: generateTerrain(q, r),
          revealed: false,
        });
      }
    }
    // Reveal starting area (3-tile radius around origin)
    for (let q = -2; q <= 2; q++) {
      for (let r = -2; r <= 2; r++) {
        if (Math.abs(q + r) > 2) continue;
        const tile = tiles.get(`${q},${r}`);
        if (tile) tile.revealed = true;
      }
    }
    return tiles;
  });

  const [state, setState] = useState({
    population: 50,
    grain: 100,
    wood: 50,
    stone: 20,
    tools: 5,
    happiness: 1.0,

    // Labor allocation
    farmers: 10,
    woodcutters: 5,
    gatherers: 3,
    idle: 32,

    // Time
    day: 1,
    season: "Spring",
  });

  const [timeSpeed, setTimeSpeed] = useState<TimeSpeed>("normal");
  const [chronicle, setChronicle] = useState<
    Array<{ day: number; message: string; type: "info" | "warning" | "danger" }>
  >([
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

  // Game tick - speed controlled by timeSpeed
  useEffect(() => {
    if (timeSpeed === "paused" || !gameStarted) return;

    const tick = setInterval(() => {
      setState((prev) => {
        const newState = { ...prev };

        // Calculate terrain bonuses from revealed tiles
        let fieldCount = 0;
        let forestCount = 0;
        let mountainCount = 0;

        mapTiles.forEach((tile) => {
          if (tile.revealed) {
            if (tile.terrain === "field") fieldCount++;
            if (tile.terrain === "forest") forestCount++;
            if (tile.terrain === "mountain") mountainCount++;
          }
        });

        // Production calculations (modified by available terrain)
        const fieldMultiplier = Math.min(1.0, fieldCount / 10); // Need fields for farming
        const forestMultiplier = Math.min(1.0, forestCount / 5); // Need forest for wood
        const mountainMultiplier = Math.min(1.0, mountainCount / 3); // Need mountains for stone

        const grainProduced = Math.floor(
          prev.farmers * 0.5 * prev.happiness * fieldMultiplier
        );
        const woodProduced = Math.floor(
          Math.min(prev.woodcutters, prev.tools) * 0.3 * forestMultiplier
        );
        const stoneProduced = Math.floor(
          prev.gatherers * 0.2 * mountainMultiplier
        );

        // Consumption
        const grainConsumed = Math.floor(prev.population * 0.1);

        newState.grain = Math.max(
          0,
          prev.grain + grainProduced - grainConsumed
        );
        newState.wood = prev.wood + woodProduced;
        newState.stone = prev.stone + stoneProduced;

        // Happiness degradation if starving
        if (newState.grain === 0) {
          newState.happiness = Math.max(0.1, prev.happiness - 0.05);
          // Add chronicle entry on first starvation (only once per starvation event)
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
          // Reset starvation tracking when grain is restored
          if (prev.grain === 0) {
            lastStarvationDay.current = -1;
          }
        }

        // Advance time
        newState.day = prev.day + 1;

        // Add occasional flavor text based on happiness (only once per milestone)
        if (newState.day % 10 === 0 && lastFlavorDay.current !== newState.day) {
          lastFlavorDay.current = newState.day;
          if (newState.happiness > 0.8) {
            const happyMessages = [
              "The settlers hum work songs as they toil. Morale is high.",
              "Children play by the river. Your colony thrives.",
              "The evening fires burn bright with laughter and stories.",
            ];
            addChronicleEntry(
              newState.day,
              happyMessages[Math.floor(Math.random() * happyMessages.length)],
              "info"
            );
          } else if (newState.happiness < 0.4) {
            const unhappyMessages = [
              "Grumbling voices echo from the workers' quarters.",
              "The settlers move slowly, their spirits flagging.",
              "Tension hangs heavy in the air. Something must change.",
            ];
            addChronicleEntry(
              newState.day,
              unhappyMessages[
                Math.floor(Math.random() * unhappyMessages.length)
              ],
              "warning"
            );
          }
        }

        return newState;
      });
    }, TIME_SPEEDS[timeSpeed]);

    return () => clearInterval(tick);
  }, [timeSpeed, gameStarted]);

  const allocateLabor = (job: string, amount: number) => {
    setState((prev) => {
      const total =
        prev.farmers + prev.woodcutters + prev.gatherers + prev.idle;
      if (total !== prev.population) return prev; // Safety check

      const newState = {
        ...prev,
        [job]: Math.max(0, Math.min(prev.population, amount)),
      };

      // Recalculate idle
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
  };
};

// Simple hex map component using PixiJS
const HexMap: React.FC<{ mapTiles: Map<string, HexTile> }> = ({ mapTiles }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);

  useEffect(() => {
    if (!containerRef.current || appRef.current) return;

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

      // Draw simple hex grid
      const hexSize = 25;
      const graphics = new PIXI.Graphics();

      // Terrain colors
      const terrainColors: Record<TerrainType, number> = {
        field: 0x8b7355, // Brown fields
        forest: 0x2d5016, // Dark green
        mountain: 0x606060, // Gray
        water: 0x1e3a5f, // Blue
      };

      const terrainBorders: Record<TerrainType, number> = {
        field: 0xaa9070,
        forest: 0x88aa44,
        mountain: 0x888888,
        water: 0x4a6fa5,
      };

      // Helper function to draw a single hexagon
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
          // Show terrain
          drawHex(
            x,
            y,
            hexSize,
            terrainColors[tile.terrain],
            terrainBorders[tile.terrain]
          );
        } else {
          // Fog of war
          drawHex(x, y, hexSize, 0x0a0a0a, 0x333333);
        }
      });

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
  }, [mapTiles]);

  return <div ref={containerRef} className="border border-gray-700 rounded" />;
};

// Main App Component
export default function KingdomPlanner() {
  const {
    state,
    allocateLabor,
    timeSpeed,
    setTimeSpeed,
    gameStarted,
    setGameStarted,
    chronicle,
    chronicleRef,
    mapTiles,
  } = useGameState();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Auto-scroll chronicle to bottom when new entries are added
  useEffect(() => {
    if (chronicleRef.current) {
      chronicleRef.current.scrollTop = chronicleRef.current.scrollHeight;
    }
  }, [chronicle]);

  const tabs = ["Dashboard", "Labor", "Map", "Resources"];

  // Colony Charter Screen
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 p-4 flex items-center justify-center">
        <div className="max-w-2xl bg-gray-800 rounded-lg p-8 border-2 border-amber-600 shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-amber-400 mb-2">
              Colony Charter
            </h1>
            <div className="text-sm text-gray-400">
              By Order of His Majesty's Crown
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded border border-gray-700 mb-6 text-gray-300 leading-relaxed space-y-4">
            <p className="text-amber-300 font-semibold">
              To the Bearer of this Charter:
            </p>

            <p>
              By royal decree, you are hereby granted stewardship over a colony
              in the New World. The Crown, in its wisdom and generosity, has
              provided you with the following provisions:
            </p>

            <ul className="list-none space-y-2 ml-4">
              <li>
                • <span className="text-amber-200">Fifty souls</span>, brave and
                hardy, willing to carve civilization from wilderness
              </li>
              <li>
                •{" "}
                <span className="text-amber-200">
                  One hundred sacks of grain
                </span>
                , seed and sustenance for your first season
              </li>
              <li>
                • <span className="text-amber-200">Fifty logs of timber</span>,
                for shelter and warmth
              </li>
              <li>
                • <span className="text-amber-200">Twenty stones</span>,
                foundation for your future
              </li>
              <li>
                • <span className="text-amber-200">Five iron tools</span>, axes
                and implements for labor
              </li>
            </ul>

            <p>
              You arrive in <span className="text-amber-200">mid-Spring</span>,
              when the earth softens and the planting season beckons. Use your
              time wisely, for winter comes swiftly in these lands.
            </p>

            <p className="text-gray-400 italic text-sm">
              The Crown expects regular tithes and tribute. Failure to maintain
              the colony reflects poorly upon your house. Success, however,
              brings glory and advancement.
            </p>

            <p className="text-amber-300 font-semibold">
              May fortune favor the bold.
            </p>
          </div>

          <div className="text-center">
            <button
              onClick={() => setGameStarted(true)}
              className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg text-lg transition-colors shadow-lg"
            >
              Begin Your Venture
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            Difficulty and scenario options coming soon...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-lg p-6 mb-4 border border-gray-700">
          <h1 className="text-3xl font-bold text-amber-400 mb-2">
            Kingdom Planner
          </h1>
          <div className="flex justify-between items-center">
            <div className="flex gap-6 text-sm">
              <div>
                Day {state.day} - {state.season}
              </div>
              <div>Population: {state.population}</div>
              <div className={state.grain < 20 ? "text-red-400" : ""}>
                Grain: {state.grain}
              </div>
              <div>Wood: {state.wood}</div>
              <div>Stone: {state.stone}</div>
            </div>

            {/* Time Controls */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 mr-2">Time:</span>
              <button
                onClick={() => setTimeSpeed("paused")}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  timeSpeed === "paused"
                    ? "bg-red-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                title="Pause"
              >
                ⏸
              </button>
              <button
                onClick={() => setTimeSpeed("slow")}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  timeSpeed === "slow"
                    ? "bg-amber-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                title="Slow (2s per day)"
              >
                ▶
              </button>
              <button
                onClick={() => setTimeSpeed("normal")}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  timeSpeed === "normal"
                    ? "bg-amber-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                title="Normal (1s per day)"
              >
                ▶▶
              </button>
              <button
                onClick={() => setTimeSpeed("fast")}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  timeSpeed === "fast"
                    ? "bg-amber-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                title="Fast (2 days per second)"
              >
                ▶▶▶
              </button>
              <button
                onClick={() => setTimeSpeed("veryFast")}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  timeSpeed === "veryFast"
                    ? "bg-amber-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                title="Very Fast (4 days per second)"
              >
                ⏩
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`px-4 py-2 rounded transition-colors ${
                activeTab === tab.toLowerCase()
                  ? "bg-amber-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          {activeTab === "dashboard" && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-amber-300">
                Colony Status
              </h2>
              <div className="space-y-3">
                <p className="text-gray-300">
                  Your fledgling colony has survived {state.day} days in this
                  new land.
                </p>
                <div className="bg-gray-900 p-4 rounded border border-gray-700">
                  <h3 className="font-semibold mb-2 text-amber-200">
                    Daily Production
                  </h3>
                  <div className="text-sm space-y-1">
                    {(() => {
                      let fields = 0,
                        forests = 0,
                        mountains = 0;
                      mapTiles.forEach((tile) => {
                        if (tile.revealed) {
                          if (tile.terrain === "field") fields++;
                          if (tile.terrain === "forest") forests++;
                          if (tile.terrain === "mountain") mountains++;
                        }
                      });
                      const fieldMult = Math.min(1.0, fields / 10);
                      const forestMult = Math.min(1.0, forests / 5);
                      const mountainMult = Math.min(1.0, mountains / 3);

                      return (
                        <>
                          <div>
                            Grain: +
                            {Math.floor(
                              state.farmers * 0.5 * state.happiness * fieldMult
                            )}{" "}
                            / day
                            {fieldMult < 1.0 && (
                              <span className="text-yellow-400">
                                {" "}
                                (Limited by available fields)
                              </span>
                            )}
                          </div>
                          <div>
                            Wood: +
                            {Math.floor(
                              Math.min(state.woodcutters, state.tools) *
                                0.3 *
                                forestMult
                            )}{" "}
                            / day
                            {forestMult < 1.0 && (
                              <span className="text-yellow-400">
                                {" "}
                                (Limited by forests)
                              </span>
                            )}
                          </div>
                          <div>
                            Stone: +
                            {Math.floor(state.gatherers * 0.2 * mountainMult)} /
                            day
                            {mountainMult < 1.0 && (
                              <span className="text-yellow-400">
                                {" "}
                                (Limited by mountains)
                              </span>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
                {state.grain < 20 && (
                  <div className="bg-red-900/30 border border-red-700 p-3 rounded text-red-200">
                    ⚠️ Warning: Grain stores running low! Allocate more farmers.
                  </div>
                )}
                {state.woodcutters > state.tools && (
                  <div className="bg-yellow-900/30 border border-yellow-700 p-3 rounded text-yellow-200">
                    ⚠️ Tool shortage: Only {state.tools} axes available for{" "}
                    {state.woodcutters} woodcutters.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "labor" && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-amber-300">
                Labor Allocation
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                Total Population: {state.population} | Idle: {state.idle}
              </p>

              <div className="space-y-4">
                {[
                  { key: "farmers", label: "Farmers", desc: "Produce grain" },
                  {
                    key: "woodcutters",
                    label: "Woodcutters",
                    desc: "Gather wood (limited by tools)",
                  },
                  {
                    key: "gatherers",
                    label: "Stone Gatherers",
                    desc: "Collect stone",
                  },
                ].map(({ key, label, desc }) => (
                  <div
                    key={key}
                    className="bg-gray-900 p-4 rounded border border-gray-700"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <div className="font-semibold text-amber-200">
                          {label}
                        </div>
                        <div className="text-xs text-gray-400">{desc}</div>
                      </div>
                      <div className="text-2xl font-bold">
                        {state[key as keyof typeof state] as number}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          allocateLabor(
                            key,
                            (state[key as keyof typeof state] as number) - 5
                          )
                        }
                        className="px-3 py-1 bg-red-800 hover:bg-red-700 rounded text-sm"
                      >
                        -5
                      </button>
                      <button
                        onClick={() =>
                          allocateLabor(
                            key,
                            (state[key as keyof typeof state] as number) - 1
                          )
                        }
                        className="px-3 py-1 bg-red-800 hover:bg-red-700 rounded text-sm"
                      >
                        -1
                      </button>
                      <button
                        onClick={() =>
                          allocateLabor(
                            key,
                            (state[key as keyof typeof state] as number) + 1
                          )
                        }
                        className="px-3 py-1 bg-green-800 hover:bg-green-700 rounded text-sm"
                        disabled={state.idle < 1}
                      >
                        +1
                      </button>
                      <button
                        onClick={() =>
                          allocateLabor(
                            key,
                            (state[key as keyof typeof state] as number) + 5
                          )
                        }
                        className="px-3 py-1 bg-green-800 hover:bg-green-700 rounded text-sm"
                        disabled={state.idle < 5}
                      >
                        +5
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "map" && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-amber-300">
                Territory Map
              </h2>

              {/* Terrain Legend */}
              <div className="mb-4 flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: "#8b7355" }}
                  ></div>
                  <span>Fields</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: "#2d5016" }}
                  ></div>
                  <span>Forest</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: "#606060" }}
                  ></div>
                  <span>Mountains</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: "#1e3a5f" }}
                  ></div>
                  <span>Water</span>
                </div>
              </div>

              <div className="flex justify-center">
                <HexMap mapTiles={mapTiles} />
              </div>

              {/* Terrain statistics */}
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                {(() => {
                  let fields = 0,
                    forests = 0,
                    mountains = 0;
                  mapTiles.forEach((tile) => {
                    if (tile.revealed) {
                      if (tile.terrain === "field") fields++;
                      if (tile.terrain === "forest") forests++;
                      if (tile.terrain === "mountain") mountains++;
                    }
                  });
                  return (
                    <>
                      <div className="bg-gray-900 p-3 rounded border border-gray-700">
                        <div className="text-gray-400">Fields Available</div>
                        <div className="text-xl font-bold text-amber-200">
                          {fields}
                        </div>
                        <div className="text-xs text-gray-500">
                          Grain production
                        </div>
                      </div>
                      <div className="bg-gray-900 p-3 rounded border border-gray-700">
                        <div className="text-gray-400">Forest Tiles</div>
                        <div className="text-xl font-bold text-green-400">
                          {forests}
                        </div>
                        <div className="text-xs text-gray-500">
                          Wood production
                        </div>
                      </div>
                      <div className="bg-gray-900 p-3 rounded border border-gray-700">
                        <div className="text-gray-400">Mountain Tiles</div>
                        <div className="text-xl font-bold text-gray-400">
                          {mountains}
                        </div>
                        <div className="text-xs text-gray-500">
                          Stone production
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="mt-4 text-sm text-gray-400 text-center">
                Expedition system coming soon...
              </div>
            </div>
          )}

          {activeTab === "resources" && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-amber-300">
                Resource Stockpile
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    name: "Grain",
                    value: state.grain,
                    icon: "🌾",
                    desc: "Food for your people",
                  },
                  {
                    name: "Wood",
                    value: state.wood,
                    icon: "🪵",
                    desc: "Building material",
                  },
                  {
                    name: "Stone",
                    value: state.stone,
                    icon: "🪨",
                    desc: "Construction resource",
                  },
                  {
                    name: "Tools",
                    value: state.tools,
                    icon: "🔨",
                    desc: "Enables labor efficiency",
                  },
                ].map((resource) => (
                  <div
                    key={resource.name}
                    className="bg-gray-900 p-4 rounded border border-gray-700"
                  >
                    <div className="text-3xl mb-2">{resource.icon}</div>
                    <div className="font-semibold text-amber-200">
                      {resource.name}
                    </div>
                    <div className="text-2xl font-bold">{resource.value}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {resource.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Event Log Preview */}
        <div className="mt-4 bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="font-semibold mb-2 text-amber-300">Chronicle</h3>
          <div
            ref={chronicleRef}
            className="max-h-32 overflow-y-auto text-sm space-y-1"
          >
            {chronicle.map((entry, idx) => (
              <div
                key={idx}
                className={`${
                  entry.type === "danger"
                    ? "text-red-400"
                    : entry.type === "warning"
                    ? "text-yellow-400"
                    : "text-gray-400"
                }`}
              >
                <span className="text-gray-500">Day {entry.day}:</span>{" "}
                {entry.message}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
