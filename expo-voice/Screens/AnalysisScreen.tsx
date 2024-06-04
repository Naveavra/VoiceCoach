import React, { useEffect, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Alert, Modal, ScrollView } from "react-native";
import { RootStackParamList } from "../AppNavigation";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { Octicons } from '@expo/vector-icons';
type AnalysisScreenProps = NativeStackScreenProps<RootStackParamList, 'Analysis'>;

export const AnalysisScreen = ({ route, navigation }: AnalysisScreenProps) => {
    const { analysis } = route.params;
    const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
    const [selectedWord, setSelectedWord] = useState<string | null>(null);
    const [selectedWordToSay, setSelectedWordToSay] = useState<string | null>(null);
    const [selectedWordStatus, setSelectedWordStatus] = useState<number | null>(null);
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
        if (status == 3) {
            for (let i = 0; i < analysis.words.length; i++) {
                if (analysis.words[i][0] == word_been_said) {
                    index = i;
                    word_to_say = analysis.words[i][2];
                    status = analysis.words[i][1];
                    break;
                }
            }
        }
        setSelectedWordIndex(index);
        setSelectedWord(word_been_said);
        setSelectedWordToSay(word_to_say);
        setSelectedWordStatus(status);
    };
    //[["בראשית", 2, "בראשית"], ["ברא", 2, "ברא"], ["אלוהים", 2, "אלוהים"], ["את", 2, "את"], ["השמיים", 2, "השמיים"], ["ואת", 2, "ואת"], ["הארץ", 2, "הארץ"], ["והארץ", 2, "והארץ"], ["הייתה", 2, "הייתה"], ["תוהו", 2, "תוהו"], ["עכשיו", 3, "עכשיו"], ["ננסה", 3, "ננסה"], ["להקליט", 3, "להקליט"], ["משהו", 3, "משהו"], ["הרבה", 3, "הרבה"], ["יותר", 3, "יותר"], ["קל", 3, "קל"], ["כדי", 3, "כדי"], ["שזה", 3, "שזה"], ["יעבוד", 3, "יעבוד"]]}
    const handleScreenClick = () => {
        setSelectedWordIndex(null);
    };


    return (
        <>
            <TouchableWithoutFeedback onPress={handleScreenClick}>
                <View style={styles.container}>
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
                                const wordColor = status === 0 ? '#4caf50' : status === 1 ? '#ffc107' : status === 2 ? '#f44336' : '#2196f3';
                                const word_been_said = word[0];
                                const word_to_say = word[2];
                                return (
                                    <TouchableOpacity key={index} onPress={() => handleWordClick(index, word_been_said, word_to_say, status)}>
                                        <Text style={[styles.word, { color: wordColor }]}>{`${word_been_said}`}</Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    </ScrollView>

                    <ScrollView style={styles.scrollViewContainer}>
                        <View style={styles.badWordsContainer}>
                            {analysis.words.filter((word) => word[1] === 2).map((word, index) => {
                                const status = word[1];
                                const wordColor = status === 0 ? '#4caf50' : status === 1 ? '#ffc107' : status === 2 ? '#f44336' : '#2196f3';
                                const word_been_said = word[0];
                                const word_to_say = word[2];
                                return (
                                    <TouchableOpacity key={index} onPress={() => handleWordClick(index, word_been_said, word_to_say, status)}>
                                        <Text style={[styles.word, { color: wordColor }]}>{`${word_been_said}`}</Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    </ScrollView>
                    {selectedWordIndex !== null &&
                        <Modal visible={true} transparent={true} animationType="fade" >
                            <TouchableWithoutFeedback onPress={handleScreenClick}>
                                <View style={styles.modalContainer}>
                                    {selectedWordStatus == 0 ?
                                        <View style={{ ...styles.timeContainer, backgroundColor: '#4caf50' }}>
                                            <Text style={{ marginBottom: 2 }}> u said : {"\"" + selectedWord + "\""}</Text>
                                            <Text style={{ marginBottom: 2 }}> {analysis.teamim[selectedWordIndex].start} - {analysis.teamim[selectedWordIndex].end}</Text>
                                            <Text>Review: {analysis.teamim[selectedWordIndex].review}</Text>
                                        </View>
                                        :
                                        selectedWordStatus == 1 ?
                                            <View style={{ ...styles.timeContainer, backgroundColor: '#ffc107' }}>
                                                <Text style={{ marginBottom: 2 }}> u said : {"\"" + selectedWord + "\""}</Text>
                                                <Text style={{ marginBottom: 2 }}> u should said : {"\"" + selectedWordToSay + "\""}</Text>
                                            </View>
                                            :
                                            selectedWordStatus == 2 ?
                                                <View style={{ ...styles.redTimeContainer, backgroundColor: '#f44336' }}>
                                                    <Text style={{ marginBottom: 5 }}>this word not in the sample</Text>
                                                    <Text> u said : {"\"" + selectedWord + "\""}</Text>
                                                </View>
                                                :
                                                <View style={{ ...styles.timeContainer, backgroundColor: '#2196f3' }}>
                                                    <Text>Review: {analysis.teamim[selectedWordIndex].review}</Text>
                                                </View>

                                    }
                                </View>
                            </TouchableWithoutFeedback>
                        </Modal>
                    }
                </View>
            </TouchableWithoutFeedback>
            <TouchableOpacity style={styles.itemContainer} onPress={() => {
                navigation.goBack()
                navigation.goBack()
            }
            }>
                <Octicons name="project" size={35} color="black" />
            </TouchableOpacity>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        direction: "rtl",
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
    description: {
        fontSize: 16,
        marginBottom: 16,
    },
    wordsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        position: 'relative',
        top: 100
    },
    word: {
        fontSize: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    timeContainer: {
        marginTop: 16,
        padding: 8,
        backgroundColor: "#f0f0f0",
        borderRadius: 4,
        //make it bigger
        width: 200,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        //make space between 
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
    goodWordsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: 'center',
        alignContent: 'center',
    },
    badWordsContainer: {
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
