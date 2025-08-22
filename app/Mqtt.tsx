import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import mqtt, { MqttProtocol } from 'mqtt';

export default function MQTT() {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const host = process.env.EXPO_PUBLIC_MQTT_HOST;
    const port = 8884;
    const clientId = 'expo-client-' + Math.random().toString(16).substr(2, 8);
    // const topic = 'humidity/history';

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

    const topics = [
      "humidity/history",
      "light-level/history",
      "water/history"
    ]

    topics.forEach((topic) => {
      let msg = "";
      let data = Array.from({ length: 50 }, (_, i) => ({
        date: Date.now() - (49 - i) * 3600 * 1000,
        value: (Math.sin(i/2.5)+1.5)/3 + (Math.random()-0.5)/3
      }))

      data.forEach((v)=>{
        msg+=v.date;
        msg+=":"
        msg+=v.value
        msg+=","
      })

      // msg=' ';

      client.publish(topic, msg, {retain: true})
    })

    // client.on('connect', () => {
    //   console.log('Connected to MQTT broker');
    //   client.subscribe(topic, (err) => {
    //     if (err) {
    //       alert('Subscription error: ' + err);
    //     } else {
    //        console.log('Subscribed to topic: '+ topic);
    //     }
    //   });
    // });

    client.on('message', (topic, message) => {
      const msg = `${new Date().toLocaleTimeString()}: ${message.toString()}`;
      setMessages(prev => [msg, ...prev]);
    });

    client.on('error', (err) => {
      alert('MQTT error: '+ err);
    });

    return () => {
      client.end();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MQTT Subscriber</Text>
      <ScrollView>
        {messages.map((msg, index) => (
          <Text key={index} style={styles.message}>{msg}</Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 48,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  message: {
    marginVertical: 4,
    fontSize: 16,
  },
});
