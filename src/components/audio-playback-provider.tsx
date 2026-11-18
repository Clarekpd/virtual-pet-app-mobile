import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from 'expo-audio';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  APP_AUDIO_MODE,
  BACKGROUND_MUSIC_LOOP,
  getPetAudioPlayer,
} from '@/constants/audio';

const BACKGROUND_MUSIC = require('../../assets/audios/background_music_4.mp3');
const LOVE_PLAY_AUDIO = require('../../assets/audios/audio_slime_love_play.mp3');
const SLEEP_CLEAN_AUDIO = require('../../assets/audios/audio_slime_sleep_clean.mp3');
const TREAT_FEED_AUDIO = require('../../assets/audios/audio_slime_treat_feed.mp3');

type ActiveSound = 'lovePlay' | 'sleepClean' | 'treatFeed';
export type AudioVolumes = {
  music: number;
  sounds: number;
};

type AudioPlaybackContextValue = {
  audioVolumes: AudioVolumes;
  playAction: (actionId: string) => void;
  setAudioVolumes: (volumes: AudioVolumes) => void;
};

const AudioPlaybackContext = createContext<AudioPlaybackContextValue | null>(null);
const DEFAULT_AUDIO_VOLUMES: AudioVolumes = { music: 1, sounds: 1 };

export function AudioPlaybackProvider({ children }: { children: ReactNode }) {
  const backgroundPlayer = useAudioPlayer(BACKGROUND_MUSIC);
  const lovePlayPlayer = useAudioPlayer(LOVE_PLAY_AUDIO);
  const sleepCleanPlayer = useAudioPlayer(SLEEP_CLEAN_AUDIO);
  const treatFeedPlayer = useAudioPlayer(TREAT_FEED_AUDIO);
  const backgroundStatus = useAudioPlayerStatus(backgroundPlayer);
  const lovePlayStatus = useAudioPlayerStatus(lovePlayPlayer);
  const sleepCleanStatus = useAudioPlayerStatus(sleepCleanPlayer);
  const treatFeedStatus = useAudioPlayerStatus(treatFeedPlayer);
  const [audioModeReady, setAudioModeReady] = useState(false);
  const [backgroundShouldPlay, setBackgroundShouldPlay] = useState(true);
  const [audioVolumes, setAudioVolumes] = useState(DEFAULT_AUDIO_VOLUMES);
  const activeSound = useRef<ActiveSound | null>(null);
  const playRequest = useRef(0);

  useEffect(() => {
    let isMounted = true;

    // AudioPlayer exposes looping as an imperative native-player setting.
    // eslint-disable-next-line react-hooks/immutability
    backgroundPlayer.loop = BACKGROUND_MUSIC_LOOP;
    void setAudioModeAsync(APP_AUDIO_MODE)
      .then(() => {
        if (isMounted) {
          setAudioModeReady(true);
        }
      })
      .catch((error: unknown) => {
        console.error('Failed to configure app audio', error);
      });

    return () => {
      isMounted = false;
      backgroundPlayer.pause();
      lovePlayPlayer.pause();
      sleepCleanPlayer.pause();
      treatFeedPlayer.pause();
    };
  }, [backgroundPlayer, lovePlayPlayer, sleepCleanPlayer, treatFeedPlayer]);

  useEffect(() => {
    if (audioModeReady && backgroundStatus.isLoaded && backgroundShouldPlay) {
      backgroundPlayer.play();
    }
  }, [audioModeReady, backgroundPlayer, backgroundShouldPlay, backgroundStatus.isLoaded]);

  useEffect(() => {
    // expo-audio exposes volume as an imperative AudioPlayer property.
    // eslint-disable-next-line react-hooks/immutability
    backgroundPlayer.volume = audioVolumes.music;
    // eslint-disable-next-line react-hooks/immutability
    lovePlayPlayer.volume = audioVolumes.sounds;
    // eslint-disable-next-line react-hooks/immutability
    sleepCleanPlayer.volume = audioVolumes.sounds;
    // eslint-disable-next-line react-hooks/immutability
    treatFeedPlayer.volume = audioVolumes.sounds;
  }, [
    audioVolumes.music,
    audioVolumes.sounds,
    backgroundPlayer,
    lovePlayPlayer,
    sleepCleanPlayer,
    treatFeedPlayer,
  ]);

  const resumeBackgroundMusic = useCallback(() => {
    activeSound.current = null;
    setBackgroundShouldPlay(true);
  }, []);

  useEffect(() => {
    if (activeSound.current === 'lovePlay' && lovePlayStatus.didJustFinish) {
      resumeBackgroundMusic();
    } else if (activeSound.current === 'sleepClean' && sleepCleanStatus.didJustFinish) {
      resumeBackgroundMusic();
    } else if (activeSound.current === 'treatFeed' && treatFeedStatus.didJustFinish) {
      resumeBackgroundMusic();
    }
  }, [
    lovePlayStatus.didJustFinish,
    resumeBackgroundMusic,
    sleepCleanStatus.didJustFinish,
    treatFeedStatus.didJustFinish,
  ]);

  const playAction = useCallback((actionId: string) => {
    const players = {
      lovePlay: lovePlayPlayer,
      sleepClean: sleepCleanPlayer,
      treatFeed: treatFeedPlayer,
    };
    const player = getPetAudioPlayer(actionId, players);
    if (!player) return;

    const nextSound: ActiveSound = player === lovePlayPlayer
      ? 'lovePlay'
      : player === sleepCleanPlayer
        ? 'sleepClean'
        : 'treatFeed';
    const requestId = ++playRequest.current;
    activeSound.current = null;
    setBackgroundShouldPlay(false);
    backgroundPlayer.pause();
    lovePlayPlayer.pause();
    sleepCleanPlayer.pause();
    treatFeedPlayer.pause();

    void player.seekTo(0)
      .then(() => {
        if (playRequest.current !== requestId) return;

        activeSound.current = nextSound;
        player.play();
      })
      .catch((error: unknown) => {
        if (playRequest.current !== requestId) return;

        console.error('Failed to play pet interaction audio', error);
        resumeBackgroundMusic();
      });
  }, [
    backgroundPlayer,
    lovePlayPlayer,
    resumeBackgroundMusic,
    sleepCleanPlayer,
    treatFeedPlayer,
  ]);

  const value = useMemo(
    () => ({ audioVolumes, playAction, setAudioVolumes }),
    [audioVolumes, playAction],
  );

  return (
    <AudioPlaybackContext.Provider value={value}>
      {children}
    </AudioPlaybackContext.Provider>
  );
}

export function useAudioPlayback() {
  const context = useContext(AudioPlaybackContext);
  if (!context) {
    throw new Error('useAudioPlayback must be used within AudioPlaybackProvider');
  }
  return context;
}
