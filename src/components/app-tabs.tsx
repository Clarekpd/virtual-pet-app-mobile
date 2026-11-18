import { Slot } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAudioPlayback } from '@/components/audio-playback-provider';
import { Colors } from '@/constants/theme';

type NotificationPreference = 'all' | 'positive' | 'none';

function VolumeSlider({
  label,
  value,
  onChange,
  textColor,
  secondaryColor,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  textColor: string;
  secondaryColor: string;
}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => {
      if (trackWidth > 0) {
        onChange(Math.max(0, Math.min(1, event.nativeEvent.locationX / trackWidth)));
      }
    },
    onPanResponderMove: (event) => {
      if (trackWidth > 0) {
        onChange(Math.max(0, Math.min(1, event.nativeEvent.locationX / trackWidth)));
      }
    },
    onPanResponderTerminationRequest: () => false,
  }), [trackWidth, onChange]);

  return (
    <View style={styles.sliderSection}>
      <View style={styles.sliderHeading}>
        <Text style={[styles.sliderLabel, { color: textColor }]}>{label}</Text>
        <Text style={[styles.sliderValue, { color: secondaryColor }]}>
          {Math.round(value * 100)}%
        </Text>
      </View>
      <View
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        accessibilityLabel={`${label} volume`}
        accessibilityRole="adjustable"
        accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === 'increment') {
            onChange(Math.min(1, value + 0.05));
          } else if (event.nativeEvent.actionName === 'decrement') {
            onChange(Math.max(0, value - 0.05));
          }
        }}
        onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
        style={styles.sliderTouchArea}
        {...panResponder.panHandlers}>
        <View style={[styles.sliderTrack, { backgroundColor: secondaryColor }]}>
          <View style={[styles.sliderFill, { width: `${value * 100}%` }]} />
        </View>
        <View style={[styles.sliderThumb, { left: `${value * 100}%` }]} />
      </View>
    </View>
  );
}

