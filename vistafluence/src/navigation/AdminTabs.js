import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';

import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminCampaignsScreen from '../screens/admin/AdminCampaignsScreen';
import AdminApplicationsScreen from '../screens/admin/AdminApplicationsScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';
import AdminAcademyScreen from '../screens/admin/AdminAcademyScreen';
import AdminBroadcastScreen from '../screens/admin/AdminBroadcastScreen';

const Tab = createBottomTabNavigator();

const TabIcon = ({ name, focused }) => {
  const icons = {
    Dashboard: '⊞',
    Users: '👥',
    Campaigns: '📢',
    Applications: '📋',
     Accedemy: '🎓',
  Notification: '🔔',
    Settings: '⚙️',
  };
  return (
    <View style={styles.iconWrap}>
      <Text style={[styles.iconText, focused && styles.iconActive]}>{icons[name]}</Text>
    </View>
  );
};

export default function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarActiveTintColor: '#7c3aed',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
      <Tab.Screen name="Users" component={AdminUsersScreen} />
      <Tab.Screen name="Campaigns" component={AdminCampaignsScreen} />
      <Tab.Screen name="Applications" component={AdminApplicationsScreen} />
      <Tab.Screen name="Accedemy" component={AdminAcademyScreen} />
      <Tab.Screen name='Notification' component={AdminBroadcastScreen}/>
      <Tab.Screen name="Settings" component={AdminSettingsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#1a1d23',
    borderTopColor: '#2d3140',
    borderTopWidth: 0.5,
    height: 60,
    paddingBottom: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
    opacity: 0.5,
  },
  iconActive: {
    opacity: 1,
  },
});