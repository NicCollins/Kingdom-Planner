import React, { useRef } from "react";
import {
  GameState,
  HexTile,
  ChronicleEntry,
  TimeSpeed,
  TIME_SPEEDS,
} from "../types/game";
import { calculateTotalFood } from "@/utils/foodUtils";

interface DebugPanelProps {
  state: GameState;
  timeSpeed: TimeSpeed;
  gameStarted: boolean;
  chronicle: ChronicleEntry[];
  mapTiles: Map<string, HexTile>;
  colonyLocation: { q: number; r: number };
  onClose: () => void;
  regenerateMap: (seed?: number) => void;
  currentSeed: number;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  state,
  timeSpeed,
  gameStarted,
  chronicle,
  mapTiles,
  colonyLocation,
  onClose,
  regenerateMap,
  currentSeed,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Calculate map stats
  let water = 0,
    field = 0,
    forest = 0,
    mountain = 0,
    revealed = 0;
  mapTiles.forEach((tile) => {
    if (tile.terrain === "water") water++;
    if (tile.terrain === "field") field++;
    if (tile.terrain === "forest") forest++;
    if (tile.terrain === "mountain") mountain++;
    if (tile.revealed) revealed++;
  });
  const total = mapTiles.size;
  const mapStats = {
    total,
    revealed,
    water: { count: water, pct: ((water / total) * 100).toFixed(1) },
    field: { count: field, pct: ((field / total) * 100).toFixed(1) },
    forest: { count: forest, pct: ((forest / total) * 100).toFixed(1) },
    mountain: { count: mountain, pct: ((mountain / total) * 100).toFixed(1) },
  };

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
  // const fieldMult = Math.min(1.0, fieldCount / 10);
  // const forestMult = Math.min(1.0, forestCount / 5);
  // const mountainMult = Math.min(1.0, mountainCount / 3);

