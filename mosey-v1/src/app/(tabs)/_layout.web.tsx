import { Tabs } from 'expo-router';

import { TabBar } from '@/components/TabBar';
import { colors } from '@/lib/theme';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="files" options={{ title: 'Files' }} />
      <Tabs.Screen name="insights" options={{ title: 'Insights' }} />
      <Tabs.Screen name="compare" options={{ title: 'Compare' }} />
      <Tabs.Screen name="moe" options={{ title: 'Moe' }} />
    </Tabs>
  );
}
