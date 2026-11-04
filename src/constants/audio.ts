import type { AudioMode } from 'expo-audio';

export const APP_AUDIO_MODE: Pick<AudioMode, 'playsInSilentMode' | 'interruptionMode'> = {
  playsInSilentMode: true,
  interruptionMode: 'mixWithOthers',
};

export const BACKGROUND_MUSIC_LOOP = true;

type PetAudioPlayers<T> = {
  lovePlay: T;
  sleepClean: T;
  treatFeed: T;
};

export function getPetAudioPlayer<T>(
  actionId: string,
  players: PetAudioPlayers<T>,
): T | undefined {
  switch (actionId) {
    case 'play':
    case 'pet':
      return players.lovePlay;
    case 'nap':
    case 'clean':
      return players.sleepClean;
    case 'feed':
    case 'treat':
      return players.treatFeed;
    default:
      return undefined;
  }
}
