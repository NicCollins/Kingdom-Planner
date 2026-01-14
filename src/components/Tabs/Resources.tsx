import React from "react";
import { GameState } from "@/types/game";

interface ResourcesProps {
  state: GameState;
}

export const Resources: React.FC<ResourcesProps> = ({ state }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-amber-300">
        Resource Details
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Food Resources */}
        <div className="bg-gray-900 p-4 rounded border border-gray-700">
          <h3 className="font-semibold mb-3 text-amber-200 flex items-center gap-2">
            🍖 Food Resources
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Rations (1.0 value):</span>
              <span className="font-bold">{state.rations}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Berries (0.3 value):</span>
              <span className="font-bold">{state.berries}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Small Game (0.8 value):</span>
              <span className="font-bold">{state.smallGame}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Large Game (2.0 value):</span>
              <span className="font-bold">{state.largeGame}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Grain (0.5 value):</span>
              <span className="font-bold">{state.grain}</span>
            </div>
          </div>
        </div>

        {/* Wood Resources */}
        <div className="bg-gray-900 p-4 rounded border border-gray-700">
          <h3 className="font-semibold mb-3 text-amber-200 flex items-center gap-2">
            🪵 Wood Resources
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Sticks (firewood):</span>
              <span className="font-bold">{state.sticks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Logs (construction):</span>
              <span className="font-bold">{state.logs}</span>
            </div>
          </div>
        </div>

        {/* Stone Resources */}
        <div className="bg-gray-900 p-4 rounded border border-gray-700">
          <h3 className="font-semibold mb-3 text-amber-200 flex items-center gap-2">
            🪨 Stone Resources
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Rocks:</span>
              <span className="font-bold">{state.rocks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Stone:</span>
              <span className="font-bold">{state.stone}</span>
            </div>
          </div>
        </div>

        {/* Tools */}
        <div className="bg-gray-900 p-4 rounded border border-gray-700">
          <h3 className="font-semibold mb-3 text-amber-200 flex items-center gap-2">
            🔨 Tools
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Available tools:</span>
              <span className="font-bold">{state.tools}</span>
            </div>
            <div className="text-xs text-gray-500">
              Woodcutters limited by tool count
            </div>
          </div>
        </div>
      </div>

      {/* Production info */}
      <div className="mt-4 bg-gray-900 p-4 rounded border border-gray-700">
        <h3 className="font-semibold mb-2 text-amber-200">
          Terrain Requirements
        </h3>
        <div className="text-sm space-y-1 text-gray-400">
          <div>
            • <span className="text-green-400">Fields</span>: Berries, Small
            Game, Rocks, Sticks
          </div>
          <div>
            • <span className="text-green-600">Forests</span>: Berries, Small
            Game, Large Game, Sticks, Logs
          </div>
          <div>
            • <span className="text-gray-400">Mountains</span>: Stone
          </div>
        </div>
      </div>
    </div>
  );
};
