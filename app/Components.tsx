import { Link } from "expo-router";
import React, { ReactNode, useState } from "react";
import { Image, Text, TextInput, View, StyleSheet, ColorValue, StyleProp, TextStyle, ViewStyle } from "react-native";
import { LineGraph } from "react-native-graph";
import { useMqtt } from "./MqttProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Dropdown from 'react-native-input-select';
import plantsData from '../assets/plants.json';

const B = (props: any) => <Text style={{ fontWeight: 'bold' }}>{props.children}</Text>

export function SettingsIcon() {
  return (
    <Link href={'/Settings'}>
      <Image source={require('../assets/images/settings.png')} style={{ width: 30, height: 30 }} />
    </Link>
  )
}

export function MqttData({topic, transform=(v)=>{return v}, fallback='  -  ', style={}}: {topic: string, transform?: (v: string)=>string, fallback?: string, style?: StyleProp<TextStyle>}) {
  const { messages } = useMqtt();
  const message = messages[topic]
  if (message) {
    return (
      <Text style={style}>{transform(message)}</Text>
    )
  } else {
    return (
      <View style={{backgroundColor: 'lightgray', borderRadius: 5}}><Text style={style}>{fallback}</Text></View>
    )
  }
}

export function MqttGraph({topic, color, style, fallback='No data found'}: {topic: string, color: string, style: StyleProp<ViewStyle>, fallback?: string}) {
  const {messages} = useMqtt();

  if(!messages[topic] || !messages[topic].includes(":")) return(<View style={{width:'100%', display:'flex', justifyContent:'center',alignItems:'center'}}><View style={{backgroundColor: 'lightgray', borderRadius: 5}}><Text>{fallback}</Text></View></View>)

  const data = (messages[topic]||'').split(',', 70).filter((v) => v !== "").map((v) => {
    const sep = v.split(':');
    return { date: new Date(Number(sep[0])), value: Number(sep[1] || '5') };
  })
  return (
    <LineGraph
              points={data}
              color={color}
              animated={false}
              style={style}
            />
  )
}

export function NumberInput({value, setValue, max=Number.MAX_VALUE}: {value: number, setValue: React.Dispatch<React.SetStateAction<number>>, max?: number}) {
  return (
    <TextInput style={{
                backgroundColor: '#ffffff2d', 
                padding: 10, 
                borderRadius: 5,
                borderColor: '#5151517b', 
                borderStyle: 'solid', 
                borderWidth:1,
                textAlign: 'center'
    }} keyboardType="number-pad" value={value.toString()} onChangeText={(v)=>{v=='' ? setValue(0) : !isNaN(Number(v)) && Number(v) <= max && setValue(Number(v))}}/>
  )
}

export function RemeberNumberInput({storeKey, value, setValue, max=Number.MAX_VALUE}: {storeKey: string, value: number, setValue: React.Dispatch<React.SetStateAction<number>>, max?: number}) {
  AsyncStorage.getItem(storeKey).then((v)=>{v && setValue(Number(v))})
  function handleChange(v: string) {
    if(v==='') {
      setValue(0)
      AsyncStorage.setItem(storeKey, "0")
    } else if (!isNaN(Number(v)) && Number(v) <= max) {
      setValue(Number(v))
      AsyncStorage.setItem(storeKey, v)
    }
  }

  return(
    <TextInput style={{
                backgroundColor: '#ffffff2d', 
                padding: 10, 
                borderRadius: 5,
                borderColor: '#5151517b', 
                borderStyle: 'solid', 
                borderWidth:1,
                textAlign: 'center'
    }} keyboardType="number-pad" value={value.toString()} onChangeText={handleChange}/>
  )
}

export function Tab({title, index, selected, setSelected}: {title: string, index: number, selected: number, setSelected: any}) {
    return (
        <View onTouchEnd={()=>setSelected(index)} style={selected===index ? styles.selected : styles.tab}>
            <Text>{title}</Text>
        </View>
    )
}

