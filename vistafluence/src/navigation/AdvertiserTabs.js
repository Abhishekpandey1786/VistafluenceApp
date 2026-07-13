import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LayoutDashboard, PlusSquare, Users, MessageCircle, User,Bell } from 'lucide-react-native';

import AdvertiserDashboard from '../screens/advertiser/AdvertiserDashboard';
import CreateCampaignScreen from '../screens/advertiser/CreateCampaignScreen';
import ManageApplicationsScreen from '../screens/advertiser/ManageApplicationsScreen';
import AnalyticsScreen from '../screens/advertiser/AnalyticsScreen';
import BillingScreen from '../screens/advertiser/BillingScreen';
import ChatListScreen from '../screens/shared/ChatListScreen';
import ChatRoomScreen from '../screens/shared/ChatRoomScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import InfluencerPublicProfileScreen from '../screens/shared/InfluencerPublicProfileScreen';
import NotificationScreen from '../screens/shared/NotificationsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ChatStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatList" component={ChatListScreen} />
      <Stack.Screen name="ChatRoom" component={ChatRoomScreen} /> 
    </Stack.Navigator>
  );
}
// Ye naya stack add karo
function ApplicationsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ApplicationsList" component={ManageApplicationsScreen} />
      <Stack.Screen name="InfluencerPublicProfile" component={InfluencerPublicProfileScreen} />
    </Stack.Navigator>
  );
}

const TAB_BAR = {
  backgroundColor: '#1e293b',
  borderTopWidth: 0,
  height: 65,
  paddingBottom: 10,
};

export default function AdvertiserTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: TAB_BAR,
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: '#94a3b8',
      }}
    >
      <Tab.Screen name="Dashboard" component={AdvertiserDashboard}
        options={{ tabBarIcon: ({ color }) => <LayoutDashboard color={color} size={24} /> }} />
      <Tab.Screen name="Create" component={CreateCampaignScreen}
        options={{ tabBarIcon: ({ color }) => <PlusSquare color={color} size={28} /> }} />
      <Tab.Screen name="Applications" component={ApplicationsStack}
       options={{ tabBarIcon: ({ color }) => <Users color={color} size={24} /> }} />
      <Tab.Screen name="Chats" component={ChatStack}
        options={{ tabBarIcon: ({ color }) => <MessageCircle color={color} size={24} /> }} />
        <Tab.Screen
  name="Notifications"
  component={NotificationScreen}
  options={{
    tabBarIcon: ({ color }) => (
      <Bell color={color} size={24} />
    ),
  }}
/>
      <Tab.Screen name="Profile" component={ProfileScreen}
        options={{ tabBarIcon: ({ color }) => <User color={color} size={24} /> }} />
    </Tab.Navigator>
  );
}