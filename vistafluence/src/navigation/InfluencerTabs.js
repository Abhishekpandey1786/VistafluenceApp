import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { C } from '../theme/colors';

import FeedScreen from '../screens/influencer/FeedScreen';
import CampaignsScreen from '../screens/influencer/BrowseCampaignsScreen';
import CampaignDetailScreen from '../screens/influencer/CampaignDetailScreen';
import ApplyScreen from '../screens/influencer/ApplyScreen';
import ChatListScreen from '../screens/shared/ChatListScreen';
import ChatRoomScreen from '../screens/shared/ChatRoomScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import InfluencerProfileScreen from '../screens/influencer/InfluencerProfileScreen';
import BrandPublicProfileScreen from '../screens/shared/BrandPublicProfileScreen';
import InfluencerPublicProfileScreen from '../screens/shared/InfluencerPublicProfileScreen';
import EarningsScreen from '../screens/influencer/EarningsScreen';
import AcademyTabscreen from '../screens/influencer/AcademyTabscreen';
import SettingsScreen from '../screens/influencer/Settingsscreen';
import InviteFriendsScreen from '../screens/influencer/Invitefriendsscreen';
import DarkModeScreen from '../screens/influencer/Darkmodescreen';
import AboutScreen from '../screens/influencer/Aboutscreen';
import HelpSupportScreen from '../screens/influencer/Helpsupportscreen';
import TermsScreen from '../screens/influencer/Termsscreen';
import DisclaimerScreen from '../screens/influencer/Disclaimerscreen';
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabIcon = ({ emoji, label, focused }) => (
  <View style={{ alignItems: 'center', gap: 2 }}>
    <Text style={{ fontSize: 20 }}>{emoji}</Text>
    <Text style={{ fontSize: 9, color: focused ? C.teal : C.textMuted, fontWeight: focused ? '700' : '400' }}>
      {label}
    </Text>
  </View>
);

function FeedStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Feed" component={FeedScreen} />
      <Stack.Screen name="BrandPublicProfile" component={BrandPublicProfileScreen} />
      <Stack.Screen name="InfluencerPublicProfile" component={InfluencerPublicProfileScreen} />
      <Stack.Screen name="CampaignDetail" component={CampaignDetailScreen} />
      <Stack.Screen name="Apply" component={ApplyScreen} />
    </Stack.Navigator>
  );
}

function CampaignStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BrowseCampaigns" component={CampaignsScreen} />
      <Stack.Screen name="CampaignDetail" component={CampaignDetailScreen} />
      <Stack.Screen name="Apply" component={ApplyScreen} />
      <Stack.Screen name="BrandPublicProfile" component={BrandPublicProfileScreen} />
    </Stack.Navigator>
  );
}

function ChatStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatList" component={ChatListScreen} />
      <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InfluencerProfile" component={InfluencerProfileScreen} />
      <Stack.Screen name="Earnings" component={EarningsScreen} />
    </Stack.Navigator>
  );
}
function Settings() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsMain"   component={SettingsScreen}      />
      <Stack.Screen name="InviteFriends"  component={InviteFriendsScreen} />
      <Stack.Screen name="DarkMode"       component={DarkModeScreen}      />
      <Stack.Screen name="About"          component={AboutScreen}         />
      <Stack.Screen name="HelpSupport"    component={HelpSupportScreen}   />
      <Stack.Screen name="Terms"          component={TermsScreen}         />
      <Stack.Screen name="Disclaimer"     component={DisclaimerScreen}    />
    </Stack.Navigator>
  );
}

export default function InfluencerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}
    >
      <Tab.Screen name="HomeTab" component={FeedStack}
        options={{ tabBarButton: () => null }} />
      <Tab.Screen name="CampaignsTab" component={CampaignStack}
        options={{ tabBarButton: () => null }} />
      <Tab.Screen name="ChatsTab" component={ChatStack}
        options={{ tabBarButton: () => null }} />
      <Tab.Screen name="AcademyTab" component={AcademyTabscreen}
        options={{ tabBarButton: () => null }} />
      <Tab.Screen name="ProfileTab" component={ProfileStack}
        options={{ tabBarButton: () => null }} />
      <Tab.Screen name="SettingsTab" component={Settings}
        options={{ tabBarButton: () => null }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen}
        options={{ tabBarButton: () => null }} />
    </Tab.Navigator>
    
  );
}