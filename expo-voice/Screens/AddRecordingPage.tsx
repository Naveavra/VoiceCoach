import axios from "axios";

import { Audio } from "expo-av";
import { Recording } from "expo-av/build/Audio";
import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../AppNavigation";
import { API_URL } from "../common/config";

import { AntDesign } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { defaultTheme } from "../common/ui/defaultTheme";
import { Entypo } from '@expo/vector-icons';
import { useAuth, useUtilities } from "../common/hooks";
import { Feather } from '@expo/vector-icons';
import { LogBox } from 'react-native';
import { delay } from "../common/utils";
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
]);
type AddRecordingScreenProps = NativeStackScreenProps<RootStackParamList, 'AddRecord'>;

let recording: Audio.Recording;
let index = 0;

const text = "בראשית ברא אלוהים את השמיים ואת הארץ והארץ הייתה תוהו ובוהו וחושך על פני תהום ורוח אלוהים מרחפת על פני המים "
//todo: add pause recording option
export const AddRecordingScreen = ({ route, navigation }: AddRecordingScreenProps) => {
    const { dispatch, useAppSelector } = useUtilities();
    const { token } = useAuth({});

    const loopRunning = useRef<boolean>(false);
    const [permissionResponse, requestPermission] = Audio.usePermissions();
    const [loopPromise, setLoopPromise] = useState<Promise<void> | null>(null);
    const [transcript, setTranscript] = useState<string>('');
    const [status, setStatus] = useState<string>('');

    const selectedProject = useAppSelector((state) => state.projects.selectedProject);
    const selected_session = useAppSelector((state) => state.project.selectedSession);
    const { reloadData } = route.params;


    const [currentWord, setCurrentWord] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [wordColors, setWordColors] = useState<string[]>(selectedProject.clean_text.split(" ").map(() => 'black'));

    const errorAlert = () => {
        Alert.alert('error', 'something went wrong', [
            {
                text: 'okay', onPress: () => navigation.goBack()
            },
        ]);
    }
    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         setCurrentWord((prev) => (prev + 1) % selectedProject.clean_text.split(" ").length);
    //         opacity.value = 1;
    //     }, 1000);

    //     return () => clearInterval(interval);
    // }, []);

    // useEffect(() => {
    //     opacity.value = withTiming(1, { duration: 500 });
    // }, [currentWord]);

    // const animatedStyles = useAnimatedStyle(() => {
    //     return {
    //         opacity: opacity.value,
    //     };
    // });


    const handleTranscript = (data: any) => {
        setTranscript((prev) => prev + data + ' ');
        data.split(" ").forEach((word: string) => {
            console.log(word, text.split(" ")[index]);
            if (word === text.split(" ")[index]) {
                setWordColors((prev) => {
                    const newColors = [...prev];
                    newColors[index] = 'green';
                    return newColors;
                });
            }
            else if (word === text.split(" ")[index + 1]) {
                setWordColors((prev) => {
                    const newColors = [...prev];
                    newColors[index] = 'red';
                    newColors[index + 1] = 'green';
                    index += 1;
                    return newColors;
                });
            }

            else {
                setWordColors((prev) => {
                    const newColors = [...prev];
                    newColors[index] = 'red';
                    return newColors;
                });
            }
            setCurrentWord((prev) => (prev + 1) % text.split(" ").length);
            index++;
        })
    }


    const startRecording = async () => {
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
            const status = await recording.getStatusAsync();
            if (status.canPause) {
                await recording.pauseAsync();
            }
            setStatus('paused');
        } catch (error) {
            console.error('Failed to pause recording:', error);
        }
    };

    async function stopRecording(record: Recording) {
        // setRecording(recording);
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
            while (loopRunning.current) {
                const record = await startRecording();
                await delay(5000);
                if (record) {
                    await stopRecording(record);
                    sendAudioData(record);
                }
            }
        }
    }

    const stopLoop = () => {
        loopRunning.current = false;
    };

    const handleStartButtonClick = () => {
        setStatus('recording');
        const promise = loop();
        setLoopPromise(promise);
    };

    const handleStopButtonClick = async () => {
        setStatus('stopped');
        setIsLoading(true)
        stopLoop();
        if (loopPromise) {
            loopPromise.then(() => {
                setLoopPromise(null);
            });
        }
        if (recording) {
            await stopRecording(recording);
            sendAudioData(recording).then(() => {
                setIsLoading(false);
                console.log('done');
                //todo fetch analyze and move to analsis page , then set isloading to false
            });
        }

        index = 0;
    };
    // Animation shared values and styles
    const fadeIn = useSharedValue(0);
    const fadeOut = useSharedValue(1);

    const fadeInStyle = useAnimatedStyle(() => {
        return {
            opacity: withTiming(fadeIn.value, {
                duration: 1000,
                easing: Easing.linear,
            }),
        };
    });

    const fadeOutStyle = useAnimatedStyle(() => {
        return {
            opacity: withTiming(fadeOut.value, {
                duration: 1000,
                easing: Easing.linear,
            }),
        };
    });

    useEffect(() => {
        if (isLoading) {
            fadeIn.value = 1;
            fadeOut.value = 0;
        } else {
            fadeIn.value = 0;
            fadeOut.value = 1;
        }
    }, [isLoading]);

    const sendAudioData = async (recording: Audio.Recording | undefined) => {
        try {
            const url = `${API_URL}/upload/${selected_session.id}`;
            if (recording) {
                const uri = recording.getURI();
                const formData = new FormData();
                formData.append('audio', {
                    uri: uri,
                    name: 'audio.wav',
                    type: 'audio/wav',
                });

                const config = {
                    headers: {
                        'content-type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                }

                await axios.post(url, formData, config).then
                    ((response) => {
                        handleTranscript(response.data);
                    }).catch((error) => {
                        console.log('error', error);
                        stopLoop();
                    });


            }
            // setTranscript(result.data);
        } catch (error) {
            errorAlert();
        }
    }

    return (
        <>
            <View style={styles.container}>
                <View style={styles.details}>
                    <Text style={styles.projectName}>{selectedProject.parasha} - {selectedProject.aliyah}</Text>
                    <Text style={styles.projectDescription}>{selectedProject.description}</Text>
                </View>
                {transcript &&
                    <Text>{transcript}</Text>}

                <SafeAreaView style={styles.safeContainer}>
                    <View style={styles.textContainer}>
                        {text.split(" ").map((word, index) => {
                            // let color = 'black';
                            // if (index < transcript?.split(" ").length) {
                            //     color = word === transcript.split(" ")[index] ? 'green' : 'red';
                            // }

                            return (
                                <Animated.Text
                                    key={index}
                                    style={[
                                        styles.word,
                                        { color: wordColors[index] },
                                        // currentWord === index && animatedStyles,
                                        currentWord === index && styles.highlight,
                                    ]}

                                >
                                    {word}{' '}
                                </Animated.Text>
                            );
                        })}
                    </View>
                </SafeAreaView>
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

                            </>
                            :
                            status == 'stopped' ?
                                <View style={styles.itemsContainer}>
                                    {isLoading ?
                                        <Animated.View style={fadeInStyle}>
                                            <Feather name="cpu" size={24} color="black" />
                                        </Animated.View>
                                        :
                                        <Animated.View style={fadeOutStyle}>
                                            <AntDesign name="dotchart" size={24} color="black" />
                                        </Animated.View>
                                    }
                                </View>
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
    safeContainer: {
        position: 'absolute',
        top: 100,
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
        marginBottom: 10, // Adjust spacing between elements
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
});