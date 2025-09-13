// app/(tabs)/_layout.tsx
import CheckInGate from '@/components/CheckInGate';
import Colors from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
  size?: number;
}) {
  return (
    <FontAwesome size={props.size ?? 28} style={{ marginBottom: -3 }} {...props} />
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 8);

  return (
    <>
      <CheckInGate />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.light.tint,
          tabBarInactiveTintColor: '#555',
          tabBarHideOnKeyboard: true,

          sceneContainerStyle: { backgroundColor: '#F2F4F7' },

          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 0,
            height: 70 + bottom,
            paddingBottom: bottom,
            paddingTop: 8,
          },

          tabBarLabelStyle: {
            fontSize: 16,
            fontWeight: '700',
          },
        }}
      >
        <Tabs.Screen
          name="emergency"
          options={{
            title: 'Emergência',
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="exclamation-circle" color={color} size={32} />
            ),
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'Tarefas',
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="list" color={color} size={32} />
            ),
          }}
        />
        <Tabs.Screen
          name="apps"
          options={{
            title: 'Apps',
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="th-large" color={color} size={32} />
            ),
            headerRight: () => (
              <Link href="/modal" asChild>
                <Pressable style={{ marginRight: 15 }}>
                  {({ pressed }) => (
                    <FontAwesome
                      name="info-circle"
                      size={28}
                      color={Colors.light.text}
                      style={{ opacity: pressed ? 0.5 : 1 }}
                    />
                  )}
                </Pressable>
              </Link>
            ),
          }}
        />
      </Tabs>
    </>
  );
}
