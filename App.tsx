import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ScanPage from './screens/ScanPage';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Scanează QR">
        <Stack.Screen 
          name="Scanează QR" 
          component={ScanPage} 
          options={{ 
            headerShown: false, // Ascunde header-ul
            gestureEnabled: false // Dezactivează gesturile de navigare
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}