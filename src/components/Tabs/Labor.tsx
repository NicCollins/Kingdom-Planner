import React from "react";
import { GameState } from "@/types/game";

interface LaborProps {
  state: GameState;
  allocateLabor: (laborType: string, count: number) => void;
}

export const Labor: React.FC<LaborProps> = ({ state, allocateLabor }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-amber-300">
        Labor Allocation
      </h2>
      <p className="text-sm text-gray-400 mb-4">
        Total Population: {state.population} | Idle: {state.idle}
      </p>

      <div className="space-y-4">
        {[
          {
            key: "gatherers",
            label: "Gatherers",
            desc: "Collect berries, sticks, and rocks (fields & forests)",
          },
          {
            key: "hunters",
            label: "Hunters",
            desc: "Hunt small and large game",
          },
          {
            key: "woodcutters",
            label: "Woodcutters",
            desc: "Chop logs from forests (tool-limited)",
          },
          {
            key: "stoneWorkers",
            label: "Stone Workers",
            desc: "Mine stone from mountains",
          },
          {
            key: "farmers",
            label: "Farmers",
            desc: "Farm grain (disabled - no farming yet)",
            disabled: true,
          },
        ].map(({ key, label, desc, disabled }) => (
          <div
            key={key}
            className={`bg-gray-900 p-4 rounded border border-gray-700 ${
              disabled ? "opacity-50" : ""
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <div>
                <div className="font-semibold text-amber-200">
                  {label} {disabled && "(Disabled)"}
                </div>
                <div className="text-xs text-gray-400">{desc}</div>
              </div>
              <div className="text-2xl font-bold">
                {state[key as keyof typeof state] as number}
              </div>
            </div>
            {!disabled && (
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
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
