import { withLayoutContext } from 'expo-router';
import { createStackNavigator } from '@react-navigation/stack';

const JsStack = withLayoutContext(createStackNavigator().Navigator);

export default function AppLayout() {
  return (
    <JsStack
      detachInactiveScreens={false}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        cardStyle: { backgroundColor: '#f8fafc' },
        cardStyleInterpolator: ({ current, layouts }) => ({
          cardStyle: {
            opacity: current.progress,
            transform: [
              {
                translateX: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [layouts.screen.width * 0.16, 0],
                }),
              },
            ],
          },
        }),
        transitionSpec: {
          open: {
            animation: 'timing',
            config: { duration: 220 },
          },
          close: {
            animation: 'timing',
            config: { duration: 180 },
          },
        },
      }}
    />
  );
}
