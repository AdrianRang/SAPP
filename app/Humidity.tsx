import mqtt, { MqttProtocol } from "mqtt";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { LineGraph } from "react-native-graph";
import { DataPage } from "./Components";

const B = (props: any) => <Text style={{fontWeight: 'bold'}}>{props.children}</Text>

export default function Page() {
    return <DataPage title="Humedad" topic="humidity/history" color="#0000ff"/>
}