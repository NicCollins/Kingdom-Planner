import { GameState, PoliciesState } from "@/types/game";

interface PoliciesProps {
  state: GameState;
  setPolicy: (key: keyof PoliciesState, value: string) => void;
}

export const Policies: React.FC<PoliciesProps> = ({ state, setPolicy }) => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Policies</h2>
      <div className="space-y-4">
        {[
          {
            key: "foodRationing",
            label: "Food Rationing",
            desc: "Control how much food is consumed per day",
            choices: ["normal", "generous", "strict"],
            choiceText: {
              normal: "Normal Rations",
              generous: "Generous Rations (+25% consumption)",
              strict: "Strict Rations (-25% consumption)",
            },
            disabled: false,
          },
          {
            key: "laborAllocation",
            label: "Labor Allocation",
            desc: "Control how labor is distributed among gathering tasks",
            choices: ["balanced", "focusFood", "focusWood", "focusStone"],
            choiceText: {
              balanced: "Balanced",
              focusFood: "Focus on Food Production",
              focusWood: "Focus on Wood Production",
              focusStone: "Focus on Stone Production",
            },
            disabled: false,
          },
        ].map(({ key, label, desc, choices, choiceText, disabled }) => (
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
            </div>
            {!disabled && (
              <div className="flex gap-2">
                <select
                  className="bg-gray-800 text-gray-200 p-2 rounded border border-gray-600"
                  value={state.policies[key as keyof typeof state.policies]}
                  onChange={(e) =>
                    setPolicy(key as keyof PoliciesState, e.target.value)
                  }
                >
                  {choices.map((choice) => (
                    <option key={choice} value={choice}>
                      {choiceText[choice as keyof typeof choiceText]}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
