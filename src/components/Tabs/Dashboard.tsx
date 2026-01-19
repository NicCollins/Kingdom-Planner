import React from "react";
import { calculateStores, GameState } from "@/types/game";

interface DashboardProps {
  state: GameState;
}

export const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-amber-300">Colony Status</h2>
      <div className="space-y-3">
        <p className="text-gray-300">
          Day {state.day} of colonization. Your people work the land and hunt
          the forests.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {/* Food breakdown */}
          <div className="bg-gray-900 p-4 rounded border border-gray-700">
            <h3 className="font-semibold mb-2 text-amber-200">Food Supplies</h3>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Rations:</span>
                <span>{state.rations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Berries:</span>
                <span>{state.berries}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Small Game:</span>
                <span>{state.smallGame}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Large Game:</span>
                <span>{state.largeGame}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Grain:</span>
                <span>{state.grain}</span>
              </div>
              <div className="pt-2 border-t border-gray-700 flex justify-between font-bold">
                <span>Total Food Value:</span>
                <span
                  className={
                    state.totalFood < 20 ? "text-red-400" : "text-green-400"
                  }
                >
                  {state.totalFood}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Daily consumption: {(state.population * 0.1).toFixed(1)}
              </div>
            </div>
          </div>

          {/* Materials breakdown */}
          <div className="bg-gray-900 p-4 rounded border border-gray-700">
            <h3 className="font-semibold mb-2 text-amber-200">Materials</h3>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Sticks:</span>
                <span>{state.sticks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Logs:</span>
                <span>{state.logs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Rocks:</span>
                <span>{state.rocks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Stone:</span>
                <span>{state.stone}</span>
              </div>
              <div className="pt-2 border-t border-gray-700 flex justify-between font-bold">
                <span>Total Stores:</span>
                <span className="text-blue-400">{calculateStores(state)}</span>
              </div>
            </div>
          </div>
        </div>

        {state.totalFood < 20 && (
          <div className="bg-red-900/30 border border-red-700 p-3 rounded text-red-200">
            ⚠️ Warning: Food supplies critically low! Assign more gatherers and
            hunters.
          </div>
        )}
      </div>
    </div>
  );
};
