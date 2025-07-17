import React, { ReactNode, useState } from "react";
import { View, Text, Image, TextInput, StyleSheet, Button } from "react-native";
import Dropdown from 'react-native-input-select';
import { NumberInput, TabBar, Tab, Card, PlantSelect, RemeberNumberInput } from "./components";
import plantsData from '../assets/plants.json';
import AsyncStorage from "@react-native-async-storage/async-storage";

function System() {
    const [language, setLanguage] = useState('ES')
    const [water, setWater] = useState(15);

    return (
        <View style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            padding: 10,
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <Dropdown label="Lenguaje" placeholder="Selecciona una de las opciones..." options={[
                {label: 'Español', value: 'ES'},
                // {label: 'English', value: 'EN'},
                // {label: 'Français', value: 'FR'},
                // {label: 'Deutsch', value: 'DE'},
                // {label: 'Italiano', value: 'IT'},
                // {label: 'Português', value: 'PT'}
            ]}
            selectedValue={language}
            onValueChange={(v) => setLanguage(v?.toString() || 'ES'
            )}
            isSearchable
            primaryColor={'blue'}
            checkboxControls={{checkboxStyle: {borderRadius: '100%', borderWidth: 1, borderStyle: 'solid', width: 20, height: 20}, checkboxComponent: <View/>}}
            />
            <Card mainColor={'#1ACDFF'} secondaryColor={'rgba(113, 203, 255, 0.61)'}>
                <Text>Notificar cuando el nivel del aqua baje del: </Text>
                <View style={{display: 'flex', flexDirection:'row', justifyContent:'center', alignItems: 'center', gap: 3}}>
                    <RemeberNumberInput value={water} setValue={setWater} max={100} storeKey={"water_alert"}/><Text>%</Text>
                </View>
            </Card>
        </View>
    )
}

interface PlantData {
    humidity: number,
    light_level: number,
    humidity_range: number,
    light_level_range: number
}

type PlantMap = Record<string, PlantData>;

function Plant() {
    const [pick, setPick] = useState<string | undefined>(undefined)
    
    const plantData: PlantMap = plantsData.plants.reduce((acc: PlantMap, p: any) => {
        acc[p.name] = {
            humidity: p.humidity,
            light_level: p.light_level,
            humidity_range: p.humidity_range,
            light_level_range: p.light_level_range
        };
        return acc;
    }, {});
    
    const [humidity, setHumidity] = useState(pick ? plantData[pick].humidity : 0);
    const [light, setLight] = useState(pick ? plantData[pick].light_level : 0);

    function restoreDefaults() {
        setHumidity(pick ? plantData[pick].humidity : 0)
        AsyncStorage.setItem("optimal_humidity", (pick ? plantData[pick].humidity : 0).toString())
        setLight(pick ? plantData[pick].light_level : 0)
        AsyncStorage.setItem("optimal_light", (pick ? plantData[pick].light_level : 0).toString())
    }


    return (
        <View style={{width: '100%', padding: 10}}>
            <PlantSelect plant={pick} setPlant={setPick}/>
            <View>
            <View style={{margin: 10, display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: 15}}>
            <Card mainColor={'blue'} secondaryColor={'#9DE6F8'}>
                <Image source={require("../assets/images/humidity.png")} style={{ width: 20, height: 28 }} />
                <Text>Humedad</Text>
                <View style={{display: 'flex', flexDirection:'row', justifyContent:'center', alignItems: 'center', gap: 3}}>
                    <RemeberNumberInput storeKey="optimal_humidity" value={humidity} setValue={setHumidity} max={100}/>
                    <Text>%</Text>
                </View>
            </Card>
            <Card secondaryColor={'#EFE6BD'} mainColor={'goldenrod'}>
                <Image source={require("../assets/images/light.png")} style={{ width: 28, height: 28 }} />
                <Text>Nivel de Luz</Text>
                <View style={{display: 'flex', flexDirection:'row', justifyContent:'center', alignItems: 'center', gap: 3}}>
                    <RemeberNumberInput storeKey="optimal_light" value={light} setValue={setLight} max={Number.MAX_VALUE}/>
                    <Text>Lux</Text>
                </View>
            </Card>
            </View>
            <Button title="Restaurar defaults de la planta" onPress={restoreDefaults}/>
            </View>
        </View>
    )
}

export default function Settings() {
    const [selected, setSelected] = useState(0)
    return(
        <View
        style={{
            flex: 1,
            alignItems: "center",
            flexDirection: "column",
            // margin: 10,
        }}
        >  
        <TabBar>
            <Tab title="Planta" index={0} selected={selected} setSelected={setSelected}/>
            <Tab title="Sistema" index={1} selected={selected} setSelected={setSelected}/>
        </TabBar>
        {
            selected === 1 ? <System/> : <Plant/>
        }
        </View>
    )
}