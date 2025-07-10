import { useState } from "react";
import { View, Text, Image } from "react-native";
import Dropdown from 'react-native-input-select';

export default function Lang() {
    const [language, setLanguage] = useState('ES')

    return(
        <View
        style={{
            flex: 1,
            alignItems: "center",
            flexDirection: "column",
            margin: 10,
        }}
        >
            <View style={{
                display: 'flex',
                flexDirection: 'row'
            }}>
                <Dropdown label="Lenguaje" placeholder="Selecciona una de las opciones..." options={[
                    {label: 'Español', value: 'ES'},
                    {label: 'English', value: 'EN'},
                    {label: 'Français', value: 'FR'},
                    {label: 'Deutsch', value: 'DE'},
                    {label: 'Italiano', value: 'IT'},
                    {label: 'Português', value: 'PT'}
                ]}
                selectedValue={language}
                onValueChange={(v) => setLanguage(v?.toString() || 'ES'
                )}
                isSearchable
                primaryColor={'blue'}
                />
            </View>
        </View>
    )
}