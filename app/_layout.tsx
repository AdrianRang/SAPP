import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Settings } from "./Components";


export default function RootLayout() {
  return (
    <GestureHandlerRootView>
      <StatusBar style="dark"/>
      <Stack screenOptions={{headerRight: ()=><Settings/> }}>
        <Stack.Screen name="index" options={{title: 'SPOT'}}/>
        <Stack.Screen name="Humidity" options={{title: 'Humedad'}}/>
        <Stack.Screen name="Lang" options={{title: 'Choose Language'}}/>
      </Stack>
    </GestureHandlerRootView>
  )
}