export function TabBar({children}: {children: ReactNode}) {
    return(
        <View style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            alignItems: 'stretch',
        }}>
            {children}
        </View>
    )
}

const styles = StyleSheet.create({
    tab: {
        width: "50.5%",
        backgroundColor: 'lightgrey',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5,
        inset: 0,
        borderColor: 'transparent',
        borderRightColor: 'black',
        borderStyle: 'solid',
        borderWidth: 1
    },
    selected: {
        width: "50.5%",
        backgroundColor: 'gray',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5,
        inset: 0,
        borderColor: 'transparent',
        borderRightColor: 'black',
        borderStyle: 'solid',
        borderWidth: 1
    }
})

export function Card({children, mainColor: mainColor, secondaryColor: secondaryColor}: {children: ReactNode, mainColor: ColorValue, secondaryColor: ColorValue}) {
  return (
    <View style={{
        borderColor: mainColor,
        borderStyle: 'solid',
        borderWidth: 1,
        borderRadius: 5,
        backgroundColor: secondaryColor,
        padding: 5,
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
        justifyContent: 'center',
        alignItems: 'center'
    }}>
      {children}
    </View>
  )
}

export function PlantSelect({plant, setPlant}: {plant: string | undefined, setPlant: any}) {
  let selected=''
  AsyncStorage.getItem('plant').then((v) => { selected = v || 'none'; setPlant(selected) })

  const plants = plantsData.plants.map((p) => {
      return { label: p.name, value: p.name }
  })

  return(
    <Dropdown
          label="Especie"
          placeholder="Selecciona una de las opciones..."
          options={plants}
          selectedValue={plant}
          onValueChange={(p) => { setPlant(p?.toString()); AsyncStorage.setItem('plant', p?.toString() || 'error') }}
          primaryColor={'green'}
          isSearchable={true}
          placeholderStyle={{ color: 'grey' }}
          checkboxControls={{checkboxStyle: {borderRadius: '100%', borderWidth: 1, borderStyle: 'solid', width: 20, height: 20}, checkboxComponent: <View/>}}
        />
  )
}

export function DataPage({ title, topic, color }: { title: string, topic: string, color: string }) {
  const [percent, setPercent] = useState(0)
  // const [history, setHistory] = useState<any>([{ date: new Date(), value: 0 }]);
  // const [average, setAverage] = useState(0);
  const { messages } = useMqtt();

  if(!messages[topic] || !messages[topic].includes(":")) return (
    <Text>No hay datos...</Text>
  )

  let sum = 0;
  const history = (messages[topic].split(',', 70).filter((v) => v !== "").map((v) => {
    if (v !== "") {
      const sep = v.split(':');
      sum += Number(sep[1])
      return { date: new Date(Number(sep[0])), value: Number(sep[1] || '5') };
    } else {
      alert(v)
      return { date: new Date(), value: 0 }
    }
  }))
  const average = sum / messages[topic].split(',').length;
  // setPercent(history[0].value)
  // setAverage(sum / msg.split(',', 70).length)
  // alert(history.toString())

  return (
    <View style={{
      flex: 1,
      alignItems: "center",
      flexDirection: "column",
      margin: 10,
    }}>
      <Text style={{ fontSize: 50 }}>{title}</Text>
      <LineGraph
        points={history}
        color={color}
        animated
        enablePanGesture
        enableIndicator
        onPointSelected={(p) => setPercent(p.value)}
        onGestureEnd={() => setPercent(history[history.length - 1].value)}
        style={{ height: 100, marginTop: 10, width: "100%", transform: 'translateX(-30px)' }}
      />
      <View style={{ height: 30 }} />
      <Text style={{ fontSize: 50, fontWeight: "900" }}>{Math.floor(percent * 100)}%</Text>
      <View style={{ height: 50 }} />
      <Text>
        La humedad optima es de <B>{messages[topic.replace('history', 'setpoint')]}%</B>. La humedad promedio es del <B>{Math.floor(average * 100)}%</B>.
      </Text>
    </View>
  )
}