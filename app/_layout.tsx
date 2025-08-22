import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SettingsIcon } from "./Components";
import { MqttProvider } from "./MqttProvider";


export default function RootLayout() {
  return (
    <MqttProvider>
    <GestureHandlerRootView>
      <StatusBar style="dark"/>
      <Stack screenOptions={{headerRight: ()=><SettingsIcon/> }}>
        <Stack.Screen name="index" options={{title: 'SPOT'}}/>
        <Stack.Screen name="Settings" options={{title: 'Settings'}}/>
        <Stack.Screen name="Humidity" options={{title: 'Humedad', animation:'fade', animationDuration: 175}}/>
        <Stack.Screen name="Light" options={{title: 'Luz', animation:'fade', animationDuration: 175}}/>
        <Stack.Screen name="Water" options={{title: 'Nivel del Agua', animation:'fade', animationDuration: 175}}/>
      </Stack>
    </GestureHandlerRootView>
    </MqttProvider>
  )
}