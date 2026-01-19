import {
  calculateFirewood,
  calculateStores,
  GameState,
  TIME_SPEEDS,
} from "@/types/game";

interface HeaderProps {
  state: GameState;
  setTimeSpeed: (speed: keyof typeof TIME_SPEEDS) => void;
  timeSpeed: keyof typeof TIME_SPEEDS;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  setTimeSpeed,
  timeSpeed,
}) => {
  return (
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
          <div className={state.totalFood < 20 ? "text-red-400" : ""}>
            Food: {state.totalFood}
          </div>
          <div>Firewood: {calculateFirewood(state)}</div>
          <div>Tools: {state.tools}</div>
          <div>Stores: {calculateStores(state)}</div>
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
  );
};
