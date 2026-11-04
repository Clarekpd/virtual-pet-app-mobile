import { describe, expect, it } from 'vitest';
import { APP_AUDIO_MODE, BACKGROUND_MUSIC_LOOP, getPetAudioPlayer } from '../src/constants/audio';

describe('pet audio playback', () => {
  const players = {
    lovePlay: { id: 'love-play' },
    sleepClean: { id: 'sleep-clean' },
    treatFeed: { id: 'treat-feed' },
  };
  const actions = [
    { actionId: 'pet', player: 'lovePlay' },
    { actionId: 'play', player: 'lovePlay' },
    { actionId: 'clean', player: 'sleepClean' },
    { actionId: 'nap', player: 'sleepClean' },
    { actionId: 'feed', player: 'treatFeed' },
    { actionId: 'treat', player: 'treatFeed' },
  ] as const;

  it('allows audio to mix with other apps', () => {
    expect(APP_AUDIO_MODE).toEqual({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
    });
  });

  it('loops the background track continuously', () => {
    expect(BACKGROUND_MUSIC_LOOP).toBe(true);
  });

  it.each(actions)('selects the $player player for $actionId', ({ actionId, player }) => {
    expect(getPetAudioPlayer(actionId, players)).toBe(players[player]);
  });

  it('does not select a player for an unknown action', () => {
    expect(getPetAudioPlayer('unknown', players)).toBeUndefined();
  });
});
