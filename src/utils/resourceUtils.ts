import { GameState, HexTile } from "@/types/game";

export const calculateTerrainCounts = (
  state: GameState,
  mapTiles: Map<string, HexTile>
) => {
  let fieldCount = 0;
  let forestCount = 0;
  let mountainCount = 0;

  mapTiles.forEach((tile) => {
    if (tile.revealed) {
      if (tile.terrain === "field") fieldCount++;
      if (tile.terrain === "forest") forestCount++;
      if (tile.terrain === "mountain") mountainCount++;
    }
  });

  state.fieldCount = fieldCount;
  state.forestCount = forestCount;
  state.mountainCount = mountainCount;
};

export const calculateResourceCollection = (
  state: GameState,
  prev: GameState
) => {
  calculateGatheringValues(state, prev.gatherers, prev.happiness);
  calculateHuntingValues(state, prev.hunters, prev.happiness);
  calculateWoodValues(state, prev.woodcutters, prev.happiness);
  calculateStoneValues(state, prev.stoneWorkers, prev.happiness);
};

export const calculateGatheringValues = (
  state: GameState,
  gatherers: number,
  happiness: number
) => {
  const gatherTerrainMult = Math.min(
    1.0,
    (state.fieldCount + state.forestCount) / 15
  );

  let berriesMult;
  let sticksMult;
  let rocksMult;

  switch (state.policies.laborAllocation) {
    case "focusFood":
      berriesMult = 1.0;
      sticksMult = 0.0;
      rocksMult = 0.0;
      break;
    case "focusWood":
      berriesMult = 0.0;
      sticksMult = 1.0;
      rocksMult = 0.0;
      break;
    case "focusStone":
      berriesMult = 0.0;
      sticksMult = 0.0;
      rocksMult = 1.0;
      break;
    default:
      berriesMult = 0.4;
      sticksMult = 0.4;
      rocksMult = 0.2;
      break;
  }

  const berriesGathered = Math.floor(
    gatherers * gatherTerrainMult * happiness * berriesMult
  );
  const sticksGathered = Math.floor(
    gatherers * gatherTerrainMult * happiness * sticksMult
  );
  const rocksGathered = Math.floor(
    gatherers * gatherTerrainMult * happiness * rocksMult
  );

  state.berries += berriesGathered;
  state.sticks += sticksGathered;
  state.rocks += rocksGathered;
};

export const calculateHuntingValues = (
  state: GameState,
  hunters: number,
  happiness: number
) => {
  const huntFieldMult = Math.min(
    1.0,
    (state.fieldCount + state.forestCount) / 12
  );
  const huntForestMult = Math.min(1.0, state.forestCount / 5);
  const smallGameHunted = Math.floor(hunters * 0.4 * huntFieldMult * happiness);
  const largeGameHunted = Math.floor(
    hunters * 0.2 * huntForestMult * happiness
  );

  state.smallGame += smallGameHunted;
  state.largeGame += largeGameHunted;
};

export const calculateWoodValues = (
  state: GameState,
  woodcutters: number,
  happiness: number
) => {
  const forestMult = Math.min(1.0, state.forestCount / 5);
  const logsChopped = Math.floor(woodcutters * 0.3 * forestMult * happiness);

  state.logs += logsChopped;
};

export const calculateStoneValues = (
  state: GameState,
  stoneWorkers: number,
  happiness: number
) => {
  const mountainMult = Math.min(1.0, state.mountainCount / 3);
  const stoneMined = Math.floor(stoneWorkers * 0.2 * mountainMult * happiness);

  state.stone += stoneMined;
};
