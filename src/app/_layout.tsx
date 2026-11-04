import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEffect, useRef, useState } from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '../components/app-tabs';

SplashScreen.preventAutoHideAsync();

const BACKGROUND_MUSIC = require('../../assets/audios/background_music_4.mp3');
const BACKGROUND_MUSIC_PAUSE_MS = 1200;

function BackgroundMusic() {
  const player = useAudioPlayer(BACKGROUND_MUSIC);
  const status = useAudioPlayerStatus(player);
  const replayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const replayScheduled = useRef(false);
  const hasStarted = useRef(false);
  const [audioModeReady, setAudioModeReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    void setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
    })
      .then(() => {
        if (isMounted) {
          setAudioModeReady(true);
        }
      })
      .catch((error: unknown) => {
        console.error('Failed to configure background music', error);
      });

    return () => {
      isMounted = false;
      if (replayTimer.current !== null) {
        clearTimeout(replayTimer.current);
      }
      player.pause();
    };
  }, [player]);

  useEffect(() => {
    if (!audioModeReady || !status.isLoaded || hasStarted.current) return;

    hasStarted.current = true;
    player.play();
  }, [audioModeReady, player, status.isLoaded]);

  useEffect(() => {
    if (!status.didJustFinish) {
      replayScheduled.current = false;
      return;
    }

    if (replayScheduled.current) return;
    replayScheduled.current = true;
    replayTimer.current = setTimeout(() => {
      replayTimer.current = null;
      void player.seekTo(0)
        .then(() => player.play())
        .catch((error: unknown) => {
          console.error('Failed to replay background music', error);
        });
    }, BACKGROUND_MUSIC_PAUSE_MS);
  }, [player, status.didJustFinish]);

  return null;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <BackgroundMusic />
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}
