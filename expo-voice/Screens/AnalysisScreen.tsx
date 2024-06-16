import React, { useEffect, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Alert, Modal, ScrollView } from "react-native";
import { RootStackParamList } from "../AppNavigation";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { Octicons } from '@expo/vector-icons';
import { AudioSlicePlayer } from "../common/components/AudioSlicePlayer";
type AnalysisScreenProps = NativeStackScreenProps<RootStackParamList, 'Analysis'>;

export const AnalysisScreen = ({ route, navigation }: AnalysisScreenProps) => {
    const { analysis, uri } = route.params;
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
        setSelectedWordIndex(index);
        setSelectedWord(word_been_said);
        setSelectedWordToSay(word_to_say);
        setSelectedWordStatus(status);
    };
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
                    <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, marginTop: 10 }}> ניתוח מילים</Text>
                    <ScrollView style={styles.scrollViewContainer}>
                        <View style={styles.goodWordsContainer}>
                            {analysis.analysis.filter((word) => word.word_status != 2).map((word, index) => {
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

                    {selectedWordIndex !== null &&
                        <Modal visible={true} transparent={true} animationType="fade">
                            <TouchableWithoutFeedback onPress={handleScreenClick}>
                                <View style={styles.modalContainer}>
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
                                                    {
                                                        /* 
                                                           one for the rav on for the student
                                                           for the rav get the uri from the asynch storage `${selectedProject.id}_${selectedProject.created_at}`
                                                           if not existed , needs to download the file from the server using project.sampleUrl
                                                        */
                                                    }
                                                    <AudioSlicePlayer uri={uri} startTime={Number(analysis.analysis[selectedWordIndex].start)} endTime={Number(analysis.analysis[selectedWordIndex].end)}></AudioSlicePlayer>
                                                    <AudioSlicePlayer uri={uri} startTime={Number(analysis.analysis[selectedWordIndex].rav_start)} endTime={Number(analysis.analysis[selectedWordIndex].rav_end)}></AudioSlicePlayer>
                                                    <Text style={[styles.word]}>{`${analysis.analysis[selectedWordIndex].text} , ${analysis.analysis[selectedWordIndex].end} - ${analysis.analysis[selectedWordIndex].start}`}</Text>
                                                    <Text>{analysis.analysis[selectedWordIndex].exp}</Text>
                                                </>
                                    }
                                </View>
                            </TouchableWithoutFeedback>
                        </Modal>
                    }

                    <ScrollView style={styles.scrollViewContainer}>
                        <View style={styles.badWordsContainer}>
                            {analysis.analysis.filter((word) => word.word_status === 2).map((word, index) => {
                                const wordColor = '#ffc107';
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

                    <ScrollView style={styles.scrollViewContainer}>
                        <View style={styles.teamimContainer}>
                            {analysis.analysis.map((taam, index) => {
                                const wordColor = taam.taam_status === "GOOD" ? '#4caf50' : taam.taam_status === "BAD" ? '#ffc107' : '#f44336';
                                return (
                                    <TouchableOpacity
                                        onPress={() => setSelectedWordIndex(index)} key={index} >
                                        <View
                                            style={{ ...styles.timeContainer, backgroundColor: wordColor }}>
                                            <Text style={[styles.word]}>{`${taam.text} , ${taam.end} - ${taam.start}`}</Text>
                                            <Text style={[styles.word]}>{`${taam.exp.slice(0, 3)}`}</Text>
                                        </View>

                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    </ScrollView>

                </View>
            </TouchableWithoutFeedback >
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
        height: 200,
    },
    goodWordsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: 'center',
        alignContent: 'center',
        flex: 1,
        marginBottom: 20
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



// {selectedWordIndex !== null &&
//     <Modal visible={true} transparent={true} animationType="fade" >
//         <TouchableWithoutFeedback onPress={handleScreenClick}>
//             <View style={styles.modalContainer}>
//                 {selectedWordStatus == 0 ?
//                     <View style={{ ...styles.timeContainer, backgroundColor: '#4caf50' }}>
//                         <Text style={{ marginBottom: 2 }}> u said : {"\"" + selectedWord + "\""}</Text>
//                         <Text style={{ marginBottom: 2 }}> {analysis.teamim[selectedWordIndex].start} - {analysis.teamim[selectedWordIndex].end}</Text>
//                         <Text>Review: {analysis.teamim[selectedWordIndex].review}</Text>
//                         <Text> Taam : {analysis.teamim[selectedWordIndex].exp}</Text>
//                     </View>
//                     :
//                     selectedWordStatus == 1 ?
//                         <View style={{ ...styles.timeContainer, backgroundColor: '#ffc107' }}>
//                             <Text style={{ marginBottom: 2 }}> u said : {"\"" + selectedWord + "\""}</Text>
//                             <Text style={{ marginBottom: 2 }}> u should said : {"\"" + selectedWordToSay + "\""}</Text>
//                             <Text> Taam : {analysis.teamim[selectedWordIndex].exp}</Text>
//                         </View>
//                         :
//                         selectedWordStatus == 2 ?
//                             <View style={{ ...styles.redTimeContainer, backgroundColor: '#f44336' }}>
//                                 <Text style={{ marginBottom: 5 }}>this word not in the sample</Text>
//                                 <Text> u said : {"\"" + selectedWord + "\""}</Text>
//                                 <Text> Taam : {analysis.teamim[selectedWordIndex].exp}</Text>
//                             </View>
//                             :
//                             <View style={{ ...styles.timeContainer, backgroundColor: '#2196f3' }}>
//                                 <Text>Review: {analysis.teamim[selectedWordIndex].review}</Text>
//                                 <Text> Taam : {analysis.teamim[selectedWordIndex].exp}</Text>
//                             </View>

//                 }
//             </View>
//         </TouchableWithoutFeedback>
//     </Modal>
// }