import { useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatBody } from '@/components/ChatPanel';
import { TAB_BAR_CLEARANCE, useFocused } from '@/components/ui';
import { colors } from '@/lib/theme';

/** Moe's own tab: the full chat, with past chats a tap away. */
export default function MoeTab() {
  const insets = useSafeAreaInsets();
  const focused = useFocused();
  const [typing, setTyping] = useState(false);
  // The native iOS tab screen already keeps some room above the bar, so less is needed here.
  const clearance = Platform.OS === 'ios' ? 6 : TAB_BAR_CLEARANCE;

  // The tab bar sits under the keyboard, so only clear it while the keyboard is down.
  useEffect(() => {
    const ios = Platform.OS === 'ios';
    const show = Keyboard.addListener(ios ? 'keyboardWillShow' : 'keyboardDidShow', () => setTyping(true));
    const hide = Keyboard.addListener(ios ? 'keyboardWillHide' : 'keyboardDidHide', () => setTyping(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.surface }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: typing ? 0 : insets.bottom + clearance }}>
        <ChatBody hero paused={!focused} />
      </View>
    </KeyboardAvoidingView>
  );
}
