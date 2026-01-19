import { useState, useEffect } from "react";
import { ColonyCharter } from "./components/ColonyCharter";
import { DebugPanel } from "./components/DebugPanel";
import { useGameState } from "./hooks/useGameState";
import { Dashboard } from "./components/Tabs/Dashboard";
import { Labor } from "./components/Tabs/Labor";
import { Map } from "./components/Tabs/Map";
import { Resources } from "./components/Tabs/Resources";
import { Header } from "./components/Header";
import { Chronicle } from "./components/Chronicle";

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
        <Header
          state={state}
          timeSpeed={timeSpeed}
          setTimeSpeed={setTimeSpeed}
        />

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
          {activeTab === "dashboard" && <Dashboard state={state} />}

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
        <Chronicle chronicle={chronicle} chronicleRef={chronicleRef} />
      </div>
    </div>
  );
}
