import {
  getPetNeedIndicatorColor,
  getPetNeedIndicatorFillColor,
  type PetNeed,
  type PetNeeds,
} from '@/constants/pet-status';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

export type PetAction = {
  id: string;
  label: string;
  response: string;
  color: string;
  need: PetNeed;
  recovery: number;
};

const ACTIONS: PetAction[] = [
  { id: 'feed', label: '🍖', response: 'Feed', color: '#E6A23C', need: 'hunger', recovery: 30 },
  { id: 'play', label: '🧸', response: 'Play', color: '#62A99A', need: 'happiness', recovery: 25 },
  { id: 'clean', label: '🧽', response: 'Clean', color: '#6C9BCF', need: 'cleanliness', recovery: 30 },
  { id: 'pet', label: '❤️', response: 'Pet', color: '#D98080', need: 'happiness', recovery: 15 },
  { id: 'nap', label: '💤', response: 'Nap', color: '#8B86B8', need: 'energy', recovery: 30 },
  { id: 'treat', label: '🥞', response: 'Treat', color: '#C48A55', need: 'hunger', recovery: 20 },
];

type PetInteractionBarProps = {
  onDropAction: (action: PetAction, screenX: number, screenY: number) => void;
  needs: PetNeeds;
};

function ActionTile({
  action,
  needValue,
  onDropAction,
}: {
  action: PetAction;
  needValue: number;
  onDropAction: PetInteractionBarProps['onDropAction'];
}) {
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const statusColor = getPetNeedIndicatorColor(needValue);
  const statusFillColor = getPetNeedIndicatorFillColor(needValue);

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
        <Text style={styles.tileLabel}>{action.label}</Text>
        <View
          pointerEvents="none"
          style={[
            styles.statusIndicator,
            { borderColor: statusColor, backgroundColor: statusFillColor },
          ]}
        />
      </Animated.View>
    </GestureDetector>
  );
}

export default function PetInteractionBar({ needs, onDropAction }: PetInteractionBarProps) {
  return (
    <View style={styles.tray}>
      {[0, 1].map((row) => (
        <View key={row} style={styles.row}>
          {ACTIONS.slice(row * 3, row * 3 + 3).map((action) => (
            <ActionTile
              key={action.id}
              action={action}
              needValue={needs[action.need]}
              onDropAction={onDropAction}
            />
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
    padding: 10,
    gap: 8,
    // borderWidth: 1,
    // borderColor: '#464646',
    borderRadius: 48,
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  tile: {
    height: 36,
    flex: 1,
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  statusIndicator: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: 12,
    height: 12,
    borderWidth: 1.5,
    transform: [{ rotate: '45deg' }],
  },
  tileLabel: {
    color: '#292929',
    fontSize: 13,
    fontWeight: '600',
  },
});