import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import axios from "axios";
import { useAuth } from "../common/hooks";
import { API_URL } from "../common/config";
import { RootStackParamList } from "../AppNavigation";
import { Analysis } from "../common/types/systemTypes";
import { AppLoader } from "../common/components/Loader";
import { AudioRecord } from "../common/components/AudioRecord";

type SessionScreenProps = NativeStackScreenProps<RootStackParamList, 'Session'>;

export const SessionScreen = ({ route, navigation }: SessionScreenProps) => {
    const { token } = useAuth({});
    const { session } = route.params;
    const [isLoading, setIsLoading] = useState(true);
    const [analysis, setAnalysis] = useState<Analysis | null>(null);
    const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);

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

                        <View style={styles.wordsContainer}>
                            {analysis.words.map((word, index) => {

                                const wordColor = word[1] === 0 ? 'green' : word[1] == 1 ? 'orange' : word[1] == 2 ? 'red' : 'black';
                                const word_been_said = word[0]
                                const word_to_say = word[2]
                                return (
                                    <TouchableOpacity key={index} onPress={() => setSelectedWordIndex(index)}>
                                        <Text style={[styles.word, { color: wordColor }]}>{`${word_been_said} - ${word_to_say}`}</Text>
                                    </TouchableOpacity>
                                );
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
        padding: 16,
        direction: 'rtl',
    },
    sampleContainer: {
        width: '90%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        padding: 20,
        marginBottom: 20, // Adjust spacing between elements
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
        flexDirection: 'row',
        flexWrap: 'wrap',

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
});
