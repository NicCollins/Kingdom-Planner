import React from "react";
import { Expedition, GameState, HexTile } from "@/types/game";
import { HexMap } from "../HexMap";

interface MapProps {
  state: GameState;
  mapTiles: Map<string, HexTile>;
  colonyLocation: { q: number; r: number };
  selectedTarget: { q: number; r: number } | null;
  handleHexSelect: (q: number, r: number) => void;
  mapRevealCounter: number;
  expeditionWorkers: number;
  setExpeditionWorkers: (count: number) => void;
  expeditions: Expedition[];
  handleSendExpedition: () => void;
}

export const Map: React.FC<MapProps> = ({
  state,
  mapTiles,
  colonyLocation,
  selectedTarget,
  handleHexSelect,
  mapRevealCounter,
  expeditionWorkers,
  setExpeditionWorkers,
  expeditions,
  handleSendExpedition,
}) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-amber-300">Territory Map</h2>

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
        <h3 className="font-semibold mb-2 text-amber-200">Launch Expedition</h3>

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
              disabled={!selectedTarget || state.idle < expeditionWorkers}
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
                      {exp.workers} workers → ({exp.targetQ}, {exp.targetR})
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
                <div className="text-xl font-bold text-amber-200">{fields}</div>
                <div className="text-xs text-gray-500">Grain production</div>
              </div>
              <div className="bg-gray-900 p-3 rounded border border-gray-700">
                <div className="text-gray-400">Forest Tiles</div>
                <div className="text-xl font-bold text-green-400">
                  {forests}
                </div>
                <div className="text-xs text-gray-500">Wood production</div>
              </div>
              <div className="bg-gray-900 p-3 rounded border border-gray-700">
                <div className="text-gray-400">Mountain Tiles</div>
                <div className="text-xl font-bold text-gray-400">
                  {mountains}
                </div>
                <div className="text-xs text-gray-500">Stone production</div>
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
  );
};
