import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import mqtt, { MqttClient, MqttProtocol } from "mqtt";

type MessageMap = Record<string, string>;

interface MqttContextType {
    messages: MessageMap;
    publish: (topic: string, message: string, options: mqtt.IClientPublishOptions) => void;
    connected: boolean;
}

const MqttContext = createContext<MqttContextType>({
    messages: {},
    publish: () => { },
    connected: false,
});

export const MqttProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [messages, setMessages] = useState<MessageMap>({});
    const [connected, setConnected] = useState(false);
    const clientRef = useRef<MqttClient | null>(null);

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

    useEffect(() => {
        const client = mqtt.connect(`wss://${host}:8884/mqtt`, options);

        clientRef.current = client;

        client.on("connect", () => {
            setConnected(true);

            // Subscribe to all topics here
            client.subscribe("#");
        });

        client.on("reconnect", () => setConnected(false));
        client.on("close", () => setConnected(false));
        client.on("error", (err) => {
            console.error("MQTT error", err);
        });

        client.on("message", (topic, payload) => {
            setMessages((prev) => ({
                ...prev,
                [topic]: payload.toString(), // Or keep as Buffer if you need
            }));
        });

        return () => {
            client.end(true);
        };
    }, []);

    const publish = (topic: string, message: string, options: mqtt.IClientPublishOptions) => {
        if (clientRef.current && connected) {
            clientRef.current.publish(topic, message, options);
        }
    };

    return (
        <MqttContext.Provider value={{ messages, publish, connected }}>
            {children}
        </MqttContext.Provider>
    );
};

export const useMqtt = () => useContext(MqttContext);
