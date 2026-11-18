export type PetNeed = 'hunger' | 'happiness' | 'cleanliness' | 'energy';
export type PetNeeds = Record<PetNeed, number>;

export const INITIAL_PET_NEEDS: PetNeeds = {
  hunger: 100,
  happiness: 100,
  cleanliness: 100,
  energy: 100,
};

export const PET_NEED_DECAY_INTERVAL_MS = 60_000;
export const PET_NEED_HEALTHY_COLOR = '#62A99A';
export const PET_NEED_WARNING_COLOR = '#F5B82E';
export const PET_NEED_CRITICAL_COLOR = '#F04438';
export const PET_NEED_HEALTHY_FILL_COLOR = '#DDF2EC';
export const PET_NEED_WARNING_FILL_COLOR = '#FFE9A8';
export const PET_NEED_CRITICAL_FILL_COLOR = '#FAD4D4';

function clampNeed(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function decayPetNeeds(needs: PetNeeds): PetNeeds {
  return {
    hunger: clampNeed(needs.hunger - 1),
    happiness: clampNeed(needs.happiness - 1),
    cleanliness: clampNeed(needs.cleanliness - 1),
    energy: clampNeed(needs.energy - 1),
  };
}

export function recoverPetNeed(needs: PetNeeds, need: PetNeed, amount: number): PetNeeds {
  return { ...needs, [need]: clampNeed(needs[need] + amount) };
}

export function getPetNeedIndicatorColor(value: number): string {
  if (value < 10) return PET_NEED_CRITICAL_COLOR;
  if (value < 50) return PET_NEED_WARNING_COLOR;
  return PET_NEED_HEALTHY_COLOR;
}

export function getPetNeedIndicatorFillColor(value: number): string {
  if (value < 10) return PET_NEED_CRITICAL_FILL_COLOR;
  if (value < 50) return PET_NEED_WARNING_FILL_COLOR;
  return PET_NEED_HEALTHY_FILL_COLOR;
}
