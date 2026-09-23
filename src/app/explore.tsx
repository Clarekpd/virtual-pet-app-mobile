import { Canvas, Image, matchFont, useImage } from "@shopify/react-native-skia";
import { Platform, useWindowDimensions } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { Easing, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";

const App = () => {
  const { width, height } = useWindowDimensions();

  const fontFamily = Platform.select({ ios: "Helvetica", default: "serif" });
  const fontStyle = {
    fontFamily,
    fontSize: 14,
    fontStyle: "italic",
    fontWeight: "bold",
  };
  const font = matchFont(fontStyle);

  const pet_base = useImage(require('../../assets/pets/slime_base.png'));
  const pet_big = useImage(require('../../assets/pets/slime_big.png'));
  const pet_talk = useImage(require('../../assets/pets/slime_mouth_open.png'));

  const x = useSharedValue(width / 2);
  const y = useSharedValue(height / 2);

  const gesture = Gesture.Tap().onStart(() => {
    const randomX = (Math.random() - 0.5) * 50;
    const randomY = (Math.random() - 0.5) * 50;

    if (x.value + randomX > 0 && x.value + randomX < width - 64) {
      x.value = withRepeat(
        withSequence(
          withTiming(x.value = (x.value + randomX), { duration: 500, easing: Easing.linear })
        ),
        -1,
        true
      );
    }

    if (y.value + randomY > 0 && y.value + randomY < height - 24) {
      y.value = withRepeat(
        withSequence(
          withTiming(y.value = (y.value + randomY), { duration: 500, easing: Easing.linear })
        ),
        -1,
        true
      );
    }

  });


  return (

    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={gesture}>
        <Canvas style={{ width, height }}>
          {/* pet */}
          <Image image={pet_base} x={x} y={y} width={64} height={48} />
        </Canvas>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

export default App;