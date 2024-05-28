import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { TextInput, Button } from 'react-native-paper';



interface AppSelectorProps {
    data: string[];
    showList: boolean;
    setShowList: (value: boolean) => void;
    handleSelect: (selectedValue: string) => void;
    label: string;
}

const AppSelector: React.FC<AppSelectorProps> = ({
    data, showList, setShowList, handleSelect, label
}) => {

    const [value, setValue] = useState<string>('');

    const handleInputSelect = (selectedParasha: string) => {
        handleSelect(selectedParasha);
        setValue(selectedParasha);
        setShowList(false);
    };

    return (
        <View style={styles.container}>
            <TextInput
                label={label}
                value={value}
                onFocus={() => setShowList(true)}
                onChangeText={text => handleInputSelect(text)}
                mode="outlined"
                style={styles.input}
            />
            {showList && (
                <ScrollView style={styles.listContainer}>
                    {data.map((p, index) => (
                        <TouchableOpacity key={index} onPress={() => handleInputSelect(p)}>
                            <Text style={styles.listItem}>{p}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
        direction: 'rtl',

    },
    input: {
        marginBottom: 16,
        direction: 'rtl',
        justifyContent: 'center',
        textAlign: 'right',
    },
    listContainer: {
        maxHeight: 200,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        marginBottom: 16,
        direction: 'rtl',
    },
    listItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        textAlign: 'center',
    },
    button: {
        marginTop: 16,
    },
});

export default AppSelector;