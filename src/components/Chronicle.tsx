import { ChronicleEntry } from "@/types/game";

interface ChronicleProps {
  chronicle: ChronicleEntry[];
  chronicleRef: React.RefObject<HTMLDivElement>;
}

export const Chronicle: React.FC<ChronicleProps> = ({
  chronicle,
  chronicleRef,
}) => {
  return (
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
  );
};
