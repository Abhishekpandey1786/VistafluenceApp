import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/context/Themecontext';
import { SocketProvider } from './src/context/Socketcontext';
import { api } from './src/api/index';

function SocketBridge({ children }) {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    let mounted = true;

    const resolveUserId = async () => {
      try {
        const token = await AsyncStorage.getItem('vistafluence_token');
        if (!token) {
          console.log('SOCKET BRIDGE: no token yet, skipping getMe()');
          return;
        }

        const res = await api.getMe();
        // console.log('SOCKET BRIDGE: getMe() response ->', JSON.stringify(res));

        if (!mounted) return;
        const id =
          res?.user?._id ||
          res?.data?._id ||
          res?._id ||
          res?.user?.id ||
          null;

        if (id) {
          console.log('SOCKET BRIDGE: resolved userId ->', id);
          setUserId(id);
        } else {
          console.log('SOCKET BRIDGE: could not find an id in getMe() response');
        }
      } catch (err) {
        console.log('SOCKET BRIDGE ERROR:', err?.message || err);
      }
    };

    resolveUserId();

    const interval = setInterval(() => {
      if (!userId) resolveUserId();
    }, 3000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [userId]);

  return <SocketProvider userId={userId}>{children}</SocketProvider>;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <SocketBridge>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </SocketBridge>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}