// Need to handle this based on language settings later
import flavorText from "../locales/en/flavorText.json";

export const happinessFlavorText = (happiness: number) => {
  if (happiness < 0.4) {
    return flavorText.lowMorale[
      Math.floor(Math.random() * flavorText.lowMorale.length)
    ];
  } else {
    return flavorText.highMorale[
      Math.floor(Math.random() * flavorText.highMorale.length)
    ];
  }
};
