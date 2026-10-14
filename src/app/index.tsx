import PetInteractionBar, { PetAction } from '@/components/pet-interaction-bar';
import { Colors } from '@/constants/theme';
import { Canvas, Image, useAnimatedImageValue } from '@shopify/react-native-skia';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, useColorScheme, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Easing, runOnJS, useDerivedValue, useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';

const BASE_GIF = require('../../assets/pets/slime_base.gif');
const REACTION_GIF_DELAY_MS = 450;
const PET_WIDTH = 96;
const PET_HEIGHT = 72;

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
  fallback,
  x,
  y,
}: {
  source: number;
  fallback: ReturnType<typeof useAnimatedImageValue>;
  x: SharedValue<number>;
  y: SharedValue<number>;
}) {
  const image = useAnimatedImageValue(source);
  const visibleImage = useDerivedValue(() => image.value ?? fallback.value);

  return <Image image={visibleImage} x={x} y={y} width={PET_WIDTH} height={PET_HEIGHT} />;
}

const App = () => {
  const { width, height } = useWindowDimensions();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const x = useSharedValue(Math.max((width - PET_WIDTH) / 2, 0));
  const y = useSharedValue(Math.max((height - PET_HEIGHT) / 2, 0));
  const baseImage = useAnimatedImageValue(BASE_GIF);
  const canvasRef = useRef<View>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [reaction, setReaction] = useState<{ id: number; text: string } | null>(null);
  const [gifReaction, setGifReaction] = useState<{ id: number; text: string } | null>(null);
  const reactionId = useRef(0);
  const reactionGif = getReactionGif(gifReaction?.text);

  const startPetReaction = useCallback((nextReaction: { id: number; text: string }) => {
    setReaction((previousReaction) => ({
      id: (previousReaction?.id ?? 0) + 1,
      text: nextReaction.text,
    }));
    setGifReaction(null);
  }, []);

  const handleDoubleTap = useCallback((tapX: number, tapY: number) => {
    const targetX = Math.max(0, Math.min(tapX - PET_WIDTH / 2, canvasSize.width - PET_WIDTH));
    const targetY = Math.max(0, Math.min(tapY - PET_HEIGHT / 2, canvasSize.height - PET_HEIGHT));
    const nextReaction = { id: 0, text: 'Pet' };
    // Reanimated shared values are intentionally mutable animation state.
    // eslint-disable-next-line react-hooks/immutability
    x.value = withTiming(targetX, {
      duration: 450,
      easing: Easing.out(Easing.cubic),
    }, (finished) => {
        if (finished) runOnJS(startPetReaction)(nextReaction);
    });
    // Reanimated shared values are intentionally mutable animation state.
    // eslint-disable-next-line react-hooks/immutability
    y.value = withTiming(targetY, { duration: 450, easing: Easing.out(Easing.cubic) });
  }, [canvasSize, startPetReaction, x, y]);

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((event, success) => {
      if (success) runOnJS(handleDoubleTap)(event.x, event.y);
    });

  const handleDropAction = useCallback((action: PetAction, screenX: number, screenY: number) => {
    canvasRef.current?.measureInWindow((left, top, canvasWidth, canvasHeight) => {
      if (
        screenX < left || screenX > left + canvasWidth ||
        screenY < top || screenY > top + canvasHeight
      ) {
        return;
      }

      const petX = Math.max(0, Math.min(screenX - left - PET_WIDTH / 2, canvasWidth - PET_WIDTH));
      const petY = Math.max(0, Math.min(screenY - top - PET_HEIGHT / 2, canvasHeight - PET_HEIGHT));
      x.value = withTiming(petX, { duration: 450, easing: Easing.out(Easing.cubic) });
      y.value = withTiming(petY, { duration: 450, easing: Easing.out(Easing.cubic) });
      const nextReaction = { id: ++reactionId.current, text: action.response };
      setReaction(nextReaction);
      setGifReaction(null);
    });
  }, [x, y]);

  useEffect(() => {
    if (!reaction) return;

    const delayTimer = setTimeout(() => setGifReaction(reaction), REACTION_GIF_DELAY_MS);
    return () => clearTimeout(delayTimer);
  }, [reaction]);

  useEffect(() => {
    if (!gifReaction) return;

    const durationTimer = setTimeout(() => {
      setReaction(null);
      setGifReaction(null);
    }, getReactionGif(gifReaction.text)?.durationMs ?? 1600);
    return () => clearTimeout(durationTimer);
  }, [gifReaction]);

  const movePet = useCallback(() => {
    const canvasWidth = canvasSize.width || width;
    const canvasHeight = canvasSize.height || height - 106;
    const nextX = Math.random() * Math.max(canvasWidth - PET_WIDTH, 0);
    const nextY = Math.random() * Math.max(canvasHeight - PET_HEIGHT, 0);
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
      <GestureDetector gesture={doubleTap}>
        <View
        ref={canvasRef}
        collapsable={false}
        onLayout={(event) => setCanvasSize(event.nativeEvent.layout)}
        style={styles.canvasArea}>
        <Canvas style={styles.canvas}>
          <PetAnimation
            key={gifReaction?.id ?? 'base'}
            source={reactionGif?.source ?? BASE_GIF}
            fallback={baseImage}
            x={x}
            y={y}
          />
        </Canvas>
      </View>
      </GestureDetector>
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