import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

import AuthNavigator from './AuthNavigator';
import InfluencerTabs from './InfluencerTabs';
import AdvertiserTabs from './AdvertiserTabs';
import AdminTabs from './AdminTabs';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="AuthFlow"      component={AuthNavigator}  />
      ) : user.role === 'admin' ? (
        <Stack.Screen name="AdminFlow"     component={AdminTabs}      />  
      ) : user.role === 'influencer' ? (
        <Stack.Screen name="InfluencerFlow" component={InfluencerTabs} />
      ) : (
        <Stack.Screen name="AdvertiserFlow" component={AdvertiserTabs} />
      )}
    </Stack.Navigator>
  );
}