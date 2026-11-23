import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Light feedback on the native apps only; the web has no haptics.
const native = Platform.OS === 'ios' || Platform.OS === 'android';

export const haptic = {
  tap: () => native && void Haptics.selectionAsync().catch(() => {}),
  correct: () => native && void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}),
  wrong: () => native && void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {}),
};
