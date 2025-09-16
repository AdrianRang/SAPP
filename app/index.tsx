import type { LinkProps } from "expo-router";
import { Link } from "expo-router";
import React, { useState } from "react";
import { Image, Text, View } from "react-native";
import { MqttData, MqttGraph, PlantSelect } from "./Components";
import { useMqtt } from "./MqttProvider";

enum State {
  Optimal,
  SubOptimal,
  Error
}

function points(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    date: new Date(Date.now() - (count - i) * 3600 * 1000),
    value: Math.sin(i / 2) + Math.random() * 2,
  }));
}

function DataCard({ title, topic, color, state, link }: { title: string, topic: string, color: string, state: State, link: LinkProps["href"] }) {
  const { messages } = useMqtt();
  if (!messages[topic]) state = State.Error;

  let img;
  switch (state) {
    case State.Optimal:
      img = require('../assets/images/check.png')
      break;
    case State.SubOptimal:
      img = require('../assets/images/warning.png')
      break;
    case State.Error:
      img = require('../assets/images/error.png')
      break;
  }

  return (
    <Link href={link}>
      <View style={{ borderColor: 'black', borderStyle: 'solid', borderWidth: 1, borderRadius: 5, padding: 6, width: 150 }}>
        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontWeight: 'bold' }}>{title}</Text>
          <Image source={img} style={{ width: 13, height: 13 }} />
        </View>
        <MqttGraph topic={topic} color={color} style={{height: 40, marginTop: 10}}/>
      </View>
    </Link>
  )
}

export default function Index() {
  const [pick, setPick] = useState<string | undefined>(undefined)
  // const [humidity, setHumidity] = useState<number>()
  // const [humHistory, setHHistory] = useState<any>([{ date: new Date(), value: 0 }]);
  // const [light, setLight] = useState<number>()
  // const [lightHistory, setLightHistory] = useState<any>([{ date: new Date(), value: 0 }])
  // const [waterHistory, setWaterHistory] = useState<any>([{ date: new Date(), value: 0 }])
  const { messages } = useMqtt();

  const light = Math.floor(Number(messages['light-level/curr'])*100)||''
  const humHistory = (messages['humidity/history']||'').split(',', 70).filter((v) => v !== "").map((v) => {
    const sep = v.split(':');
    return { date: new Date(Number(sep[0])), value: Number(sep[1] || '5') };
  })
  const lightHistory = (messages['light-level/history']||'').split(',', 70).filter((v) => v !== "").map((v) => {
    const sep = v.split(':');
    return { date: new Date(Number(sep[0])), value: Number(sep[1] || '5') };
  })
  const waterHistory = (messages['water/history']||'').split(',', 70).filter((v) => v !== "").map((v) => {
    const sep = v.split(':');
    return { date: new Date(Number(sep[0])), value: Number(sep[1] || '5') };
  })

return (
  <View
    style={{
      flex: 1,
      // justifyContent: "space-between",
      alignItems: "center",
      flexDirection: "column",
      margin: 10,
    }}
  >
    <View style={{
      display: 'flex',
      justifyContent: "space-around",
      alignItems: "center",
      flexDirection: "row",
      width: '100%'
    }}>
      <View style={{ display: 'flex', alignItems: 'center', width: "20%" }}>
        <Image source={require("../assets/images/humidity.png")} style={{ width: 40, height: 56 }} />
        <MqttData topic="humidity/curr" style={{fontSize: 20}} transform={v=>Math.floor(Number(v))+'%'}/>
      </View>
      <Image source={require("../assets/images/plant.png")} style={{ width: 160, height: 250.102389072 }} />
      <View style={{ display: 'flex', alignItems: 'center', width: "20%" }}>
        <Image source={require("../assets/images/light.png")} style={{ width: 56, height: 56 }} />
        <MqttData topic="light-level/curr" style={{fontSize: 20}} transform={v=>Math.floor(Number(v)/100)/10+"k Lux"}/>
      </View>
    </View>
    <PlantSelect plant={pick} setPlant={setPick}/>
    <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
      <DataCard title="Humedad" topic="humidity/history" color="#0000ff" state={State.Optimal} link={'/Humidity'} />
      <DataCard title="Luz" topic="light-level/history" color="#FDD93B" state={!messages["light-level/alert"] ? State.Optimal : State.SubOptimal} link={'/Light'} />
      <DataCard title="Nivel del Agua" topic="water/history" color="#1ACDFF" state={!messages["low_water"] ? State.Optimal : State.SubOptimal} link={'/Water'} />
    </View>
    <Link href={'/_sitemap'}><Text>MQTT</Text></Link>
  </View>
);
}
