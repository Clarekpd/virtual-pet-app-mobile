import { Href, Slot, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';

type TabDestination = {
  label: string;
  href: Href;
};

const TAB_DESTINATIONS: TabDestination[] = [];

export default function AppTabs() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const [menuOpen, setMenuOpen] = useState(false);

  const switchTab = (destination: TabDestination) => {
    router.navigate(destination.href);
    setMenuOpen(false);
  };

  return (
    <View style={styles.root}>
      <Slot />
      {menuOpen && (
        <Pressable
          accessibilityLabel="Close navigation menu"
          onPress={() => setMenuOpen(false)}
          style={styles.scrim}
        />
      )}
      <View style={[styles.menuAnchor, { top: insets.top + 8 }]}>
        <Pressable
          accessibilityLabel={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          accessibilityRole="button"
          onPress={() => setMenuOpen((open) => !open)}
          style={({ pressed }) => [
            styles.menuButton,
            { backgroundColor: colors.backgroundElement, borderColor: colors.textSecondary },
            pressed && styles.pressed,
          ]}>
          <View style={styles.hamburger}>
            <View style={[styles.hamburgerLine, { backgroundColor: colors.text }]} />
            <View style={[styles.hamburgerLine, { backgroundColor: colors.text }]} />
            <View style={[styles.hamburgerLine, { backgroundColor: colors.text }]} />
          </View>
        </Pressable>
        {menuOpen && (
          <View style={[styles.menu, { backgroundColor: colors.background, borderColor: colors.textSecondary }]}>
            {TAB_DESTINATIONS.length === 0 ? (
              <Text style={[styles.emptyLabel, { color: colors.textSecondary }]}>No tabs yet</Text>
            ) : (
              TAB_DESTINATIONS.map((destination) => (
                <Pressable
                  key={destination.label}
                  accessibilityRole="button"
                  onPress={() => switchTab(destination)}
                  style={({ pressed }) => [styles.destination, pressed && styles.pressed]}>
                  <Text style={[styles.destinationLabel, { color: colors.text }]}>
                    {destination.label}
                  </Text>
                </Pressable>
              ))
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrim: { ...StyleSheet.absoluteFill, zIndex: 1 },
  menuAnchor: {
    position: 'absolute',
    left: 16,
    zIndex: 2,
    alignItems: 'flex-start',
  },
  menuButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 10,
  },
  hamburger: { width: 20, gap: 4 },
  hamburgerLine: { height: 2, borderRadius: 1 },
  menu: {
    minWidth: 176,
    marginTop: 8,
    padding: 8,
    borderWidth: 1,
    borderRadius: 10,
  },
  emptyLabel: { paddingHorizontal: 10, paddingVertical: 8, fontSize: 14 },
  destination: { paddingHorizontal: 10, paddingVertical: 10, borderRadius: 6 },
  destinationLabel: { fontSize: 14, fontWeight: '600' },
  pressed: { opacity: 0.7 },
});