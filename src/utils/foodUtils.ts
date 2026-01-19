import { GameState } from "@/types/game";

export const calculateTotalFood = (state: GameState): number => {
  return Math.floor(
    state.rations +
      state.berries +
      state.smallGame +
      state.largeGame +
      state.grain
  );
};

export const calculateFoodConsumption = (
  state: GameState,
  foodNeeded: number
): void => {
  let remaining = foodNeeded;

  // Consume in priority order: berries -> rations -> small game -> large game
  const berriesNeeded = Math.min(state.berries, Math.ceil(remaining / 0.3));
  state.berries = Math.max(0, state.berries - berriesNeeded);
  remaining -= berriesNeeded * 0.3;

  if (remaining > 0) {
    const rationsNeeded = Math.min(state.rations, Math.ceil(remaining / 1.0));
    state.rations = Math.max(0, state.rations - rationsNeeded);
    remaining -= rationsNeeded * 1.0;
  }

  if (remaining > 0) {
    const smallGameNeeded = Math.min(
      state.smallGame,
      Math.ceil(remaining / 0.8)
    );
    state.smallGame = Math.max(0, state.smallGame - smallGameNeeded);
    remaining -= smallGameNeeded * 0.8;
  }

  if (remaining > 0) {
    const largeGameNeeded = Math.min(
      state.largeGame,
      Math.ceil(remaining / 2.0)
    );
    state.largeGame = Math.max(0, state.largeGame - largeGameNeeded);
  }
};
