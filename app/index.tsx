import React, { useEffect, useState } from "react";
import { Text, View, Image } from "react-native";
import Dropdown from 'react-native-input-select';
import { LineGraph } from 'react-native-graph'
import plantsData from '../assets/plants.json';
import { Link } from "expo-router";
import type { LinkProps } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import mqtt, { MqttProtocol } from "mqtt";

enum State {
  Optimal,
  SubOptimal,
  Error
}

function points(count: number) {
  return Array.from({ length: count }, (_, i) => ({
          date: new Date(Date.now() - (count - i) * 3600 * 1000),
          value: Math.sin(i/2) + Math.random()*2,
        }));
}

function DataCard({title, data, color, state, link}:{title: string, data: any, color: string, state: State, link: LinkProps["href"]}) {
  let img;
  switch(state) {
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
    <View style={{borderColor: 'black', borderStyle: 'solid', borderWidth:1, borderRadius: 5, padding:6, width:150}}>
      <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
        <Text style={{fontWeight: 'bold'}}>{title}</Text>
        <Image source={img} style={{width:13, height:13}}/>
      </View>
      <LineGraph
        points={data}
        color={color}
        animated={false}
        style={{ height: 40, marginTop: 10 }}
        />
    </View>
    </Link>
  )
}

export default function Index() {
  let selected = 'null';
  const [pick, setPick] = useState<string | undefined>(undefined)
  const [humidity, setHumidity] = useState<number>()
  const [humHistory, setHHistory] = useState<any>([{date: new Date(),value: 0}]);
  const [light, setLight] = useState<number>()
  const [lightHistory, setLightHistory] = useState<any>([{date: new Date(),value: 0}])
  const [waterHistory, setWaterHistory] = useState<any>([{date: new Date(),value: 0}])
  AsyncStorage.getItem('plant').then((v) => {selected=v||'none'; setPick(selected)})

  const plants = plantsData.plants.map((p) => {
    return {label: p.name, value: p.name}
  })

  useEffect(() => {
      const host = process.env.EXPO_PUBLIC_MQTT_HOST;
      const port = 8884;
      const clientId = 'expo-client-' + Math.random().toString(16).substr(2, 8);
      const topic = '#';
  
      const options = {
        host: host,
        port: port,
        protocol: "wss" as MqttProtocol,
        username: process.env.EXPO_PUBLIC_MQTT_USER,
        password: process.env.EXPO_PUBLIC_MQTT_PASS,
        clientId: clientId,
        rejectUnauthorized: false,
      };
  
      const client = mqtt.connect(`wss://${host}:8884/mqtt`, options);
  
      client.on('connect', () => {
        console.log('Connected to MQTT broker');
        client.subscribe(topic, (err) => {
          if (err) {
            alert('Subscription error: ' + err);
          } else {
             console.log('Subscribed to topic: '+ topic);
          }
        });
      });
  
      client.on('message', (topic, message) => {
        const msg = `${message.toString()}`;
        switch(topic) {
          case 'humidity/curr':
            setHumidity(Math.floor(Number(msg)*100));
            break;
          case 'light-level/curr':
            setLight(Math.floor(Number(msg)*100));
            break;
          case 'humidity/history':
            setHHistory(msg.split(',', 70).filter((v)=>v!=="").map((v)=>{
                if(v !== "") {
                    const sep = v.split(':');
                    return { date: new Date(Number(sep[0])), value: Number(sep[1]||'5')};
                } else {
                    alert(v)
                    return {date: new Date(), value: 0}
                }
            }))
            break;
          case 'light-level/history':
            setLightHistory(msg.split(',', 70).filter((v)=>v!=="").map((v)=>{
                if(v !== "") {
                    const sep = v.split(':');
                    return { date: new Date(Number(sep[0])), value: Number(sep[1]||'5')};
                } else {
                    alert(v)
                    return {date: new Date(), value: 0}
                }
            }))
            break;
            case 'water/history':
            setWaterHistory(msg.split(',', 70).filter((v)=>v!=="").map((v)=>{
                if(v !== "") {
                    const sep = v.split(':');
                    return { date: new Date(Number(sep[0])), value: Number(sep[1]||'5')};
                } else {
                    alert(v)
                    return {date: new Date(), value: 0}
                }
            }))
            break;
        }
      });
  
      client.on('error', (err) => {
        alert('MQTT error: '+ err);
      });

      client.on('disconnect', ()=>{
        alert('mqtt disconnected')
      })
  
      return () => {
        client.end();
      };
    }, []);
  

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
        <View style={{display: 'flex', alignItems: 'center'}}>
          <Image source={require("../assets/images/humidity.png")} style={{width: 40, height: 56}}/>
          <Text style={{fontSize: 20}}>{humidity}%</Text>
        </View>
        <Image source={require("../assets/images/plant.png")} style={{width: 160, height: 250.102389072}}/>
        <View style={{display: 'flex', alignItems: 'center'}}>
          <Image source={require("../assets/images/light.png")} style={{width: 56, height: 56}}/>
          <Text style={{fontSize: 20}}>{light}%</Text>
        </View>
      </View>
      <Dropdown
        label="Especie"
        placeholder="Selecciona una de las opciones..."
        options={plants}
        selectedValue={pick}
        onValueChange={(p)=>{setPick(p?.toString()); AsyncStorage.setItem('plant', p?.toString() || 'error')}}
        primaryColor={'green'}
        isSearchable={true}
        placeholderStyle={{color:'grey'}}
        />
        <View style={{display:'flex', flexDirection:'row', flexWrap:'wrap', gap: 10, justifyContent: 'center'}}>
          <DataCard title="Humedad" data={humHistory} color="#0000ff" state={State.Optimal} link={'/Humidity'}/>
          <DataCard title="Luz" data={lightHistory} color="#FDD93B" state={State.Error} link={'/Light'}/>
          <DataCard title="Nivel del Agua" data={waterHistory} color="#1ACDFF" state={State.SubOptimal} link={'/Water'}/> 
        </View>
        <Link href={'/_sitemap'}><Text>MQTT</Text></Link>
    </View>
  );
}
