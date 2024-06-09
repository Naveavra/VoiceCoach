import axios from "axios";
import { Audio } from "expo-av";
import { Recording } from "expo-av/build/Audio";
import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator, Switch, BackHandler, Modal, TouchableWithoutFeedback } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../AppNavigation";
import { API_URL } from "../common/config";
import DateTimePicker from '@react-native-community/datetimepicker';
import { AntDesign } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { defaultTheme } from "../common/ui/defaultTheme";
import { Entypo } from '@expo/vector-icons';
import { useAuth, useUtilities } from "../common/hooks";
import { LogBox } from 'react-native';
import { delay, formatTime } from "../common/utils";
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import Slider from '@react-native-community/slider';
import { punctuation, similarity } from "../common/data/torah";

LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
]);

type AddRecordingScreenProps = NativeStackScreenProps<RootStackParamList, 'AddRecord'>;

let recording: Audio.Recording;
let index = 0;
let marked_index = 0;
let send = true;
let start = 0;
let end = 0;

export const AddRecordingScreen = ({ route, navigation }: AddRecordingScreenProps) => {
    const { dispatch, useAppSelector } = useUtilities();
    const { token } = useAuth({});
    const selected_session = useAppSelector((state) => state.project.selectedSession);
    const { project } = route.params;


    const loopRunning = useRef<boolean>(false);
    const [permissionResponse, requestPermission] = Audio.usePermissions();
    const [loopPromise, setLoopPromise] = useState<Promise<void> | null>(null);
    const [transcript, setTranscript] = useState<string>('');
    const [status, setStatus] = useState<string>('');
    const [recordingTime, setRecordingTime] = useState<number>(0);
    const [currentPosition, setCurrentPosition] = useState<number>(0);
    const [timerInterval, setTimerInterval] = useState<NodeJS.Timer | null>(null);

    const [help, setHelp] = useState(false);
    const toggleSwitch = () => setHelp(previousState => !previousState);

    const [currentWord, setCurrentWord] = useState(0);
    const [currentMarkedWord, setCurrentMarkedWord] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [wordColors, setWordColors] = useState<string[]>(project.clean_text.split(" ").map(() => 'black'));
    const [markedWordsColors, setMarkedWordsColors] = useState<string[]>(project.mark_text.split(" ").map(() => 'black'));
    const scrollY = useSharedValue(0);
    const errorAlert = () => {
        Alert.alert('Error', 'Something went wrong', [
            {
                text: 'Okay', onPress: () => navigation.goBack()
            },
        ]);
    }

    const sendAudioData = async (recording: Audio.Recording | undefined, done: boolean) => {
        try {
            const url = `${API_URL}/upload/${selected_session.id}`;
            if (recording) {
                const uri = recording.getURI();
                const formData = new FormData();
                formData.append('audio', {
                    uri: uri,
                    name: 'audio.wav',
                    type: 'audio/wav',
                } as any);

                const config = {
                    headers: {
                        'content-type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                }
                formData.append('done', done ? 'true' : 'false');

                if (send) {
                    if (start != 0 && start != recordingTime) {
                        formData.append('start', start.toString());
                        formData.append('end', end.toString());
                        start = 0
                        end = 0
                    }
                    await axios.post(url, formData, config)
                        .then((response) => {
                            if (!done) {
                                handleTranscript(response.data);
                            }
                        })
                        .catch((error) => {
                            console.log('error', error);
                            stopLoop();
                        });
                }
            }
        } catch (error) {
            errorAlert();
        }
    }

    const handleTranscript = (data: any) => {
        setTranscript((prev) => prev + data + ' ');
        data.split(" ").forEach((word: string) => {
            const word_from_text = project.clean_text.split(" ")[index];
            const next_word = project.clean_text.split(" ")[index + 1];
            const next_next_word = project.clean_text.split(" ")[index + 2];

            if (wordColors[index] == 'black') {
                if (word === word_from_text || similarity.get(word)?.includes(word_from_text)) {
                    setWordColors((prev) => {
                        const newColors = [...prev];
                        newColors[index] = 'green';
                        return newColors;
                    });
                    setMarkedWordsColors((prev) => {
                        const newColors = [...prev];
                        while (punctuation.has(project.mark_text.split(" ")[marked_index])) {
                            marked_index++;
                        }
                        newColors[marked_index] = 'green';
                        return newColors;
                    });
                } else if (word === next_word || similarity.get(word)?.includes(next_word)) {
                    setWordColors((prev) => {
                        const newColors = [...prev];
                        newColors[index] = 'red';
                        newColors[index + 1] = 'green';
                        index += 1;
                        return newColors;
                    });
                    setMarkedWordsColors((prev) => {
                        const newColors = [...prev];
                        while (punctuation.has(project.mark_text.split(" ")[marked_index])) {
                            marked_index++;
                        }
                        newColors[marked_index] = 'green';
                        marked_index++;
                        return newColors;
                    });
                }
                else if (word === next_next_word || similarity.get(word)?.includes(next_next_word)) {
                    setWordColors((prev) => {
                        const newColors = [...prev];
                        newColors[index] = 'red';
                        newColors[index + 1] = 'red';
                        newColors[index + 2] = 'green';
                        index += 2;
                        return newColors;
                    });
                    setMarkedWordsColors((prev) => {
                        const newColors = [...prev];
                        while (punctuation.has(project.mark_text.split(" ")[marked_index])) {
                            marked_index++;
                        }
                        newColors[marked_index] = 'green';
                        marked_index += 2;
                        return newColors;
                    });
                } else {
                    setWordColors((prev) => {
                        const newColors = [...prev];
                        newColors[index] = 'red';
                        return newColors;
                    });
                    setMarkedWordsColors((prev) => {
                        const newColors = [...prev];
                        while (punctuation.has(project.mark_text.split(" ")[marked_index])) {
                            marked_index++;
                        }
                        newColors[marked_index] = 'red';
                        return newColors;
                    });
                }
            }
            setCurrentWord((prev) => (prev + 1) % project.clean_text.split(" ").length);
            setCurrentMarkedWord((prev) => (prev + 1) % project.mark_text.split(" ").length);
            marked_index++;
            index++;
        })
    }

    const startRecording = async (): Promise<Audio.Recording | undefined> => {
        try {
            if (permissionResponse && permissionResponse.status !== 'granted') {
                await requestPermission();
            }
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });
            recording = new Audio.Recording();
            await recording.prepareToRecordAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            await recording.startAsync();
            return recording;
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    }

    const pauseRecording = async () => {
        try {
            const recording_status = await recording.getStatusAsync();
            if (recording_status.isRecording) {
                await recording.pauseAsync();
            }
            if (timerInterval) {
                clearInterval(timerInterval);
            }
            send = false;
            setStatus('paused');
            setCurrentPosition(recordingTime);
        } catch (error) {
            console.error('Failed to pause recording:', error);
        }
    };

    const resumeRecording = async () => {
        try {
            const status = await recording.getStatusAsync();
            // Check if the recording is in a state where it can be resumed
            if (status.isDoneRecording) {
                if (permissionResponse && permissionResponse.status !== 'granted') {
                    await requestPermission();
                }
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                });
                recording = new Audio.Recording();
                await recording.prepareToRecordAsync(
                    Audio.RecordingOptionsPresets.HIGH_QUALITY
                );
            }
            send = true;
            end = recordingTime;
            if (start != recordingTime) {
                setRecordingTime(start);
            }
            await recording.startAsync();
            const timer = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
            setTimerInterval(timer);
            setStatus('recording');
        } catch (error) {
            console.error('Failed to resume recording:', error);
        }
    };

    const stopRecording = async (record: Recording): Promise<string | null> => {
        await record.stopAndUnloadAsync();
        await Audio.setAudioModeAsync(
            {
                allowsRecordingIOS: false,
            }
        );
        return record.getURI();
    }

    const loop = async () => {
        if (!loopRunning.current) {
            loopRunning.current = true;
            setRecordingTime(0);
            const timer = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
            setTimerInterval(timer);
            while (loopRunning.current) {

                const record = await startRecording();
                await delay(5000);
                if (record) {
                    await stopRecording(record);
                    sendAudioData(record, false);
                }

            }
            clearInterval(timer);
        }
    }

    const stopLoop = () => {
        loopRunning.current = false;
        clearInterval(timerInterval);
    };

    const handleStartButtonClick = () => {
        setStatus('recording');
        const promise = loop();
        setLoopPromise(promise);
    };

    const handleStopButtonClick = async () => {
        setStatus('stopped');
        setIsLoading(true);
        stopLoop();
        if (loopPromise) {
            loopPromise.then(() => {
                setLoopPromise(null);
            });
        }
        if (recording) {
            await stopRecording(recording);
            sendAudioData(recording, true).then(() => {
                axios.get(`${API_URL}/analysis/${selected_session.id}`, { headers: { 'Authorization': `Bearer ${token}` } })
                    .then((response) => {
                        setIsLoading(false);
                        index = 0;
                        navigation.navigate('Analysis', {
                            analysis: response.data,
                            session_id: selected_session.id
                        });
                    });
            });
        }
    };

    useEffect(() => {
        if (currentWord > 0 && currentWord % 10 === 0) {
            scrollY.value = withTiming(scrollY.value - 20, { duration: 1000, easing: Easing.linear });
        }
    }, [currentWord]);

    useEffect(() => {
        if (currentMarkedWord > 0 && currentMarkedWord % 10 === 0) {
            scrollY.value = withTiming(scrollY.value - 20, { duration: 1000, easing: Easing.linear });
        }
    }, [currentMarkedWord]);



    const animatedStyles = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: scrollY.value }],
        };
    });


    const handleSliderChange = (value: number) => {
        value = Number(value.toFixed(2));
        console.log(value);
        setCurrentPosition(value);
        start = value;
    }


    return (
        <>
            <View style={styles.container}>
                <View style={styles.details}>
                    <Text style={styles.projectName}>{project.parasha} - {project.aliyah}</Text>
                    <Text style={styles.projectDescription}>{project.description}</Text>
                </View>
                <View style={styles.switchContainer}>
                    <Switch
                        trackColor={{ false: '#767577', true: '#1976d2' }}
                        thumbColor={help ? 'white' : 'white'}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={toggleSwitch}
                        value={help}
                        style={{ marginBottom: 10 }}
                    />
                    <Text>{help ? 'עם טעמים' : 'בלי טעמים'}</Text>
                </View>
                <SafeAreaView style={styles.safeContainer}>
                    <Animated.View style={[styles.textContainer, animatedStyles]}>
                        {help ? project.mark_text.split(" ").map((word, index) => {
                            return (
                                <Text
                                    key={index}
                                    style={[
                                        styles.word,
                                        { color: markedWordsColors[index] },
                                        currentMarkedWord === index && styles.highlight,
                                    ]}
                                >
                                    {word}{' '}
                                </Text>
                            );
                        })
                            :
                            project.clean_text.split(" ").map((word, index) => {
                                return (
                                    <Text
                                        key={index}
                                        style={[
                                            styles.word,
                                            { color: wordColors[index] },
                                            currentWord === index && styles.highlight,
                                        ]}
                                    >
                                        {word}{' '}
                                    </Text>
                                );
                            })
                        }
                    </Animated.View>
                </SafeAreaView>
                <View style={styles.transcriptContainer}>
                    {transcript && <Text>{transcript}</Text>}
                </View>
                <View style={styles.mainContainer}>
                    {status == '' ?
                        <>
                            <View style={styles.itemsContainer}>
                                <TouchableOpacity style={styles.itemContainer} onPress={handleStartButtonClick}>
                                    <FontAwesome name="microphone" size={24} color="black" />
                                    <Text style={defaultTheme.components.text}>Start Recording</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                        :
                        status == 'recording' ?
                            <>
                                <View style={{
                                    flex: 1,
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}>
                                    <View style={styles.itemsContainer}>
                                        <View style={styles.itemContainer}>
                                            <AntDesign name="pause" size={24} color="black" onPress={pauseRecording} />
                                            <Text>Pause Recording</Text>
                                        </View>
                                        <View style={styles.itemContainer}>
                                            <Entypo name="controller-stop" size={24} color="black" onPress={handleStopButtonClick} />
                                            <Text>Stop Recording</Text>
                                        </View>
                                    </View>
                                    <View style={styles.timerContainer}>
                                        <Text>Recording Time: {formatTime(recordingTime)}</Text>
                                    </View>
                                </View>
                            </>
                            :
                            status == 'paused' ?
                                <>
                                    <View style={{
                                        flex: 1,
                                        flexDirection: "column",
                                        justifyContent: "center",
                                        alignItems: "center"
                                    }}>

                                        <View style={styles.itemsContainer}>
                                            <View style={styles.itemContainer}>
                                                <Entypo name="controller-play" size={24} color="black" onPress={resumeRecording} />
                                                <Text>Resume Recording</Text>
                                            </View>
                                            <View style={styles.itemContainer}>
                                                <Entypo name="controller-stop" size={24} color="black" onPress={handleStopButtonClick} />
                                                <Text>Stop Recording</Text>
                                            </View>
                                        </View>
                                        <View style={styles.itemsContainer}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Slider
                                                    style={{ width: 200, height: 40, direction: 'ltr' }}
                                                    minimumValue={0}
                                                    maximumValue={recordingTime}
                                                    value={currentPosition}
                                                    onValueChange={handleSliderChange}
                                                    minimumTrackTintColor="#1976d2"
                                                    maximumTrackTintColor="#000000"
                                                    step={0.1}
                                                />
                                                <Text>{formatTime(currentPosition)}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </>
                                :
                                status == 'stopped' ?
                                    <>
                                        {isLoading ?
                                            <View style={styles.itemsContainer}>
                                                <ActivityIndicator animating={true} color={"#1976d2"} size={80} />
                                            </View>
                                            : null
                                        }
                                    </>
                                    :
                                    null
                    }
                </View>
            </View >
            <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.navigate('Home')}>
                <AntDesign name="home" size={24} color="black" />
            </TouchableOpacity>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',

    },
    switchContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 100,
    },
    safeContainer: {
        position: 'absolute',
        top: 150,
        overflow: 'hidden',
        height: 150,
        marginTop: 20,
    },
    transcriptContainer: {
        position: 'absolute',
        top: 350,
        width: '90%',
        padding: 10,
        borderRadius: 10,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        direction: 'rtl',
    },
    textStyle: {
        fontSize: 28,
        fontWeight: 'bold',
        fontFamily: 'Menlo',
        marginBottom: 14
    },
    details: {
        width: '90%',
        padding: 10,
        borderRadius: 10,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        position: 'absolute',
        top: 0,
    },
    mainContainer: {
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        bottom: 10,
        width: '100%',
    },
    itemContainer: {
        margin: 5,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 10,
    },
    itemsContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    homeBtn: {
        margin: 5,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 10,
        marginBottom: 100,
    },
    word: {
        fontSize: 18,
        marginRight: 5,
    },
    highlight: {
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
    projectName: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    projectDescription: {
        fontSize: 16,
    },
    textContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        direction: 'rtl',
    },
    timerContainer: {
        marginLeft: 20,
    },
    timeContainer: {
        marginTop: 16,
        backgroundColor: "white",
        borderRadius: 4,
        width: 300,
        height: 200,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        margin: 10
    },
});
