import { describe, expect, it } from 'vitest';
import {
  decayPetNeeds,
  getPetNeedIndicatorColor,
  getPetNeedIndicatorFillColor,
  INITIAL_PET_NEEDS,
  PET_NEED_CRITICAL_COLOR,
  PET_NEED_CRITICAL_FILL_COLOR,
  PET_NEED_HEALTHY_COLOR,
  PET_NEED_HEALTHY_FILL_COLOR,
  PET_NEED_WARNING_COLOR,
  PET_NEED_WARNING_FILL_COLOR,
  recoverPetNeed,
} from '../src/constants/pet-status';

describe('pet needs', () => {
  it('gradually decreases every need by one point per tick', () => {
    expect(decayPetNeeds(INITIAL_PET_NEEDS)).toEqual({
      hunger: 99,
      happiness: 99,
      cleanliness: 99,
      energy: 99,
    });
  });

  it('does not let needs fall below zero', () => {
    expect(decayPetNeeds({
      hunger: 0,
      happiness: 1,
      cleanliness: 0,
      energy: 0,
    })).toEqual({
      hunger: 0,
      happiness: 0,
      cleanliness: 0,
      energy: 0,
    });
  });

  it('recovers the selected need without exceeding 100', () => {
    expect(recoverPetNeed({ ...INITIAL_PET_NEEDS, hunger: 90 }, 'hunger', 30)).toEqual({
      ...INITIAL_PET_NEEDS,
      hunger: 100,
    });
  });

  it.each([
    [100, PET_NEED_HEALTHY_COLOR],
    [50, PET_NEED_HEALTHY_COLOR],
    [49, PET_NEED_WARNING_COLOR],
    [10, PET_NEED_WARNING_COLOR],
    [9, PET_NEED_CRITICAL_COLOR],
    [0, PET_NEED_CRITICAL_COLOR],
  ])('shows the correct indicator at %i%%', (value, color) => {
    expect(getPetNeedIndicatorColor(value)).toBe(color);
  });

  it.each([
    [100, PET_NEED_HEALTHY_FILL_COLOR],
    [50, PET_NEED_HEALTHY_FILL_COLOR],
    [49, PET_NEED_WARNING_FILL_COLOR],
    [10, PET_NEED_WARNING_FILL_COLOR],
    [9, PET_NEED_CRITICAL_FILL_COLOR],
    [0, PET_NEED_CRITICAL_FILL_COLOR],
  ])('fills the indicator with the matching color at %i%%', (value, color) => {
    expect(getPetNeedIndicatorFillColor(value)).toBe(color);
  });
});
