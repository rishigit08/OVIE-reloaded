import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { View } from 'react-native';

import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';

// Native tab bar: Liquid Glass on iOS 26, Material on Android.
// The web build uses the custom bar in _layout.web.tsx instead.
export default function TabsLayout() {
  const working = useStore((s) => s.uploads.filter((u) => u.status === 'working').length);
  const unseen = useStore((s) => s.unseenFiles);
  const badge = working + unseen;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <NativeTabs tintColor={colors.plum}>
        <NativeTabs.Trigger name="index" disableAutomaticContentInsets>
          <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="files" disableAutomaticContentInsets>
          <NativeTabs.Trigger.Icon sf={{ default: 'folder', selected: 'folder.fill' }} md="folder" />
          <NativeTabs.Trigger.Label>Files</NativeTabs.Trigger.Label>
          {badge > 0 ? <NativeTabs.Trigger.Badge>{String(badge)}</NativeTabs.Trigger.Badge> : null}
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="insights" disableAutomaticContentInsets>
          <NativeTabs.Trigger.Icon sf="sparkles" md="auto_awesome" />
          <NativeTabs.Trigger.Label>Insights</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="compare" disableAutomaticContentInsets>
          <NativeTabs.Trigger.Icon sf={{ default: 'rectangle.split.2x1', selected: 'rectangle.split.2x1.fill' }} md="compare" />
          <NativeTabs.Trigger.Label>Compare</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        {/* Moe gets the separated trailing slot on iOS 26, and is the fifth destination on Android. */}
        <NativeTabs.Trigger name="moe" role="search" disableAutomaticContentInsets>
          <NativeTabs.Trigger.Icon src={require('../../../assets/moe-tab.png')} renderingMode="original" />
          <NativeTabs.Trigger.Label>Moe</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </View>
  );
}
