import type { RNGestureHandlerGestureFactory } from '@wuba/react-native-echarts';

// Constrains the pan gesture to mostly-horizontal movement so a vertical
// scroll swipe fails fast and falls through to an ancestor ScrollView,
// https://github.com/wuba/react-native-echarts/issues/266

export const scrollFriendlyGesture: RNGestureHandlerGestureFactory = (defaultGestures, dispatchEvents) => {
  const [pan, pinch, tap] = defaultGestures;
  pan
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onFinalize((e: any) => {
      dispatchEvents(['mouseout'], e);
    });
  return [pan, pinch, tap];
};
