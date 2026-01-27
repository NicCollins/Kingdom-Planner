import { GameState } from "@/types/game";

interface ResearchProps {
  state: GameState;
}

export const Research: React.FC<ResearchProps> = ({ state }) => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Research</h2>
      <div className="space-y-4">
        {Object.values(state.researchTree).map((item) => (
          <div
            key={item.id}
            className="bg-gray-900 p-4 rounded border border-gray-700"
          >
            <div className="font-semibold text-amber-200">{item.name}</div>
            <div className="text-sm text-gray-400 mb-2">{item.description}</div>
            <div className="text-xs text-gray-500">
              Cost: {item.cost.science} Science, {item.cost.time} days
            </div>
            <div className="text-xs text-gray-500">
              Prerequisites:{" "}
              {item.prerequisites.length > 0
                ? item.prerequisites.map((prereq) => (
                    <span key={prereq} className="text-amber-300">
                      {prereq}
                    </span>
                  ))
                : "None"}
            </div>
            <div
              className={`mt-2 font-semibold ${
                item.completed ? "text-green-400" : "text-red-400"
              }`}
            >
              {item.completed ? "Completed" : "Not Completed"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
