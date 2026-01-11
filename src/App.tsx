import React, { useState, useEffect } from "react";
import { ColonyCharter } from "./components/ColonyCharter";
import { HexMap } from "./components/HexMap";
import { DebugPanel } from "./components/DebugPanel";
import { useGameState } from "./hooks/useGameState";
import { TIME_SPEEDS } from "./types/game";

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
    colonyLocation,
    regenerateMap,
    currentSeed,
    expeditions,
    startExpedition,
    mapRevealCounter,
  } = useGameState();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [debugMode, setDebugMode] = useState(false);
  const [expeditionWorkers, setExpeditionWorkers] = useState(5);
  const [selectedTarget, setSelectedTarget] = useState<{
    q: number;
    r: number;
  } | null>(null);

  const handleHexSelect = (q: number, r: number) => {
    setSelectedTarget({ q, r });
  };

  const handleSendExpedition = () => {
    if (selectedTarget) {
      const success = startExpedition(
        selectedTarget.q,
        selectedTarget.r,
        expeditionWorkers
      );
      if (success) {
        setSelectedTarget(null); // Clear selection after sending
      }
    }
  };

  // Auto-scroll chronicle to bottom
  useEffect(() => {
    if (chronicleRef.current) {
      chronicleRef.current.scrollTop = chronicleRef.current.scrollHeight;
    }
  }, [chronicle, chronicleRef]);

  // Keyboard shortcut for debug mode (D key)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "d" || e.key === "D") {
        if (
          !(e.target instanceof HTMLInputElement) &&
          !(e.target instanceof HTMLTextAreaElement)
        ) {
          setDebugMode((prev) => !prev);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const tabs = ["Dashboard", "Labor", "Map", "Resources"];

  // Show charter screen before game starts
  if (!gameStarted) {
    return <ColonyCharter onStart={() => setGameStarted(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
      {/* Debug Toggle - Always visible */}
      <button
        onClick={() => setDebugMode(!debugMode)}
        className="fixed top-4 right-4 z-50 px-3 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded text-xs font-mono transition-colors"
        title="Toggle Debug Mode (D)"
      >
        {debugMode ? "🐛 ON" : "🐛 OFF"}
      </button>

      {/* Debug Panel */}
      {debugMode && (
        <DebugPanel
          state={state}
          timeSpeed={timeSpeed}
          gameStarted={gameStarted}
          chronicle={chronicle}
          mapTiles={mapTiles}
          colonyLocation={colonyLocation}
          onClose={() => setDebugMode(false)}
          regenerateMap={regenerateMap}
          currentSeed={currentSeed}
        />
      )}

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
              {(["paused", "slow", "normal", "fast", "veryFast"] as const).map(
                (speed) => (
                  <button
                    key={speed}
                    onClick={() => setTimeSpeed(speed)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      timeSpeed === speed
                        ? speed === "paused"
                          ? "bg-red-600 text-white"
                          : "bg-amber-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                    title={`${speed} (${TIME_SPEEDS[speed]}ms)`}
                  >
                    {speed === "paused"
                      ? "⏸"
                      : speed === "slow"
                      ? "▶"
                      : speed === "normal"
                      ? "▶▶"
                      : speed === "fast"
                      ? "▶▶▶"
                      : "⏩"}
                  </button>
                )
              )}
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
                <HexMap
                  mapTiles={mapTiles}
                  colonyLocation={colonyLocation}
                  selectedTarget={selectedTarget}
                  onHexSelect={handleHexSelect}
                  mapRevealCounter={mapRevealCounter}
                />
              </div>

              {/* Expedition Controls */}
              <div className="mt-4 bg-gray-900 p-4 rounded border border-gray-700">
                <h3 className="font-semibold mb-2 text-amber-200">
                  Launch Expedition
                </h3>

                {selectedTarget && (
                  <div className="mb-3 p-2 bg-amber-900/20 border border-amber-700 rounded text-sm">
                    Target selected: ({selectedTarget.q}, {selectedTarget.r})
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-sm text-gray-400 block mb-1">
                      Expedition Size
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={state.idle}
                      value={expeditionWorkers}
                      onChange={(e) =>
                        setExpeditionWorkers(
                          Math.min(
                            state.idle,
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        )
                      }
                      className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-600"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-400 mb-1">
                      Available Workers: {state.idle}
                    </div>
                    <button
                      onClick={handleSendExpedition}
                      disabled={
                        !selectedTarget || state.idle < expeditionWorkers
                      }
                      className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded transition-colors"
                    >
                      Send Expedition
                    </button>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mt-2">
                  Click an unexplored hex to select target, then click Send
                </div>

                {/* Active Expeditions */}
                {expeditions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="text-sm text-gray-400 mb-2">
                      Active Expeditions:
                    </div>
                    <div className="space-y-1">
                      {expeditions
                        .filter((exp) => exp.status === "in-progress")
                        .map((exp) => (
                          <div
                            key={exp.id}
                            className="text-xs text-gray-300 flex justify-between"
                          >
                            <span>
                              {exp.workers} workers → ({exp.targetQ},{" "}
                              {exp.targetR})
                            </span>
                            <span className="text-amber-400">
                              Returns Day {exp.arrivalDay}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
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

              <div className="mt-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span>Orange crosshair marks selected expedition target</span>
                </div>
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

        {/* Chronicle */}
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
