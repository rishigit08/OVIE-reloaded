import {
  HindVadodara_400Regular,
  HindVadodara_500Medium,
  HindVadodara_600SemiBold,
  HindVadodara_700Bold,
} from '@expo-google-fonts/hind-vadodara';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import { ChatPanel } from '@/components/ChatPanel';
import { colors } from '@/lib/theme';

export default function RootLayout() {
  const [loaded] = useFonts({
    HindVadodara_400Regular,
    HindVadodara_500Medium,
    HindVadodara_600SemiBold,
    HindVadodara_700Bold,
  });

  if (!loaded) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="policy/[id]" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="document" />
        <Stack.Screen
          name="upload"
          options={{
            presentation: 'formSheet',
            sheetAllowedDetents: [0.9],
            sheetGrabberVisible: true,
            sheetCornerRadius: 28,
            contentStyle: { backgroundColor: colors.surface },
          }}
        />
        <Stack.Screen
          name="files-filter"
          options={{
            presentation: 'formSheet',
            sheetAllowedDetents: [0.68],
            sheetGrabberVisible: true,
            sheetCornerRadius: 28,
            contentStyle: { backgroundColor: colors.surface },
          }}
        />
        <Stack.Screen
          name="source"
          options={{
            presentation: 'formSheet',
            sheetAllowedDetents: [0.7, 1],
            sheetGrabberVisible: true,
            sheetCornerRadius: 28,
            contentStyle: { backgroundColor: colors.surface },
          }}
        />
        <Stack.Screen
          name="asset"
          options={{
            presentation: 'formSheet',
            sheetAllowedDetents: [0.6, 1],
            sheetGrabberVisible: true,
            sheetCornerRadius: 28,
            contentStyle: { backgroundColor: colors.surface },
          }}
        />
        <Stack.Screen
          name="documents"
          options={{
            presentation: 'formSheet',
            sheetAllowedDetents: [0.5, 0.8],
            sheetGrabberVisible: true,
            sheetCornerRadius: 28,
            contentStyle: { backgroundColor: colors.surface },
          }}
        />
        <Stack.Screen
          name="section"
          options={{
            presentation: 'formSheet',
            sheetAllowedDetents: [0.8, 1],
            sheetGrabberVisible: true,
            sheetCornerRadius: 28,
            contentStyle: { backgroundColor: colors.surface },
          }}
        />
      </Stack>
      <ChatPanel />
    </>
  );
}
