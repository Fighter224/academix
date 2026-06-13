import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../constants/theme';
import { useTheme } from '../hooks/ThemeContext';

// Import Screens
import FeedScreen from '../screens/FeedScreen';
import ThreadDetailScreen from '../screens/ThreadDetailScreen';
import GroupsScreen from '../screens/GroupsScreen';
import GroupChatScreen from '../screens/GroupChatScreen';
import DirectChatScreen from '../screens/DirectChatScreen';
import ChatConversationScreen from '../screens/ChatConversationScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack sub-navigators to support deep-linking detail layouts under active tabs
function FeedStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FeedHome" component={FeedScreen} />
      <Stack.Screen name="ThreadDetail" component={ThreadDetailScreen} />
    </Stack.Navigator>
  );
}

function RoomsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RoomsHome" component={GroupsScreen} />
      <Stack.Screen name="GroupChat" component={GroupChatScreen} />
    </Stack.Navigator>
  );
}

function MessagesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MessagesHome" component={DirectChatScreen} />
      <Stack.Screen name="ChatConversation" component={ChatConversationScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

function MainTabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'paper-plane-outline';

          if (route.name === 'Feed') {
            iconName = 'newspaper-outline';
          } else if (route.name === 'Rooms') {
            iconName = 'people-outline';
          } else if (route.name === 'Messages') {
            iconName = 'chatbubbles-outline';
          } else if (route.name === 'Hub') {
            iconName = 'apps-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 6,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: Theme.typography.weights.semibold,
        }
      })}
    >
      <Tab.Screen name="Feed" component={FeedStack} />
      <Tab.Screen name="Rooms" component={RoomsStack} />
      <Tab.Screen name="Messages" component={MessagesStack} />
      <Tab.Screen name="Hub" component={ProfileStack} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
