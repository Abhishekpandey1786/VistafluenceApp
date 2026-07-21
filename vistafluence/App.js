import React, { useContext } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AuthContext, AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/context/Themecontext';
import { SocketProvider } from './src/context/Socketcontext';

function SocketBridge({ children }) {
  const { user, token } = useContext(AuthContext);
  const userId = user?._id || user?.id || null;

  return <SocketProvider userId={token ? userId : null}>{children}</SocketProvider>;
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