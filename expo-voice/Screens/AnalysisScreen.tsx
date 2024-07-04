import React, { useEffect, useState } from "react";
import * as FileSystem from 'expo-file-system';

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Alert, Modal, ScrollView } from "react-native";
import { RootStackParamList } from "../AppNavigation";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { Octicons } from '@expo/vector-icons';
import { API_URL } from "../common/config";
import { saveAsync } from "../common/utils";
import { AppLoader } from "../common/components/Loader";
import { AudioRecord } from "../common/components/AudioRecord";
type AnalysisScreenProps = NativeStackScreenProps<RootStackParamList, 'Analysis'>;

export const AnalysisScreen = ({ route, navigation }: AnalysisScreenProps) => {
    const { result, session_id, sample_url, sample_uri, path_to_sample, path_to_session } = route.params;
    const [isloading, setIsLoading] = useState<boolean>(true);
    const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
    const [selectedWord, setSelectedWord] = useState<string | null>(null);
    const [selectedWordToSay, setSelectedWordToSay] = useState<string | null>(null);
    const [selectedWordStatus, setSelectedWordStatus] = useState<number | null>(null);
    const [selectedTaam, setSelectedTaam] = useState<number | null>(null);

    const [localSessionUri, setLocalSessionUri] = useState<string>('');
    const successAlert = () => {
        Alert.alert('Success word', 'You said the right word in the right place', [
            {
                text: 'OK',
                onPress: () => { },
                style: 'cancel',
            },
        ]);
    }

    const failAlert = () => {
        Alert.alert('Fail word', 'You said a wrong word that does not appear in the sample', [
            {
                text: 'OK',
                onPress: () => { },
                style: 'cancel',
            },
        ]);
    }

    const infoAlert = () => {
        Alert.alert('Info word', 'You said the right word in the wrong place', [
            {
                text: 'OK',
                onPress: () => { },
                style: 'cancel',
            },
        ]);
    }

    const missedAlert = () => {
        Alert.alert('Missed word', 'You did not say a word that should have been said', [
            {
                text: 'OK',
                onPress: () => { },
                style: 'cancel',
            },
        ]);
    }

    const handleWordClick = (index: number, word_been_said: string, word_to_say: string, status: number) => {
        setSelectedWordIndex(index);
        setSelectedWord(word_been_said);
        setSelectedWordToSay(word_to_say);
        setSelectedWordStatus(status);
    };

    const handleTaamClick = (index: number) => {
        setSelectedTaam(index);
    }
    const handleScreenClick = () => {
        setSelectedWordIndex(null);
        setSelectedTaam(null)
    };

    const downloadSessionResumable = FileSystem.createDownloadResumable(
        `${API_URL}/session/download/${result.url}`,
        FileSystem.documentDirectory + `${path_to_session}.wav`,
        {},
    );
    const downloadSampleResumable = FileSystem.createDownloadResumable(
        `${API_URL}/files/download/${sample_url}`,
        FileSystem.documentDirectory + `${path_to_sample}.wav`,
        {},
    );
    const downloadAudio = async () => {

        try {
            setIsLoading(true);
            const downloadResult = await downloadSessionResumable.downloadAsync();
            if (downloadResult) {
                setLocalSessionUri(downloadResult.uri);
                saveAsync(path_to_session, downloadResult.uri);
            }
            if (!sample_uri || sample_uri == '') {
                //maybe the user never downloaded the sample
                const downloadSampleResult = await downloadSampleResumable.downloadAsync();
                if (downloadSampleResult) {
                    saveAsync(path_to_sample, downloadSampleResult.uri);
                }
            }
            setIsLoading(false);
        } catch (error) {
            console.error("Error downloading audio:", error);
            setIsLoading(false);
        }
    }

    useEffect(() => {
        downloadAudio();
    }, [result.url])
    return (
        <>
            {isloading ? <AppLoader /> :
                <ScrollView contentContainerStyle={styles.container}>
                    <>
                        <TouchableWithoutFeedback onPress={handleScreenClick}>
                            <View style={styles.container}>
                                <View style={styles.warningsContainer}>
                                    <MaterialCommunityIcons name="check-decagram" size={35} color="#4caf50" onPress={successAlert} />
                                    <MaterialCommunityIcons name="check-circle-outline" size={35} color="#ffc107" onPress={infoAlert} />
                                    <Feather name="info" size={35} color="#2196f3" onPress={missedAlert} />
                                    <AntDesign name="warning" size={35} color="#f44336" onPress={failAlert} />
                                </View>
                                <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 5, marginTop: 5 }}> ניתוח מילים</Text>
                                <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                                    <View style={styles.goodWordsContainer}>
                                        {result.analysis.filter((word) => word.word_status != 2).map((word, index) => {
                                            const status = word.word_status;
                                            const wordColor = status === 0 ? '#4caf50' : status === 1 ? '#ffc107' : status === 2 ? '#f44336' : '#2196f3';
                                            const word_been_said = word.text;
                                            const word_to_say = word.word_to_say;

                                            let underlineStyle = {};
                                            switch (word.taam_status) {
                                                case 'GOOD':
                                                    underlineStyle = { textDecorationLine: 'underline', textDecorationColor: '#4caf50', textDecorationStyle: 'solid', textDecorationThickness: 2 };
                                                    break;
                                                case 'BAD':
                                                    underlineStyle = { textDecorationLine: 'underline', textDecorationColor: '#ffc107', textDecorationStyle: 'solid', textDecorationThickness: 2 };
                                                    break;
                                                case 'MISSING':
                                                    underlineStyle = { textDecorationLine: 'underline', textDecorationColor: '#f44336', textDecorationStyle: 'solid', textDecorationThickness: 2 };
                                                    break;
                                                default:
                                                    underlineStyle = {};
                                            }

                                            if (status === 0) {
                                                return (
                                                    <Text key={index} style={[styles.word, { color: wordColor }, underlineStyle]}>{`${word_been_said}`}</Text>
                                                );
                                            }

                                            return (
                                                <TouchableOpacity key={index} onPress={() => handleWordClick(index, word_been_said, word_to_say, status)}>
                                                    <Text style={[styles.word, { color: wordColor }, underlineStyle]}>{`${word_been_said}`}</Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </ScrollView>

                                <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 5, marginTop: 5 }}>מילים לא קשורות</Text>
                                <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                                    <View style={styles.badWordsContainer}>
                                        {result.analysis.filter((word) => word.word_status === 2).map((word, index) => {
                                            const wordColor = '#f44336';
                                            const word_been_said = word.text;
                                            return (
                                                <TouchableOpacity key={index} >
                                                    <Text style={[styles.word, { color: wordColor }]}>{`${word_been_said}`}</Text>
                                                </TouchableOpacity>
                                            )
                                        })}
                                    </View>
                                </ScrollView>
                                <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, marginTop: 10 }}> ניתוח טעמים</Text>

                                <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                                    <View style={styles.teamimContainer}>
                                        {result.analysis.map((taam, index) => {
                                            const wordColor = taam.taam_status === "GOOD" ? '#4caf50' : taam.taam_status === "BAD" ? '#ffc107' : '#f44336';
                                            return (
                                                <TouchableOpacity
                                                    onPress={() => handleTaamClick(index)} key={index} >
                                                    <View
                                                        style={{ ...styles.timeContainer, backgroundColor: wordColor }}>
                                                        <Text style={[styles.word]}>{`${taam.text} , ${taam.end} - ${taam.start}`}</Text>
                                                    </View>

                                                </TouchableOpacity>
                                            )
                                        })}
                                    </View>
                                </ScrollView>

                            </View>
                        </TouchableWithoutFeedback >
                        {selectedWordIndex !== null &&
                            <Modal visible={true} transparent={true} animationType="fade">
                                <TouchableWithoutFeedback onPress={handleScreenClick}>
                                    <View style={styles.modalContainer}>
                                        <View style={{
                                            width: '80%',
                                            backgroundColor: 'white',
                                            padding: 20,
                                            borderRadius: 10,
                                            alignContent: 'center',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>

                                            {selectedWordStatus === 1 ?
                                                //word not in the right place
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
                                                        :
                                                        //good word
                                                        <>
                                                            <View style={{
                                                                width: '100%',
                                                                alignContent: 'center',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                direction: 'rtl'
                                                            }}>
                                                                <Text
                                                                    style={{ marginBottom: 10, direction: 'rtl' }}

                                                                >{result.analysis[selectedWordIndex].exp}</Text>
                                                            </View>
                                                        </>
                                            }
                                        </View>
                                    </View>
                                </TouchableWithoutFeedback>
                            </Modal>
                        }

                        {selectedTaam !== null &&
                            <Modal visible={true} transparent={true} animationType="fade">
                                <TouchableWithoutFeedback onPress={handleScreenClick}>
                                    <View style={styles.modalContainer}>
                                        <View style={{
                                            width: '80%',
                                            backgroundColor: 'white',
                                            padding: 20,
                                            borderRadius: 10,
                                            alignContent: 'center',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <>
                                                <View style={{
                                                    width: '100%',
                                                    alignContent: 'center',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    direction: 'rtl'
                                                }}>
                                                    <AudioRecord url={sample_url} device_uri={sample_uri} path={path_to_sample} startTime={result.analysis[selectedTaam].rav_start} endTime={result.analysis[selectedTaam].rav_end} is_sample={true}></AudioRecord>
                                                    <AudioRecord url={result.url} device_uri={localSessionUri} path={path_to_session} startTime={result.analysis[selectedTaam].start} endTime={result.analysis[selectedTaam].end} is_sample={false}></AudioRecord>
                                                    <Text style={[styles.word]}>{`${result.analysis[selectedTaam].text} , ${result.analysis[selectedTaam].end} - ${result.analysis[selectedTaam].start}`}</Text>
                                                    <Text
                                                        style={{ marginBottom: 10, direction: 'rtl' }}

                                                    >{result.analysis[selectedTaam].exp}</Text>
                                                </View>
                                            </>

                                        </View>
                                    </View>
                                </TouchableWithoutFeedback>
                            </Modal>
                        }

                        <TouchableOpacity style={styles.itemContainer} onPress={() => {
                            navigation.goBack()
                            navigation.goBack()
                        }
                        }>
                            <Octicons name="project" size={35} color="black" />
                        </TouchableOpacity>
                    </>
                </ScrollView >
            }
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        direction: "rtl",
        justifyContent: 'center'
    },
    warningsContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-around',
        margin: 5,
        position: 'relative',
        top: 20,
        marginBottom: 30,
    },

    word: {
        fontSize: 16,
        marginRight: 8,
        marginBottom: 8,
        direction: "rtl",
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
    redTimeContainer: {
        marginTop: 16,
        backgroundColor: "#f0f0f0",
        borderRadius: 4,
        //make it bigger
        width: 200,
        height: 200,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        margin: 10
    },
    badWordsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        position: 'relative',
        justifyContent: 'center',
        alignContent: 'center',
        height: 150,
        marginLeft: 20
    },
    goodWordsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: 'center',
        alignContent: 'center',
        flex: 1,
        marginBottom: 20,
        textAlign: 'center',
        height: 400
    },
    timeText: {
        fontSize: 14,
        color: "#333",
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
    },

    teamimContainer: {
        flexDirection: "column",
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
    },
    scrollViewContainer: {
        marginVertical: 5,
        alignContent: 'center',
    },
    alert: {
        width: '100%',
        maxWidth: 300,
        margin: 48,
        elevation: 24,
        borderRadius: 2,
        backgroundColor: '#fff'
    },
    alertTitle: {
        margin: 24,
        fontWeight: "bold",
        fontSize: 24,
        color: "#000"
    },
    alertMessage: {
        marginLeft: 24,
        marginRight: 24,
        marginBottom: 24,
        fontSize: 16,
        color: "#000"
    },
    alertButtonGroup: {
        marginTop: 0,
        marginRight: 0,
        marginBottom: 8,
        marginLeft: 24,
        padding: 10,
        display: "flex",
        flexDirection: 'row',
        justifyContent: "flex-end"
    },
    alertButton: {
        marginTop: 12,
        marginRight: 8,
        width: 100
    },
    itemContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 10,
        marginBottom: 100,
    },
});


