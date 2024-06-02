import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import axios from "axios";
import { useAuth } from "../common/hooks";
import { API_URL } from "../common/config";
import { RootStackParamList } from "../AppNavigation";
import { Analysis } from "../common/types/systemTypes";
import { AppLoader } from "../common/components/Loader";
import { AudioRecord } from "../common/components/AudioRecord";
import { AntDesign } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';

type SessionScreenProps = NativeStackScreenProps<RootStackParamList, 'Session'>;

export const SessionScreen = ({ route, navigation }: SessionScreenProps) => {
    const { token } = useAuth({});
    const { session } = route.params;
    const [isLoading, setIsLoading] = useState(true);
    const [analysis, setAnalysis] = useState<Analysis | null>(null);
    const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);

    const successAlert = () => {
        Alert.alert('success word', 'You said the right word in the right place', [
            {
                text: 'OK',
                onPress: () => { },
                style: 'cancel',
            },
        ]);
    }

    const failAlert = () => {
        Alert.alert('fail word', 'You said wrong word that does not apperd in the text', [
            {
                text: 'OK',
                onPress: () => { },
                style: 'cancel',
            },
        ]);
    }
    const infoAlert = () => {
        Alert.alert('info word', 'You said the right word in the wrong place', [
            {
                text: 'OK',
                onPress: () => { },
                style: 'cancel',
            },
        ]);
    }
    const missedAlert = () => {
        Alert.alert('missed word', 'You did not say a word that should have been said', [
            {
                text: 'OK',
                onPress: () => { },
                style: 'cancel',
            },
        ]);
    }
    const handleWordClick = (index: number) => {
        setSelectedWordIndex(index);
    };
    useEffect(() => {
        axios.get(`${API_URL}/analysis/${session.id}`,
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        )
            .then(response => {
                setAnalysis(response.data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Error fetching analysis data:", error);
                setIsLoading(false);
            });
    }, [session.id, token]);
    return (
        <>
            {isLoading ? <AppLoader /> :
                !analysis ? <Text>No data available.</Text> :
                    <ScrollView contentContainerStyle={styles.container}>
                        <View style={styles.sampleContainer}>
                            <AudioRecord
                                url={session.url}
                                device_uri={''}
                                is_sample={false}
                                path={`${session.id}_${session.created_at}`} />
                        </View>
                        <View style={styles.warningsContainer}>
                            <MaterialCommunityIcons name="check-decagram" size={35} color="#4caf50" onPress={successAlert} />
                            <MaterialCommunityIcons name="check-circle-outline" size={35} color="#ffc107" onPress={infoAlert} />
                            <Feather name="info" size={35} color="#2196f3" onPress={missedAlert} />
                            <AntDesign name="warning" size={35} color="#f44336" onPress={failAlert} />
                        </View>

                        <View style={styles.wordsContainer}>
                            {analysis.words.map((word, index) => {
                                const status = word[1];
                                const wordColor = status === 0 ? '#4caf50' : status == 1 ? '#ffc107' : status == 2 ? '#f44336' : '#2196f3';
                                const word_been_said = word[0];
                                const word_to_say = word[2];
                                if (status == 2) {
                                    return (
                                        <TouchableOpacity key={index} onPress={() => handleWordClick(index)}>
                                            <Text style={[styles.word, { color: wordColor }]}>{`${word_been_said} - ${word_to_say}`}</Text>
                                        </TouchableOpacity>
                                    )
                                }
                                else {
                                    return (
                                        <TouchableOpacity key={index} onPress={() => handleWordClick(index)}>
                                            <Text style={[styles.word, { color: wordColor }]}>{`${word_been_said}`}</Text>
                                        </TouchableOpacity>)
                                }
                            })}
                        </View>
                        {selectedWordIndex !== null && (
                            <View style={styles.timeContainer}>
                                <Text>Start: {analysis.teamim[selectedWordIndex].start}</Text>
                                <Text>End: {analysis.teamim[selectedWordIndex].end}</Text>
                                <Text>Review: {analysis.teamim[selectedWordIndex].review}</Text>
                            </View>
                        )}
                    </ScrollView>
            }
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        direction: 'rtl',
    },
    sampleContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        padding: 20,
        marginBottom: 10, // Adjust spacing between elements
        height: 150, // Adjust height as needed
    },
    descriptionContainer: {
        marginBottom: 16,
    },
    descriptionLine: {
        fontSize: 16,
        marginBottom: 8,
    },
    wordsContainer: {
        flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 20,
    },
    word: {
        fontSize: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    timeContainer: {
        marginTop: 16,
        padding: 16,
        borderRadius: 8,
    },
    warningsContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-around',
        margin: 5
    },
});