  return (
    <div className="fixed top-4 right-4 bg-black/90 border border-amber-600 rounded-lg p-4 text-xs font-mono max-w-sm z-50">
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-700">
        <h3 className="text-amber-400 font-bold">DEBUG MODE</h3>
        <button
          onClick={onClose}
          className="text-red-400 hover:text-red-300 font-bold"
        >
          ✕
        </button>
      </div>

      <div
        ref={scrollContainerRef}
        className="space-y-3 max-h-96 overflow-y-auto"
      >
        {/* Game State */}
        <div>
          <div className="text-amber-300 font-semibold mb-1">Game State</div>
          <div className="text-gray-300 space-y-0.5">
            <div>
              Day: {state.day} ({state.season})
            </div>
            <div>
              Time Speed: {timeSpeed} ({TIME_SPEEDS[timeSpeed]}ms)
            </div>
            <div>Game Started: {gameStarted ? "Yes" : "No"}</div>
          </div>
        </div>

        {/* Resources */}
        <div>
          <div className="text-amber-300 font-semibold mb-1">
            Food Resources
          </div>
          <div className="text-gray-300 space-y-0.5">
            <div>Rations: {state.rations}</div>
            <div>Berries: {state.berries}</div>
            <div>Small Game: {state.smallGame}</div>
            <div>Large Game: {state.largeGame}</div>
            <div>Grain: {state.grain}</div>
            <div className="text-yellow-400">
              Total Food: {calculateTotalFood(state)}
            </div>
          </div>
        </div>

        <div>
          <div className="text-amber-300 font-semibold mb-1">Materials</div>
          <div className="text-gray-300 space-y-0.5">
            <div>Sticks: {state.sticks}</div>
            <div>Logs: {state.logs}</div>
            <div>Rocks: {state.rocks}</div>
            <div>Stone: {state.stone}</div>
            <div>Tools: {state.tools}</div>
          </div>
        </div>

        {/* Labor */}
        <div>
          <div className="text-amber-300 font-semibold mb-1">
            Labor Allocation
          </div>
          <div className="text-gray-300 space-y-0.5">
            <div>Population: {state.population}</div>
            <div>Gatherers: {state.gatherers}</div>
            <div>Hunters: {state.hunters}</div>
            <div>Woodcutters: {state.woodcutters}</div>
            <div>Stone Workers: {state.stoneWorkers}</div>
            <div>Farmers: {state.farmers}</div>
            <div>Idle: {state.idle}</div>
            <div className="text-red-400">
              {state.gatherers +
                state.hunters +
                state.woodcutters +
                state.stoneWorkers +
                state.farmers +
                state.idle !==
                state.population && "⚠️ Labor mismatch!"}
            </div>
          </div>
        </div>

        {/* Production */}
        <div>
          <div className="text-amber-300 font-semibold mb-1">
            Production Rates
          </div>
          <div className="text-gray-300 space-y-0.5">
            {(() => {
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
              const gatherTerrainMult = Math.min(
                1.0,
                (fieldCount + forestCount) / 15
              );
              const huntFieldMult = Math.min(
                1.0,
                (fieldCount + forestCount) / 12
              );
              const huntForestMult = Math.min(1.0, forestCount / 5);
              const forestMult = Math.min(1.0, forestCount / 5);
              const mountainMult = Math.min(1.0, mountainCount / 3);

              return (
                <>
                  <div>
                    Berries:{" "}
                    {Math.floor(
                      state.gatherers *
                        0.3 *
                        gatherTerrainMult *
                        state.happiness
                    )}
                    /day
                  </div>
                  <div>
                    Sticks:{" "}
                    {Math.floor(
                      state.gatherers *
                        0.4 *
                        gatherTerrainMult *
                        state.happiness
                    )}
                    /day
                  </div>
                  <div>
                    Rocks:{" "}
                    {Math.floor(
                      state.gatherers *
                        0.2 *
                        gatherTerrainMult *
                        state.happiness
                    )}
                    /day
                  </div>
                  <div>
                    Small Game:{" "}
                    {Math.floor(
                      state.hunters * 0.4 * huntFieldMult * state.happiness
                    )}
                    /day
                  </div>
                  <div>
                    Large Game:{" "}
                    {Math.floor(
                      state.hunters * 0.2 * huntForestMult * state.happiness
                    )}
                    /day
                  </div>
                  <div>
                    Logs:{" "}
                    {Math.floor(
                      Math.min(state.woodcutters, state.tools) *
                        0.3 *
                        forestMult
                    )}
                    /day
                    {state.woodcutters > state.tools && (
                      <span className="text-yellow-400"> (tool-limited)</span>
                    )}
                  </div>
                  <div>
                    Stone: {Math.floor(state.stoneWorkers * 0.2 * mountainMult)}
                    /day
                  </div>
                  <div className="text-red-400">
                    Food consumed: {(state.population * 0.1).toFixed(1)}/day
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Map Statistics */}
        <div>
          <div className="text-amber-300 font-semibold mb-1">
            Map Statistics
          </div>
          <div className="text-gray-300 space-y-0.5">
            <div>
              Colony: ({colonyLocation.q}, {colonyLocation.r})
            </div>
            <div>Total Tiles: {mapStats.total}</div>
            <div>
              Revealed: {mapStats.revealed} (
              {((mapStats.revealed / mapStats.total) * 100).toFixed(1)}%)
            </div>
            <div className="mt-1 pt-1 border-t border-gray-700">
              Terrain Distribution:
            </div>
            <div>
              Water: {mapStats.water.count} ({mapStats.water.pct}%)
            </div>
            <div>
              Fields: {mapStats.field.count} ({mapStats.field.pct}%)
            </div>
            <div>
              Forest: {mapStats.forest.count} ({mapStats.forest.pct}%)
            </div>
            <div>
              Mountain: {mapStats.mountain.count} ({mapStats.mountain.pct}%)
            </div>
            <div className="mt-1 pt-1 border-t border-gray-700">
              Revealed Terrain:
            </div>
            <div>Fields: {fieldCount} (need 10 for 100%)</div>
            <div>Forest: {forestCount} (need 5 for 100%)</div>
            <div>Mountain: {mountainCount} (need 3 for 100%)</div>
          </div>
        </div>

        {/* Map Controls */}
        <div>
          <div className="text-amber-300 font-semibold mb-1">Map Controls</div>
          <div className="text-gray-300 space-y-1">
            <div>
              Seed: <span className="text-cyan-400">{currentSeed}</span>
            </div>
            <button
              onClick={() => regenerateMap()}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold"
            >
              Generate New Map
            </button>
            <div className="flex gap-1">
              <input
                type="number"
                id="seedInput"
                placeholder="Seed"
                className="flex-1 bg-gray-700 text-white px-2 py-1 rounded text-xs"
              />
              <button
                onClick={() => {
                  const input = document.getElementById(
                    "seedInput"
                  ) as HTMLInputElement;
                  const seedValue = input?.value
                    ? parseInt(input.value)
                    : undefined;
                  regenerateMap(seedValue);
                }}
                className="bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold"
              >
                Load
              </button>
            </div>
          </div>
        </div>

        {/* Chronicle */}
        <div>
          <div className="text-amber-300 font-semibold mb-1">Chronicle</div>
          <div className="text-gray-300 space-y-0.5">
            <div>Total Entries: {chronicle.length}</div>
            <div>Latest: Day {chronicle[chronicle.length - 1]?.day}</div>
          </div>
        </div>

        {/* Performance */}
        <div>
          <div className="text-amber-300 font-semibold mb-1">Performance</div>
          <div className="text-gray-300 space-y-0.5">
            <div>FPS: {Math.round(1000 / (TIME_SPEEDS[timeSpeed] || 1))}</div>
            <div>
              Ticks/sec:{" "}
              {timeSpeed === "paused"
                ? 0
                : (1000 / TIME_SPEEDS[timeSpeed]).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
