import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2f95dc',
      }}
    >
      <Tabs.Screen
        name="index" // This must match `index.tsx`
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="DetectScreen" // This must match `DetectScreen.tsx`
        options={{
          title: 'Detect',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="camera" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Explore" // This must match `Explore.tsx`
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="explore" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
