import React from "react";

interface ColonyCharterProps {
  onStart: () => void;
}

export const ColonyCharter: React.FC<ColonyCharterProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 flex items-center justify-center">
      <div className="max-w-2xl bg-gray-800 rounded-lg p-8 border-2 border-amber-600 shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-amber-400 mb-2">
            Colony Charter
          </h1>
          <div className="text-sm text-gray-400">
            By Order of His Majesty's Crown
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded border border-gray-700 mb-6 text-gray-300 leading-relaxed space-y-4">
          <p className="text-amber-300 font-semibold">
            To the Bearer of this Charter:
          </p>

          <p>
            By royal decree, you are hereby granted stewardship over a colony in
            the New World. The Crown, in its wisdom and generosity, has provided
            you with the following provisions:
          </p>

          <ul className="list-none space-y-2 ml-4">
            <li>
              • <span className="text-amber-200">Fifty souls</span>, brave and
              hardy, willing to carve civilization from wilderness
            </li>
            <li>
              •{" "}
              <span className="text-amber-200">One hundred sacks of grain</span>
              , seed and sustenance for your first season
            </li>
            <li>
              • <span className="text-amber-200">Fifty logs of timber</span>,
              for shelter and warmth
            </li>
            <li>
              • <span className="text-amber-200">Twenty stones</span>,
              foundation for your future
            </li>
            <li>
              • <span className="text-amber-200">Five iron tools</span>, axes
              and implements for labor
            </li>
          </ul>

          <p>
            You arrive in <span className="text-amber-200">mid-Spring</span>,
            when the earth softens and the planting season beckons. Use your
            time wisely, for winter comes swiftly in these lands.
          </p>

          <p className="text-gray-400 italic text-sm">
            The Crown expects regular tithes and tribute. Failure to maintain
            the colony reflects poorly upon your house. Success, however, brings
            glory and advancement.
          </p>

          <p className="text-amber-300 font-semibold">
            May fortune favor the bold.
          </p>
        </div>

        <div className="text-center">
          <button
            onClick={onStart}
            className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg text-lg transition-colors shadow-lg"
          >
            Begin Your Venture
          </button>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          Difficulty and scenario options coming soon...
        </div>
      </div>
    </div>
  );
};
