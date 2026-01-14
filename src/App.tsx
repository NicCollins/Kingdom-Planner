import React, { useState, useEffect } from "react";
import { ColonyCharter } from "./components/ColonyCharter";
import { DebugPanel } from "./components/DebugPanel";
import { useGameState } from "./hooks/useGameState";
import {
  calculateTotalFood,
  calculateFirewood,
  calculateStores,
  TIME_SPEEDS,
} from "./types/game";
import { Dashboard } from "./components/Tabs/Dashboard";
import { Labor } from "./components/Tabs/Labor";
import { Map } from "./components/Tabs/Map";
import { Resources } from "./components/Tabs/Resources";

export default function KingdomPlanner() {
  const {
    state,
    allocateLabor,
    timeSpeed,
    setTimeSpeed,
    gameStarted,
    setGameStarted,
    chronicle,
    chronicleRef,
    mapTiles,
    colonyLocation,
    regenerateMap,
    currentSeed,
    expeditions,
    startExpedition,
    mapRevealCounter,
  } = useGameState();

  const totalFood = calculateTotalFood(state);
  const firewood = calculateFirewood(state);
  const stores = calculateStores(state);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [debugMode, setDebugMode] = useState(false);
  const [expeditionWorkers, setExpeditionWorkers] = useState(5);
  const [selectedTarget, setSelectedTarget] = useState<{
    q: number;
    r: number;
  } | null>(null);

  const handleHexSelect = (q: number, r: number) => {
    setSelectedTarget({ q, r });
  };

  const handleSendExpedition = () => {
    if (selectedTarget) {
      const success = startExpedition(
        selectedTarget.q,
        selectedTarget.r,
        expeditionWorkers
      );
      if (success) {
        setSelectedTarget(null); // Clear selection after sending
      }
    }
  };

  // Auto-scroll chronicle to bottom
  useEffect(() => {
    if (chronicleRef.current) {
      chronicleRef.current.scrollTop = chronicleRef.current.scrollHeight;
    }
  }, [chronicle, chronicleRef]);

  // Keyboard shortcut for debug mode (D key)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "d" || e.key === "D") {
        if (
          !(e.target instanceof HTMLInputElement) &&
          !(e.target instanceof HTMLTextAreaElement)
        ) {
          setDebugMode((prev) => !prev);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const tabs = ["Dashboard", "Labor", "Map", "Resources"];

  // Show charter screen before game starts
  if (!gameStarted) {
    return <ColonyCharter onStart={() => setGameStarted(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
      {/* Debug Toggle - Always visible */}
      <button
        onClick={() => setDebugMode(!debugMode)}
        className="fixed top-4 right-4 z-50 px-3 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded text-xs font-mono transition-colors"
        title="Toggle Debug Mode (D)"
      >
        {debugMode ? "🐛 ON" : "🐛 OFF"}
      </button>

      {/* Debug Panel */}
      {debugMode && (
        <DebugPanel
          state={state}
          timeSpeed={timeSpeed}
          gameStarted={gameStarted}
          chronicle={chronicle}
          mapTiles={mapTiles}
          colonyLocation={colonyLocation}
          onClose={() => setDebugMode(false)}
          regenerateMap={regenerateMap}
          currentSeed={currentSeed}
        />
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
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
              <div className={totalFood < 20 ? "text-red-400" : ""}>
                Food: {totalFood}
              </div>
              <div>Firewood: {firewood}</div>
              <div>Tools: {state.tools}</div>
              <div>Stores: {stores}</div>
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

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`px-4 py-2 rounded transition-colors ${
                activeTab === tab.toLowerCase()
                  ? "bg-amber-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          {activeTab === "dashboard" && (
            <Dashboard state={state} totalFood={totalFood} stores={stores} />
          )}

          {activeTab === "labor" && (
            <Labor state={state} allocateLabor={allocateLabor} />
          )}

          {activeTab === "map" && (
            <Map
              state={state}
              mapTiles={mapTiles}
              colonyLocation={colonyLocation}
              selectedTarget={selectedTarget}
              handleHexSelect={handleHexSelect}
              mapRevealCounter={mapRevealCounter}
              expeditionWorkers={expeditionWorkers}
              setExpeditionWorkers={setExpeditionWorkers}
              expeditions={expeditions}
              handleSendExpedition={handleSendExpedition}
            />
          )}

          {activeTab === "resources" && <Resources state={state} />}
        </div>

        {/* Chronicle */}
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
      </div>
    </div>
  );
}
