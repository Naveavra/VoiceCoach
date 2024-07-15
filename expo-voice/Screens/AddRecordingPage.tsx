import axios from "axios";
import { Audio } from "expo-av";
import * as FileSystem from 'expo-file-system';
import { Recording } from "expo-av/build/Audio";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator, Switch, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../AppNavigation";
import { API_URL } from "../common/config";
import { AntDesign } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { defaultTheme } from "../common/ui/defaultTheme";
import { Entypo } from '@expo/vector-icons';
import { useAuth, useUtilities } from "../common/hooks";
import { LogBox } from 'react-native';
import { alertError, delay, formatTime } from "../common/utils";
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import Slider from '@react-native-community/slider';
import { punctuation, similarity } from "../common/data/torah";
import { Circle } from 'react-native-progress';
import * as stringSimilarity from 'string-similarity';
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
let recording_index = 0;
let record_time = 0;
let word_times: WordTimePair[] = [];
interface QueueItem {
    recording: Audio.Recording;
    recording_index: number;
    time: number;
}
type WordTimePair = [string, number];

export const AddRecordingScreen = ({ route, navigation }: AddRecordingScreenProps) => {
    const { dispatch, useAppSelector } = useUtilities();
    const { token } = useAuth({});
    const selected_session = useAppSelector((state) => state.project.selectedSession);
    const { project, sample_uri } = route.params;


    const loopRunning = useRef<boolean>(false);
    const [permissionResponse, requestPermission] = Audio.usePermissions();
    const [loopPromise, setLoopPromise] = useState<Promise<void> | null>(null);
    const [state, setState] = useState<string>('');
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

    const [recordings, setRecordings] = useState<QueueItem[]>([])

    const [countdown, setCountdown] = useState<number>(0);
    const [linePosition, setLinePosition] = useState<number | null>(null); // State for the line position


    const errorAlert = () => {
        Alert.alert('Error', 'Something went wrong', [
            {
                text: 'Okay', onPress: () => navigation.goBack()
            },
        ]);
    }
    const sendAudioData = async (recording: Audio.Recording, send_time: number, done: boolean) => {
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
                    if (start != 0) {
                        formData.append('start', start.toString());
                        formData.append('end', end.toString());
                        start = 0
                        end = 0
                    }
                    await axios.post(url, formData, config)
                        .then((response) => {
                            if (!done) {
                                handleTranscript(response.data, send_time);
                            }
                        })
                        .catch((error) => {
                            alertError(String(error) ?? "Error fetching audio data", () => { });
                            stopLoop();
                        });
                }
            }
        } catch (error) {
            errorAlert();
        }
    }

    const handleTranscript = (data: any, send_time: number) => {
        data.split(" ").forEach((word: string) => {

            const word_from_text = project.clean_text.split(" ")[index];
            const next_word = project.clean_text.split(" ")[index + 1];
            const next_next_word = project.clean_text.split(" ")[index + 2];

            if (wordColors[index] == 'black') {
                if (word === word_from_text || stringSimilarity.compareTwoStrings(word, word_from_text) > 0.4) {
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

                } else if (word === next_word || stringSimilarity.compareTwoStrings(word, next_word) > 0.4) {
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
                else if (word === next_next_word || stringSimilarity.compareTwoStrings(word, next_next_word) > 0.4) {
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
            word_times.push([word_from_text, send_time]);
            setCurrentWord((prev) => (prev + 1) % project.clean_text.split(" ").length);
            setCurrentMarkedWord((prev) => (prev + 1) % project.mark_text.split(" ").length);
            marked_index++;
            index++;
        })
    }

    const startRecording = async (): Promise<Audio.Recording> => {
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
            errorAlert();
            stopLoop();
            return recording;
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
            setState('paused');
            setCurrentPosition(recordingTime);
        } catch (error) {
            alertError(String(error) ?? "failed to pause recording", () => { });
        }
    };

    const resumeRecording = async () => {
        try {
            if (currentPosition != recordingTime) {
                let new_word_colors = [...wordColors];
                wordColors.forEach((color, word_index) => {
                    if (linePosition && word_index >= linePosition) {
                        new_word_colors[word_index] = 'black';
                    }
                });
                setWordColors(new_word_colors);
                if (linePosition) {
                    scrollY.value = withTiming(-1.5 * linePosition, { duration: 1000, easing: Easing.linear });
                    index = linePosition;
                    marked_index = linePosition;
                    setCurrentWord(linePosition);
                    setCurrentMarkedWord(linePosition);
                    // need to change the scroll value up to the line position

                }
                setLinePosition(null);
                start = currentPosition;
                end = recordingTime;
                setRecordingTime(currentPosition);
                record_time = currentPosition;
            }
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


            await recording.startAsync();
            const timer = setInterval(() => {
                setRecordingTime(prev => prev + 1);
                record_time++;
            }, 1000);
            setTimerInterval(timer);
            setState('recording');
        } catch (error) {
            alertError(String(error) ?? "Failed to resume recording", () => { });
        }
    };

    const stopRecording = async (record: Recording): Promise<Recording> => {
        await record.stopAndUnloadAsync();
        await Audio.setAudioModeAsync(
            {
                allowsRecordingIOS: false,
            }
        );
        return record;
    }

    const loop = useCallback(() => async () => {
        if (!loopRunning.current) {
            loopRunning.current = true;
            setRecordingTime(0);
            record_time = 0;
            const timer = setInterval(() => {
                setRecordingTime(prev => prev + 1);
                record_time++;
            }, 1000);
            setTimerInterval(timer);
            while (loopRunning.current) {
                let record = await startRecording();
                await delay(5000);
                await stopRecording(record);
                const send_time = record_time;
                setRecordings((prev) => [...prev, { recording: record, recording_index: recording_index, time: send_time }]);
                recording_index++;
            }
            clearInterval(timer);
        }
    }, [recordingTime]);
    useEffect(() => {
        if (recordings.length > 0)
            sendAudioData(recordings[recordings.length - 1].recording, recordings[recordings.length - 1].time, false)
    }, [recordings]);

    const stopLoop = () => {
        loopRunning.current = false;
        clearInterval(timerInterval);
    };

    const handleStartButtonClick = () => {
        setState('countdown');
        let counter = 3;
        setCountdown(counter);
        const countdownInterval = setInterval(() => {
            counter--;
            setCountdown(counter);
            if (counter === 1) {
                const promise = loop();
                setLoopPromise(promise);
            }
            if (counter === 0) {
                setState('recording');
                clearInterval(countdownInterval);
                setCountdown(0);
            }
        }, 1000);
    };

    const handleStopButtonClick = async () => {
        setState('stopped');
        setIsLoading(true);
        stopLoop();
        if (loopPromise) {
            loopPromise.then(() => {
                setLoopPromise(null);
            });
        }
        if (recording) {
            await stopRecording(recording);
            //sendAudioData(recordings[recordings.length - 1].recording, true).then(() => {
            sendAudioData(recording, record_time, true).then(() => {
                axios.get(`${API_URL}/analysis/${selected_session.id}`, { headers: { 'Authorization': `Bearer ${token}` } })
                    .then((response) => {
                        setIsLoading(false);
                        index = 0;
                        // get the db url from reaponse 
                        // download the file and save to async storage
                        // change the loading msg for the user
                        // get the uri from async storage or from the downloaded file
                        // navigate to the analysis page
                        //
                        //clear the recordings
                        setRecordings([]);
                        navigation.navigate('Analysis', {
                            result: response.data,
                            session_id: selected_session.id,
                            sample_uri: sample_uri,
                            sample_url: project.sample_url,
                            path_to_sample: `project_${project.id}`,
                            path_to_session: `session_${selected_session.id}`
                        });
                    });
            });
        }
    };

    useEffect(() => {
        if (currentWord > 0 && currentWord % 10 === 0) {
            scrollY.value = withTiming(scrollY.value - 10, { duration: 1000, easing: Easing.linear });
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

    //todo:change the index , maybe create a modal here and onConfirm will change everything
    const handleSliderChange = (value: number) => {
        value = Number(value.toFixed(2));
        setCurrentPosition(value);
        for (let i = 0; i < word_times.length; i++) {
            if (word_times[i][1] > value) {
                setLinePosition(i);
                scrollY.value = withTiming(-1.5 * i, { duration: 1000, easing: Easing.linear });
                break;
            }
        }
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
                <View style={styles.scrollContainer}>
                    <SafeAreaView style={styles.safeContainer}>
                        <ScrollView contentContainerStyle={styles.wordsContainer}>
                            <Animated.View style={[styles.textContainer, animatedStyles]}>
                                {help ? project.mark_text.split(" ").map((word, index) => {
                                    return (
                                        <Text
                                            key={index}
                                            style={[
                                                styles.word,
                                                { color: markedWordsColors[index] },
                                            ]}
                                        >
                                            {
                                                index == linePosition &&
                                                <View style={styles.line}>
                                                    <AntDesign name="arrowleft" size={24} color="black" />
                                                </View>}
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
                                                ]}
                                            >
                                                {
                                                    state == 'paused' && index == linePosition &&
                                                    <View style={styles.line}>
                                                        <AntDesign name="arrowleft" size={24} color="black" />
                                                    </View>}
                                                {word}{' '}
                                            </Text>
                                        );
                                    })}
                            </Animated.View>
                        </ScrollView>
                    </SafeAreaView>
                </View>

                <View style={styles.mainContainer}>
                    {state == '' ?
                        <>
                            <View style={{
                                flex: 1,
                                flexDirection: "row",
                                justifyContent: "center",
                                alignItems: "center",
                                marginTop: 30,
                                position: 'relative',
                                top: 20,

                            }}>
                                <TouchableOpacity style={styles.itemContainer} onPress={handleStartButtonClick}>
                                    <FontAwesome name="microphone" size={24} color="black" />
                                    <Text style={defaultTheme.components.text}>Start Recording</Text>
                                </TouchableOpacity>
                            </View>
                        </>

                        :
                        state == 'countdown' ?
                            <>
                                <View style={styles.countdownContainer}>
                                    <Circle
                                        size={125}
                                        progress={countdown / 3}
                                        showsText={true}
                                        formatText={() => `${countdown}`}
                                    />
                                </View>
                            </>
                            :
                            state == 'recording' ?
                                <>
                                    <View style={{
                                        flex: 1,
                                        flexDirection: "column",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        position: 'relative',
                                        top: 20,

                                    }}>
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                justifyContent: 'center',
                                                alignItems: 'center',

                                            }}>
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
                                state == 'paused' ?
                                    <>
                                        <View style={{
                                            flex: 1,
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            position: 'relative',
                                            top: 20,

                                        }}>

                                            <View
                                                style={{
                                                    flexDirection: 'row',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                }}>
                                                <View style={styles.itemContainer}>
                                                    <Entypo name="controller-play" size={24} color="black" onPress={resumeRecording} />
                                                    <Text>Resume Recording</Text>
                                                </View>
                                                <View style={styles.itemContainer}>
                                                    <Entypo name="controller-stop" size={24} color="black" onPress={handleStopButtonClick} />
                                                    <Text>Stop Recording</Text>
                                                </View>
                                            </View>

                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Slider
                                                    style={{ width: 200, height: 40, direction: 'ltr' }}
                                                    minimumValue={0}
                                                    maximumValue={recordingTime}
                                                    value={currentPosition}
                                                    onValueChange={handleSliderChange}
                                                    minimumTrackTintColor="#1976d2"
                                                    maximumTrackTintColor="#000000"
                                                    step={1}
                                                />
                                                <Text>{formatTime(currentPosition)}</Text>
                                            </View>
                                        </View>
                                    </>
                                    :
                                    state == 'stopped' ?
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

    scrollContainer: {
        width: '100%',
        height: '55%',
    },
    wordsContainer: {
        textAlign: 'right',
        direction: 'rtl',
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    safeContainer: {
        flex: 1,
        height: '70%'
    },
    textContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        direction: 'rtl',
    },
    switchContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30
    },
    details: {
        width: '90%',
        borderRadius: 10,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        marginTop: -20
    },
    mainContainer: {
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
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
    countdownContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
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

    projectName: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    projectDescription: {
        fontSize: 16,
    },
    line: {
        height: 20,
    },
    timerContainer: {
        marginLeft: 20,
    },

});
