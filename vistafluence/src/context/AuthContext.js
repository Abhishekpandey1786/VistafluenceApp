import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); 
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); 
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('vistafluence_token');
        const storedUser = await AsyncStorage.getItem('vistafluence_user');

        if (storedToken) {
          setToken(storedToken);
        }
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.log("❌ Context Bootstrap Error:", e.message);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);
  const login = async (userToken, userData) => {
    try {
      setToken(userToken);
      setUser(userData); 
      if (userToken) {
        await AsyncStorage.setItem('vistafluence_token', userToken);
      }
      if (userData) {
        await AsyncStorage.setItem('vistafluence_user', JSON.stringify(userData));
      }
      console.log("🔒 CONTEXT ENGINE: Core authentication credentials synchronized successfully.");
    } catch (error) {
      console.log("❌ Context Storage Set Error:", error.message);
    }
  };
  const logout = async () => {
    try {
      setToken(null);
      setUser(null);
      await AsyncStorage.removeItem('vistafluence_token');
      await AsyncStorage.removeItem('vistafluence_user');
      console.log("🔑 CONTEXT ENGINE: Session terminated safely.");
    } catch (error) {
      console.log("❌ Logout Storage Clear Error:", error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);