import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TouchableWithoutFeedback, SafeAreaView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import axios from "axios";
import { useAuth, useUtilities } from "../common/hooks";
import { API_URL } from "../common/config";
import { RootStackParamList } from "../AppNavigation";
import { Analysis } from "../common/types/systemTypes";
import { AppLoader } from "../common/components/Loader";
import { AudioRecord } from "../common/components/AudioRecord";
import { AntDesign } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { setCommentDialog } from "../common/redux/globalReducer";
import { UIButton, UITextField } from "../common/ui/components";
import { addComment } from "../common/redux/projectReducer";
import { Title } from "../common/components/Title";

type SessionScreenProps = NativeStackScreenProps<RootStackParamList, 'Session'>;

export const SessionScreen = ({ route, navigation }: SessionScreenProps) => {
    const { useAppSelector, dispatch } = useUtilities();
    const { token } = useAuth({});
    const { rabbi, session, sample_url, sample_uri, session_uri } = route.params;
    const [isLoading, setIsLoading] = useState(true);
    const [analysis, setAnalysis] = useState<Analysis | null>(null);
    const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
    const [selectedWord, setSelectedWord] = useState<string | null>(null);
    const [selectedWordToSay, setSelectedWordToSay] = useState<string | null>(null);
    const [selectedWordStatus, setSelectedWordStatus] = useState<number | null>(null);
    const path_to_sample = `project_${session.projectId}`;
    const path_to_session = `session_${session.id}`

    // console.log('1', session)
    // console.log('analysis', analysis)
    // console.log('sample_url', sample_url)
    // console.log('session_uri', session_uri)
    // console.log('session_url', analysis?.url ?? '?')
    const commentDialog = useAppSelector((state) => state.global.commentDialog);
    const [comment, setComment] = useState('')

    const [selectedTaam, setSelectedTaam] = useState<number | null>(null)
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
        setSelectedTaam(null);
        dispatch(setCommentDialog(false))
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


    useEffect(() => {
    }, [commentDialog, session_uri])

    return (
        <>
            {isLoading ? <AppLoader /> :
                !analysis ? <Text>No data available.</Text> :
                    <ScrollView contentContainerStyle={styles.container}>
                        <>
                            <View style={styles.sampleContainer}>
                                <AudioRecord
                                    url={sample_url}
                                    device_uri={session_uri}
                                    is_sample={false}
                                    path={`session_${session.id}`}
                                    startTime={null}
                                    endTime={null} />
                            </View>
                            <View style={styles.warningsContainer}>
                                <MaterialCommunityIcons name="check-decagram" size={35} color="#4caf50" onPress={successAlert} />
                                <MaterialCommunityIcons name="check-circle-outline" size={35} color="#ffc107" onPress={infoAlert} />
                                <Feather name="info" size={35} color="#2196f3" onPress={missedAlert} />
                                <AntDesign name="warning" size={35} color="#f44336" onPress={failAlert} />
                            </View>


                            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                                <View style={styles.goodWordsContainer}>
                                    {analysis.analysis.filter((word) => word.word_status != 2).map((word, index) => {
                                        const status = word.word_status;
                                        const wordColor = status === 0 ? '#4caf50' : status === 1 ? '#ffc107' : '#2196f3';
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
                                            <View style={{
                                                width: '80%',
                                                height: '40%',
                                                backgroundColor: 'white',
                                                padding: 20,
                                                borderRadius: 10,
                                                alignContent: 'center',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
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
                                                                <Text style={{ marginBottom: 10 }}>You missed that word: {"\"" + selectedWord + "\""}</Text>
                                                            </View>
                                                            :
                                                            <>
                                                                <Text style={[styles.word]}>{`${analysis.analysis[selectedWordIndex].text} , ${analysis.analysis[selectedWordIndex].end} - ${analysis.analysis[selectedWordIndex].start}`}</Text>
                                                                <Text>{analysis.analysis[selectedWordIndex].exp}</Text>
                                                            </>
                                                }
                                            </View >
                                        </View>
                                    </TouchableWithoutFeedback>
                                </Modal>
                            }
                            <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 5, marginTop: 15 }}>מילים לא קשורות</Text>

                            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                                <View style={styles.badWordsContainer}>
                                    {analysis.analysis.filter((word) => word.word_status === 2).map((word, index) => {
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
                                    {analysis.analysis.map((taam, index) => {
                                        const wordColor = taam.taam_status === "GOOD" ? '#4caf50' : taam.taam_status === "BAD" ? '#ffc107' : '#f44336';
                                        return (
                                            <TouchableOpacity
                                                onPress={() => setSelectedTaam(index)} key={index} >
                                                <View
                                                    style={{ ...styles.timeContainer, backgroundColor: wordColor }}>
                                                    <Text style={[styles.word]}>{`${taam.text} , ${taam.end} - ${taam.start}`}</Text>
                                                </View>

                                            </TouchableOpacity>
                                        )
                                    })}
                                </View>
                            </ScrollView>




                            {selectedTaam !== null &&
                                <Modal visible={true} transparent={true} animationType="fade">
                                    <TouchableWithoutFeedback onPress={handleScreenClick}>
                                        <View style={styles.modalContainer}>
                                            <View style={{
                                                width: '80%',
                                                backgroundColor: 'white',
                                                height: '70%',
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
                                                        <AudioRecord url={sample_url} device_uri={sample_uri} path={path_to_sample} startTime={analysis.analysis[selectedTaam].rav_start} endTime={analysis.analysis[selectedTaam].rav_end} is_sample={true}></AudioRecord>
                                                        <AudioRecord url={analysis.url} device_uri={session_uri} path={path_to_session} startTime={analysis.analysis[selectedTaam].start} endTime={analysis.analysis[selectedTaam].end} is_sample={false}></AudioRecord>
                                                        <Text style={[styles.word]}>{`${analysis.analysis[selectedTaam].text} , ${analysis.analysis[selectedTaam].end} - ${analysis.analysis[selectedTaam].start}`}</Text>
                                                        <Text
                                                            style={{ marginBottom: 10, direction: 'rtl' }}

                                                        >{analysis.analysis[selectedTaam].exp}</Text>
                                                    </View>
                                                </>

                                            </View>
                                        </View>
                                    </TouchableWithoutFeedback>
                                </Modal>
                            }
                            {rabbi ?
                                <Modal visible={commentDialog} transparent={true} animationType="fade">
                                    <TouchableWithoutFeedback onPress={handleScreenClick}>
                                        <View style={styles.modalContainer}>
                                            <View style={styles.formContainer}>
                                                <Title title={'הוסף הערה'} subtitle="" />
                                                <UITextField
                                                    value={comment}
                                                    onChangeText={setComment}
                                                    placeholder={"הערה"}
                                                    style={styles.comment}
                                                    error={null}
                                                />
                                                <UIButton
                                                    title={'Send'}
                                                    onClick={() => {
                                                        dispatch(addComment({ comment: comment, session_id: session.id, token: token })).then(() => {
                                                            setComment('')
                                                            handleScreenClick()
                                                        })
                                                            .catch((error) => {
                                                                console.log(error)
                                                                setComment('')
                                                                //todo: add error alert ErrorAlert(error.message);
                                                            });
                                                    }}

                                                    style={styles.menuButton}
                                                />
                                            </View>

                                        </View>

                                    </TouchableWithoutFeedback>
                                </Modal>
                                :
                                <Modal visible={commentDialog} transparent={true} animationType="fade">
                                    <TouchableWithoutFeedback onPress={handleScreenClick}>
                                        <View style={styles.modalContainer}>
                                            <View style={styles.commentsContainer}>
                                                <>
                                                    <Title title={'הערות של הרב'} subtitle="" />

                                                    {session.rabbi_comments.map((cmt, index) => {
                                                        return (
                                                            <Text style={{
                                                                color: 'black',
                                                                marginRight: 10,
                                                                marginBottom: 10
                                                            }} key={index}>
                                                                • {cmt}
                                                            </Text>
                                                        )
                                                    })}
                                                </>
                                            </View>
                                        </View>

                                    </TouchableWithoutFeedback>
                                </Modal>

                            }

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
        direction: 'rtl',
        justifyContent: 'center'
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
        flex: 1,
        textAlign: 'center',
        height: 400
    },
    badWordsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        position: 'relative',
        justifyContent: 'center',
        alignContent: 'center',
        flex: 1,
        height: 400
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
    word: {
        fontSize: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    formContainer: {
        width: '90%',
        backgroundColor: 'white',
        height: '50%',
        padding: 20,
        borderRadius: 10,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'column',
    },
    commentsContainer: {
        width: '90%',
        backgroundColor: '#fff',
        height: '50%',
        padding: 20,
        borderRadius: 10,
        alignContent: 'center',
        alignItems: 'flex-start',
        flexDirection: 'column',
        direction: 'rtl'
    },
    comment: {
        width: 300,
        height: 150,
        margin: 10,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        direction: 'rtl', // Add direction to make the text right-to-left
    },
    menuButton: {
        width: 300,
        height: 50,
        margin: 10,
        padding: 10,
        backgroundColor: '#007BFF', // Change the background color to make it stand out
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000', // Add shadow for a 3D effect
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5, // Add elevation for Android shadow
    },

});
