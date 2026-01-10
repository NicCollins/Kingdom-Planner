import React, { useState, useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

// Game State Management
const useGameState = () => {
  const [state, setState] = useState({
    population: 50,
    grain: 100,
    wood: 50,
    stone: 20,
    tools: 5,
    happiness: 1.0,
    
    // Labor allocation
    farmers: 10,
    woodcutters: 5,
    gatherers: 3,
    idle: 32,
    
    // Time
    day: 1,
    season: 'Spring',
    
    // Map
    revealedTiles: new Set(['0,0']), // Starting tile
  });

  // Game tick - runs every second
  useEffect(() => {
    const tick = setInterval(() => {
      setState(prev => {
        const newState = { ...prev };
        
        // Production calculations (simplified for MVP)
        const grainProduced = Math.floor(prev.farmers * 0.5 * prev.happiness);
        const woodProduced = Math.floor(Math.min(prev.woodcutters, prev.tools) * 0.3);
        const stoneProduced = Math.floor(prev.gatherers * 0.2);
        
        // Consumption
        const grainConsumed = Math.floor(prev.population * 0.1);
        
        newState.grain = Math.max(0, prev.grain + grainProduced - grainConsumed);
        newState.wood = prev.wood + woodProduced;
        newState.stone = prev.stone + stoneProduced;
        
        // Happiness degradation if starving
        if (newState.grain === 0) {
          newState.happiness = Math.max(0.1, prev.happiness - 0.05);
        } else if (prev.happiness < 1.0) {
          newState.happiness = Math.min(1.0, prev.happiness + 0.01);
        }
        
        // Advance time
        newState.day = prev.day + 1;
        
        return newState;
      });
    }, 1000);

    return () => clearInterval(tick);
  }, []);

  const allocateLabor = (job: string, amount: number) => {
    setState(prev => {
      const total = prev.farmers + prev.woodcutters + prev.gatherers + prev.idle;
      if (total !== prev.population) return prev; // Safety check
      
      const newState = { ...prev, [job]: Math.max(0, Math.min(prev.population, amount)) };
      
      // Recalculate idle
      newState.idle = prev.population - (newState.farmers + newState.woodcutters + newState.gatherers);
      
      return newState;
    });
  };

  return { state, allocateLabor };
};

// Simple hex map component using PixiJS
const HexMap: React.FC<{ revealedTiles: Set<string> }> = ({ revealedTiles }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);

  useEffect(() => {
    if (!canvasRef.current || appRef.current) return;

    const app = new PIXI.Application();
    appRef.current = app;

    app.init({
      width: 600,
      height: 400,
      backgroundColor: 0x1a1a1a,
      canvas: canvasRef.current
    }).then(() => {
      // Draw simple hex grid
      const hexSize = 30;
      const graphics = new PIXI.Graphics();
      
      // Draw a few hexes around origin
      for (let q = -3; q <= 3; q++) {
        for (let r = -3; r <= 3; r++) {
          const key = `${q},${r}`;
          const x = 300 + hexSize * (Math.sqrt(3) * q + Math.sqrt(3)/2 * r);
          const y = 200 + hexSize * (3/2 * r);
          
          if (revealedTiles.has(key)) {
            // Revealed tile - show terrain
            graphics.beginFill(0x2d5016); // Forest green
            graphics.lineStyle(2, 0x88aa44);
          } else {
            // Fog of war
            graphics.beginFill(0x0a0a0a);
            graphics.lineStyle(1, 0x333333);
          }
          
          // Draw hexagon
          graphics.moveTo(x + hexSize, y);
          for (let i = 1; i <= 6; i++) {
            const angle = (Math.PI / 3) * i;
            graphics.lineTo(
              x + hexSize * Math.cos(angle),
              y + hexSize * Math.sin(angle)
            );
          }
          graphics.endFill();
        }
      }
      
      app.stage.addChild(graphics);
    });

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
  }, [revealedTiles]);

  return <canvas ref={canvasRef} className="border border-gray-700 rounded" />;
};

