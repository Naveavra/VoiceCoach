import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TouchableWithoutFeedback, SafeAreaView } from "react-native";
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
import { formatDate } from "../common/utils";

type SessionScreenProps = NativeStackScreenProps<RootStackParamList, 'Session'>;

export const SessionScreen = ({ route, navigation }: SessionScreenProps) => {
    const { token } = useAuth({});
    const { session, local_uri } = route.params;
    const [isLoading, setIsLoading] = useState(true);
    const [analysis, setAnalysis] = useState<Analysis | null>(null);
    const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
    const [selectedWord, setSelectedWord] = useState<string | null>(null);
    const [selectedWordToSay, setSelectedWordToSay] = useState<string | null>(null);
    const [selectedWordStatus, setSelectedWordStatus] = useState<number | null>(null);

    const successAlert = () => {
        Alert.alert('Success Word', 'You said the right word in the right place', [
            { text: 'OK', onPress: () => { }, style: 'cancel' },
        ]);
    }

    const failAlert = () => {
        Alert.alert('Fail Word', 'You said a wrong word that does not appear in the sample', [
            { text: 'OK', onPress: () => { }, style: 'cancel' },
        ]);
    }
    const infoAlert = () => {
        Alert.alert('Info Word', 'You said the right word in the wrong place', [
            { text: 'OK', onPress: () => { }, style: 'cancel' },
        ]);
    }
    const missedAlert = () => {
        Alert.alert('Missed Word', 'You did not say a word that should have been said', [
            { text: 'OK', onPress: () => { }, style: 'cancel' },
        ]);
    }
    const handleWordClick = (index: number, word_been_said: string, word_to_say: string, status: number) => {
        setSelectedWordIndex(index);
        setSelectedWord(word_been_said);
        setSelectedWordToSay(word_to_say);
        setSelectedWordStatus(status);
    };

    const handleScreenClick = () => {
        setSelectedWordIndex(null);
    };

    useEffect(() => {

        axios.get(`${API_URL}/analysis/${session.id}`, { headers: { 'Authorization': `Bearer ${token}` } })
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
                    <View style={styles.container}>
                        <View style={styles.sampleContainer}>
                            <AudioRecord
                                url={session.url}
                                device_uri={local_uri}
                                is_sample={false}
                                path={`${session.id}_${formatDate(session.created_at, true)}`}
                            />
                        </View>
                        <View style={styles.warningsContainer}>
                            <MaterialCommunityIcons name="check-decagram" size={35} color="#4caf50" onPress={successAlert} />
                            <MaterialCommunityIcons name="check-circle-outline" size={35} color="#ffc107" onPress={infoAlert} />
                            <Feather name="info" size={35} color="#2196f3" onPress={missedAlert} />
                            <AntDesign name="warning" size={35} color="#f44336" onPress={failAlert} />
                        </View>


                        <ScrollView style={styles.scrollViewContainer}>
                            <View style={styles.goodWordsContainer}>
                                {analysis.words.filter((word) => word[1] != 2).map((word, index) => {
                                    const status = word[1];
                                    const wordColor = status === 0 ? '#4caf50' : status === 1 ? '#ffc107' : '#2196f3';
                                    const word_been_said = word[0];
                                    const word_to_say = word[2];
                                    if (status === 0) {
                                        return (
                                            <Text key={index} style={[styles.word, { color: wordColor }]}>{`${word_been_said}`}</Text>
                                        )
                                    }
                                    return (
                                        <TouchableOpacity key={index} onPress={() => handleWordClick(index, word_been_said, word_to_say, status)}>
                                            <Text style={[styles.word, { color: wordColor }]}>{`${word_been_said}`}</Text>
                                        </TouchableOpacity>
                                    )
                                })}
                            </View>
                        </ScrollView>


                        {selectedWordIndex !== null &&
                            <Modal visible={true} transparent={true} animationType="fade">
                                <TouchableWithoutFeedback onPress={handleScreenClick}>
                                    <View style={styles.modalContainer}>
                                        {selectedWordStatus === 1 ?
                                            <View style={{ ...styles.yellowTimeContainer, backgroundColor: '#ffc107' }}>
                                                <Text style={{ marginBottom: 10 }}>You said: {"\"" + selectedWord + "\""} not in the right place</Text>
                                                <Text style={{ marginBottom: 10 }}>Should be: {"\"" + selectedWordToSay + "\""} </Text>
                                            </View>
                                            :
                                            selectedWordStatus === 2 ?
                                                <View style={{ ...styles.redTimeContainer, backgroundColor: '#f44336' }}>
                                                    <Text style={{ marginBottom: 5 }}>This word is not in the sample</Text>
                                                    <Text>You said: {"\"" + selectedWord + "\""}</Text>
                                                </View>
                                                : selectedWordStatus === 3 ?
                                                    <View style={{ ...styles.timeContainer, backgroundColor: '#2196f3' }}>
                                                        <Text style={{ marginBottom: 10 }}>You missed that word: {"\"" + selectedWordToSay + "\""}</Text>
                                                    </View>
                                                    : null
                                        }
                                    </View>
                                </TouchableWithoutFeedback>
                            </Modal>
                        }



                        <ScrollView style={styles.scrollViewContainer}>
                            <View style={styles.badWordsContainer}>
                                {analysis.words.filter((word) => word[1] === 2).map((word, index) => {
                                    const status = word[1];
                                    const word_been_said = word[0];
                                    const word_to_say = word[2];
                                    return (
                                        <TouchableOpacity key={index} onPress={() => handleWordClick(index, word_been_said, word_to_say, status)}>
                                            <Text style={[styles.word, { color: '#f44336' }]}>{`${word_been_said}`}</Text>
                                        </TouchableOpacity>
                                    )
                                })}
                            </View>
                        </ScrollView>

                        <ScrollView style={styles.scrollViewContainer}>
                            <View style={styles.teamimContainer}>
                                {analysis.teamim.map((taam, index) => {
                                    const wordColor = taam.review === "GOOD" ? '#4caf50' : taam.review === "BAD" ? '#ffc107' : '#f44336';
                                    return (
                                        <TouchableOpacity key={index} >
                                            <View style={{ ...styles.timeContainer, backgroundColor: wordColor }}>
                                                <Text style={[styles.word]}>{`${taam.text} , ${taam.end} - ${taam.start}`}</Text>
                                                <Text style={[styles.word]}>{`${taam.exp}`}</Text>
                                            </View>

                                        </TouchableOpacity>
                                    )
                                })}
                            </View>
                        </ScrollView>
                    </View>
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
    warningsContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-around',
        margin: 5,
        marginBottom: 30,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    timeContainer: {
        marginTop: 16,
        padding: 8,
        borderRadius: 4,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
    },
    redTimeContainer: {
        marginTop: 16,
        backgroundColor: "#f0f0f0",
        borderRadius: 4,
        width: 200,
        height: 200,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        margin: 10,
    },
    yellowTimeContainer: {
        marginTop: 16,
        backgroundColor: "#f0f0f0",
        borderRadius: 4,
        width: 300,
        height: 200,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        margin: 10
    },
    goodWordsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: 'center',
        alignContent: 'center',
        flex: 1,
        marginBottom: 20
    },
    badWordsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        position: 'relative',
        justifyContent: 'center',
        alignContent: 'center',
        height: 200,
    },
    teamimContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        position: 'relative',
        justifyContent: 'center',
        alignContent: 'center',
        top: 10,
    },
    scrollViewContainer: {
        marginVertical: 5,
    },
    word: {
        fontSize: 16,
        marginRight: 8,
        marginBottom: 8,
    },

});
