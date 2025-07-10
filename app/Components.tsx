import { Link } from "expo-router";
import mqtt, { MqttProtocol } from "mqtt";
import React, { useEffect, useState } from "react";
import { Image, Text, View } from "react-native";
import { LineGraph } from "react-native-graph";

const B = (props: any) => <Text style={{fontWeight: 'bold'}}>{props.children}</Text>

export function Settings() {
    return (
    <Link href={'/Settings'}>
        <Image source={require('../assets/images/settings.png')} style={{width: 30, height: 30}}/>
    </Link>
    )
}

export function DataPage({title, topic, color}:{title:string, topic: string, color: string}) {
    const [ percent, setPercent ] = useState(0)
    const [ history, setHistory ] = useState<any>([{date: new Date(),value: 0}]);
    const [ average, setAverage ] = useState(0);

    useEffect(() => {
         const host = process.env.EXPO_PUBLIC_MQTT_HOST;
          const port = 8884;
          const clientId = 'expo-client-' + Math.random().toString(16).substr(2, 8);
      
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
            let sum = 0;
            setHistory(msg.split(',', 70).filter((v)=>v!=="").map((v)=>{
                if(v !== "") {
                    const sep = v.split(':');
                    sum+=Number(sep[1])
                    return { date: new Date(Number(sep[0])), value: Number(sep[1]||'5')};
                } else {
                    alert(v)
                    return {date: new Date(), value: 0}
                }
            }))
            // setPercent(history[0].value)
            setAverage(sum/msg.split(',', 70).length)
            // alert(history.toString())
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
        <View style={{
            flex: 1,
            alignItems: "center",
            flexDirection: "column",
            margin: 10,
        }}>
            <Text style={{fontSize: 50}}>{title}</Text>
            <LineGraph
            points={history}
            color={color}
            animated
            enablePanGesture
            enableIndicator
            onPointSelected={(p) => setPercent(p.value)}
            onGestureEnd={() => setPercent(history[history.length-1].value)}
            style={{ height: 100, marginTop: 10, width: "100%", transform: 'translateX(-30px)'}}
            />
            <View style={{height: 30}}/>
            <Text style={{fontSize: 50, fontWeight: "900"}}>{Math.floor(percent*100)}%</Text>
            <View style={{height: 50}}/>
            <Text>
                La humedad optima es de <B>50%</B>. La humedad promedio es del <B>{Math.floor(average*100)}%</B>.
            </Text>
        </View>
    )
}