import PetInteractionBar, { PetAction } from '@/components/pet-interaction-bar';
import { Colors } from '@/constants/theme';
import { Canvas, Image, useAnimatedImageValue } from '@shopify/react-native-skia';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, useColorScheme, useWindowDimensions, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Easing, useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';

const BASE_GIF = require('../../assets/pets/slime_base.gif');
const REACTION_GIF_DELAY_MS = 300;

const REACTION_GIFS: Record<string, { source: number; durationMs: number }> = {
  feed: { source: require('../../assets/pets/slime_feed.gif'), durationMs: 4950 },
  play: { source: require('../../assets/pets/slime_play.gif'), durationMs: 4050 },
  treat: { source: require('../../assets/pets/slime_treat.gif'), durationMs: 4950 },
  sleep: { source: require('../../assets/pets/slime_sleep.gif'), durationMs: 5850 },
  clean: { source: require('../../assets/pets/slime_clean.gif'), durationMs: 5400 },
  pet: { source: require('../../assets/pets/slime_pet.gif'), durationMs: 4050 },
};

function getReactionGif(text: string | undefined) {
  const reactionText = text?.trim().toLowerCase();
  return REACTION_GIFS[reactionText === 'nap' ? 'sleep' : reactionText ?? ''];
}

function PetAnimation({
  source,
  x,
  y,
}: {
  source: number;
  x: SharedValue<number>;
  y: SharedValue<number>;
}) {
  const image = useAnimatedImageValue(source);

  return <Image image={image} x={x} y={y} width={64} height={48} />;
}

const App = () => {
  const { width, height } = useWindowDimensions();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];


  const x = useSharedValue(Math.max((width - 64) / 2, 0));
  const y = useSharedValue(Math.max((height - 48) / 2, 0));
  const canvasRef = useRef<View>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [reaction, setReaction] = useState<{ id: number; text: string } | null>(null);
  const [gifReaction, setGifReaction] = useState<{ id: number; text: string } | null>(null);
  const reactionId = useRef(0);
  const reactionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reactionDelayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reactionGif = getReactionGif(gifReaction?.text);

  const handleDropAction = useCallback((action: PetAction, screenX: number, screenY: number) => {
    canvasRef.current?.measureInWindow((left, top, canvasWidth, canvasHeight) => {
      if (
        screenX < left || screenX > left + canvasWidth ||
        screenY < top || screenY > top + canvasHeight
      ) {
        return;
      }

      const petX = Math.max(0, Math.min(screenX - left - 32, canvasWidth - 64));
      const petY = Math.max(0, Math.min(screenY - top - 24, canvasHeight - 48));
      x.value = withTiming(petX, { duration: 450, easing: Easing.out(Easing.cubic) });
      y.value = withTiming(petY, { duration: 450, easing: Easing.out(Easing.cubic) });
      const nextReaction = { id: ++reactionId.current, text: action.response };
      setReaction(nextReaction);

      if (reactionTimer.current) clearTimeout(reactionTimer.current);
      if (reactionDelayTimer.current) clearTimeout(reactionDelayTimer.current);
      reactionDelayTimer.current = setTimeout(() => {
        setGifReaction(nextReaction);
        reactionTimer.current = setTimeout(() => {
          setReaction(null);
          setGifReaction(null);
        }, getReactionGif(nextReaction.text)?.durationMs ?? 1600);
      }, REACTION_GIF_DELAY_MS);
    });
  }, [x, y]);

  useEffect(() => () => {
    if (reactionTimer.current) clearTimeout(reactionTimer.current);
    if (reactionDelayTimer.current) clearTimeout(reactionDelayTimer.current);
  }, []);

  const movePet = useCallback(() => {
    const canvasWidth = canvasSize.width || width;
    const canvasHeight = canvasSize.height || height - 106;
    const nextX = Math.random() * Math.max(canvasWidth - 64, 0);
    const nextY = Math.random() * Math.max(canvasHeight - 48, 0);
    const interval = Math.random() * Math.max(10000, 6000);

    // Reanimated shared values are intentionally mutable animation state.
    // eslint-disable-next-line react-hooks/immutability
    x.value = withTiming(nextX, {
      duration: interval,
      easing: Easing.inOut(Easing.ease),
    });
    // eslint-disable-next-line react-hooks/immutability
    y.value = withTiming(nextY, {
      duration: interval,
      easing: Easing.inOut(Easing.ease),
    });
  }, [canvasSize, height, width, x, y]);

  useEffect(() => {
    movePet();
    const movementTimer = setInterval(movePet, Math.random() * Math.max(10250, 4000));
    return () => clearInterval(movementTimer);
  }, [movePet]);

  return (
    <GestureHandlerRootView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View
        ref={canvasRef}
        collapsable={false}
        onLayout={(event) => setCanvasSize(event.nativeEvent.layout)}
        style={styles.canvasArea}>
        <Canvas style={styles.canvas}>
          <PetAnimation
            key={gifReaction?.id ?? 'base'}
            source={reactionGif?.source ?? BASE_GIF}
            x={x}
            y={y}
          />
        </Canvas>
      </View>
      <PetInteractionBar onDropAction={handleDropAction} />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 10, paddingBottom: 24 },
  canvasArea: { flex: 1, position: 'relative' },
  canvas: { flex: 1, width: '100%' },
});

export default App;