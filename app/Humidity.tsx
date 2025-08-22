import React from "react";
import { Text } from "react-native";
import { DataPage } from "./Components";

const B = (props: any) => <Text style={{fontWeight: 'bold'}}>{props.children}</Text>

export default function Page() {
    return <DataPage title="Humedad" topic="humidity/history" color="#0000ff"/>
}