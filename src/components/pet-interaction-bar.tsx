import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

export type PetAction = {
  id: string;
  label: string;
  response: string;
  color: string;
};

const ACTIONS: PetAction[] = [
  { id: 'feed', label: 'Feed', response: 'Yum!', color: '#E6A23C' },
  { id: 'play', label: 'Play', response: 'So fun!', color: '#62A99A' },
  { id: 'clean', label: 'Clean', response: 'All fresh!', color: '#6C9BCF' },
  { id: 'pet', label: 'Pet', response: 'Feeling loved!', color: '#D98080' },
  { id: 'nap', label: 'Nap', response: 'Sweet dreams!', color: '#8B86B8' },
  { id: 'treat', label: 'Treat', response: 'A special treat!', color: '#C48A55' },
];

type PetInteractionBarProps = {
  onDropAction: (action: PetAction, screenX: number, screenY: number) => void;
};

function ActionTile({
  action,
  onDropAction,
}: {
  action: PetAction;
  onDropAction: PetInteractionBarProps['onDropAction'];
}) {
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const gesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
    })
    .onUpdate((event) => {
      translationX.value = event.translationX;
      translationY.value = event.translationY;
    })
    .onEnd((event) => {
      runOnJS(onDropAction)(action, event.absoluteX, event.absoluteY);
    })
    .onFinalize(() => {
      translationX.value = withSpring(0);
      translationY.value = withSpring(0);
      isDragging.value = false;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translationX.value },
      { translateY: translationY.value },
      { scale: withSpring(isDragging.value ? 1.08 : 1) },
    ],
    zIndex: isDragging.value ? 2 : 0,
    elevation: isDragging.value ? 8 : 0,
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.tile, { borderColor: action.color }, animatedStyle]}>
        <View style={[styles.actionMark, { backgroundColor: action.color }]} />
        <Text style={styles.tileLabel}>{action.label}</Text>
      </Animated.View>
    </GestureDetector>
  );
}

export default function PetInteractionBar({ onDropAction }: PetInteractionBarProps) {
  return (
    <View style={styles.tray}>
      {[0, 1].map((row) => (
        <View key={row} style={styles.row}>
          {ACTIONS.slice(row * 3, row * 3 + 3).map((action) => (
            <ActionTile key={action.id} action={action} onDropAction={onDropAction} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tray: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 420,
    padding: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#464646',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  tile: {
    height: 36,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  actionMark: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tileLabel: {
    color: '#292929',
    fontSize: 13,
    fontWeight: '600',
  },
});