export default function AppTabs() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { audioVolumes, setAudioVolumes } = useAudioPlayback();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [draftVolumes, setDraftVolumes] = useState(audioVolumes);
  const [notificationPreference, setNotificationPreference] =
    useState<NotificationPreference>('positive');
  const [draftNotificationPreference, setDraftNotificationPreference] =
    useState<NotificationPreference>('positive');

  const openSettings = () => {
    setDraftVolumes(audioVolumes);
    setDraftNotificationPreference(notificationPreference);
    setSettingsVisible(true);
  };

  const cancelSettings = () => {
    setDraftVolumes(audioVolumes);
    setDraftNotificationPreference(notificationPreference);
    setSettingsVisible(false);
  };

  const saveSettings = () => {
    setAudioVolumes(draftVolumes);
    setNotificationPreference(draftNotificationPreference);
    setSettingsVisible(false);
  };

  const notificationChoices: { label: string; value: NotificationPreference }[] = [
    { label: 'All', value: 'all' },
    { label: 'Positive only', value: 'positive' },
    { label: 'None', value: 'none' },
  ];

  return (
    <View style={styles.root}>
      <Slot />
      <View style={[styles.gearAnchor, { top: insets.top + 8 }]}>
        <Pressable
          accessibilityLabel={settingsVisible ? 'Close settings' : 'Open settings'}
          accessibilityRole="button"
          onPress={settingsVisible ? cancelSettings : openSettings}
          style={({ pressed }) => [
            styles.gearButton,
            { backgroundColor: colors.backgroundElement, borderColor: colors.textSecondary },
            pressed && styles.pressed,
          ]}>
          <Text style={styles.gearEmoji}>⚙️</Text>
        </Pressable>
      </View>
      <Modal
        animationType="fade"
        onRequestClose={cancelSettings}
        transparent
        visible={settingsVisible}>
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityLabel="Close settings"
            onPress={cancelSettings}
            style={styles.modalBackdrop}
          />
          <View
            accessibilityViewIsModal
            style={[
              styles.settingsCard,
              { backgroundColor: colors.background, borderColor: colors.text },
            ]}>
            <View style={styles.header}>
              <Pressable
                accessibilityLabel="Close settings"
                accessibilityRole="button"
                onPress={cancelSettings}
                style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
                <Text style={styles.closeLabel}>×</Text>
              </Pressable>
              <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
              <View style={styles.headerSpacer} />
            </View>

            <VolumeSlider
              label="Music"
              onChange={(music) => setDraftVolumes((previous) => ({ ...previous, music }))}
              secondaryColor={colors.textSecondary}
              textColor={colors.text}
              value={draftVolumes.music}
            />
            <VolumeSlider
              label="Pet sounds"
              onChange={(sounds) => setDraftVolumes((previous) => ({ ...previous, sounds }))}
              secondaryColor={colors.textSecondary}
              textColor={colors.text}
              value={draftVolumes.sounds}
            />

            <View style={styles.notificationsSection}>
              <Text style={[styles.sliderLabel, { color: colors.text }]}>Notifications</Text>
              <View style={styles.notificationChoices}>
                {notificationChoices.map((choice) => {
                  const selected = draftNotificationPreference === choice.value;
                  return (
                    <Pressable
                      key={choice.value}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() => setDraftNotificationPreference(choice.value)}
                      style={({ pressed }) => [
                        styles.notificationButton,
                        {
                          backgroundColor: selected ? colors.backgroundSelected : colors.background,
                          borderColor: selected ? colors.text : colors.textSecondary,
                        },
                        pressed && styles.pressed,
                      ]}>
                      <Text style={[styles.notificationLabel, { color: colors.text }]}>
                        {choice.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                onPress={cancelSettings}
                style={({ pressed }) => [
                  styles.actionButton,
                  { borderColor: colors.textSecondary },
                  pressed && styles.pressed,
                ]}>
                <Text style={[styles.actionLabel, { color: colors.text }]}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={saveSettings}
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.saveButton,
                  pressed && styles.pressed,
                ]}>
                <Text style={[styles.actionLabel, styles.saveLabel]}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  gearAnchor: {
    position: 'absolute',
    left: 16,
    zIndex: 2,
  },
  gearButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 10,
  },
  gearEmoji: { fontSize: 24 },
  modalRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  settingsCard: {
    width: '100%',
    maxWidth: 400,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 22,
    borderWidth: 1,
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  closeButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EF5965',
    borderRadius: 9,
    backgroundColor: '#FFD4D7',
  },
  closeLabel: { color: '#D93645', fontSize: 30, lineHeight: 34 },
  title: { fontSize: 28, fontWeight: '700' },
  headerSpacer: { width: 38 },
  sliderSection: { marginBottom: 16 },
  sliderHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sliderLabel: { fontSize: 15, fontWeight: '600' },
  sliderValue: { fontSize: 13 },
  sliderTouchArea: {
    height: 34,
    justifyContent: 'center',
    marginHorizontal: 3,
  },
  sliderTrack: {
    height: 2,
    width: '100%',
    borderRadius: 1,
    opacity: 0.55,
  },
  sliderFill: {
    height: 2,
    borderRadius: 1,
    backgroundColor: '#EF5965',
  },
  sliderThumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    marginLeft: -8,
    borderWidth: 1.5,
    borderColor: '#222222',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  notificationsSection: { marginTop: 1 },
  notificationChoices: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 7,
    marginTop: 9,
  },
  notificationButton: {
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 8,
  },
  notificationLabel: { fontSize: 12, fontWeight: '500' },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 9,
  },
  saveButton: { borderColor: '#EF5965', backgroundColor: '#FFD4D7' },
  actionLabel: { fontSize: 14, fontWeight: '600' },
  saveLabel: { color: '#D93645' },
  pressed: { opacity: 0.7 },
});