// Main App Component
export default function KingdomPlanner() {
  const { state, allocateLabor } = useGameState();
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = ['Dashboard', 'Labor', 'Map', 'Resources'];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-lg p-6 mb-4 border border-gray-700">
          <h1 className="text-3xl font-bold text-amber-400 mb-2">Kingdom Planner</h1>
          <div className="flex gap-6 text-sm">
            <div>Day {state.day} - {state.season}</div>
            <div>Population: {state.population}</div>
            <div className={state.grain < 20 ? 'text-red-400' : ''}>
              Grain: {state.grain}
            </div>
            <div>Wood: {state.wood}</div>
            <div>Stone: {state.stone}</div>
            <div>Happiness: {(state.happiness * 100).toFixed(0)}%</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`px-4 py-2 rounded transition-colors ${
                activeTab === tab.toLowerCase()
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-amber-300">Colony Status</h2>
              <div className="space-y-3">
                <p className="text-gray-300">
                  Your fledgling colony has survived {state.day} days in this new land.
                </p>
                <div className="bg-gray-900 p-4 rounded border border-gray-700">
                  <h3 className="font-semibold mb-2 text-amber-200">Daily Production</h3>
                  <div className="text-sm space-y-1">
                    <div>Grain: +{Math.floor(state.farmers * 0.5 * state.happiness)} / day</div>
                    <div>Wood: +{Math.floor(Math.min(state.woodcutters, state.tools) * 0.3)} / day</div>
                    <div>Stone: +{Math.floor(state.gatherers * 0.2)} / day</div>
                  </div>
                </div>
                {state.grain < 20 && (
                  <div className="bg-red-900/30 border border-red-700 p-3 rounded text-red-200">
                    ⚠️ Warning: Grain stores running low! Allocate more farmers.
                  </div>
                )}
                {state.woodcutters > state.tools && (
                  <div className="bg-yellow-900/30 border border-yellow-700 p-3 rounded text-yellow-200">
                    ⚠️ Tool shortage: Only {state.tools} axes available for {state.woodcutters} woodcutters.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'labor' && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-amber-300">Labor Allocation</h2>
              <p className="text-sm text-gray-400 mb-4">
                Total Population: {state.population} | Idle: {state.idle}
              </p>
              
              <div className="space-y-4">
                {[
                  { key: 'farmers', label: 'Farmers', desc: 'Produce grain' },
                  { key: 'woodcutters', label: 'Woodcutters', desc: 'Gather wood (limited by tools)' },
                  { key: 'gatherers', label: 'Stone Gatherers', desc: 'Collect stone' }
                ].map(({ key, label, desc }) => (
                  <div key={key} className="bg-gray-900 p-4 rounded border border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <div className="font-semibold text-amber-200">{label}</div>
                        <div className="text-xs text-gray-400">{desc}</div>
                      </div>
                      <div className="text-2xl font-bold">{state[key as keyof typeof state] as number}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => allocateLabor(key, (state[key as keyof typeof state] as number) - 5)}
                        className="px-3 py-1 bg-red-800 hover:bg-red-700 rounded text-sm"
                      >
                        -5
                      </button>
                      <button
                        onClick={() => allocateLabor(key, (state[key as keyof typeof state] as number) - 1)}
                        className="px-3 py-1 bg-red-800 hover:bg-red-700 rounded text-sm"
                      >
                        -1
                      </button>
                      <button
                        onClick={() => allocateLabor(key, (state[key as keyof typeof state] as number) + 1)}
                        className="px-3 py-1 bg-green-800 hover:bg-green-700 rounded text-sm"
                        disabled={state.idle < 1}
                      >
                        +1
                      </button>
                      <button
                        onClick={() => allocateLabor(key, (state[key as keyof typeof state] as number) + 5)}
                        className="px-3 py-1 bg-green-800 hover:bg-green-700 rounded text-sm"
                        disabled={state.idle < 5}
                      >
                        +5
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'map' && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-amber-300">Territory Map</h2>
              <p className="text-sm text-gray-400 mb-4">
                Revealed tiles: {state.revealedTiles.size} | Send expeditions to explore more
              </p>
              <div className="flex justify-center">
                <HexMap revealedTiles={state.revealedTiles} />
              </div>
              <div className="mt-4 text-sm text-gray-400 text-center">
                Expedition system coming soon...
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-amber-300">Resource Stockpile</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'Grain', value: state.grain, icon: '🌾', desc: 'Food for your people' },
                  { name: 'Wood', value: state.wood, icon: '🪵', desc: 'Building material' },
                  { name: 'Stone', value: state.stone, icon: '🪨', desc: 'Construction resource' },
                  { name: 'Tools', value: state.tools, icon: '🔨', desc: 'Enables labor efficiency' }
                ].map(resource => (
                  <div key={resource.name} className="bg-gray-900 p-4 rounded border border-gray-700">
                    <div className="text-3xl mb-2">{resource.icon}</div>
                    <div className="font-semibold text-amber-200">{resource.name}</div>
                    <div className="text-2xl font-bold">{resource.value}</div>
                    <div className="text-xs text-gray-400 mt-1">{resource.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Event Log Preview */}
        <div className="mt-4 bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="font-semibold mb-2 text-amber-300">Chronicle</h3>
          <div className="text-sm text-gray-400 space-y-1">
            <div>Day {state.day}: The colony endures...</div>
            {state.grain === 0 && <div className="text-red-400">Day {state.day}: Grain stores depleted! The people grow hungry.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}