import axios from "axios";
import * as DocumentPicker from 'expo-document-picker';

import { Audio } from "expo-av";
import { Recording } from "expo-av/build/Audio";
import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../AppNavigation";
import { API_URL } from "../common/config";

import { AntDesign } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { defaultTheme } from "../common/ui/defaultTheme";
import { Entypo } from '@expo/vector-icons';
import { useAuth, useUtilities } from "../common/hooks";

type AddRecordingScreenProps = NativeStackScreenProps<RootStackParamList, 'AddRecord'>;
import { LogBox } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { setSampleUrl } from "../common/redux/projectsReducer";
import { delay } from "../common/utils";
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';

LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
]);

let recording: Audio.Recording;
let index = 0;


//todo: add pause recording option
export const AddRecordingScreen = ({ route, navigation }: AddRecordingScreenProps) => {
    const { dispatch, useAppSelector } = useUtilities();
    const { token } = useAuth({});

    const loopRunning = useRef<boolean>(false);
    const [permissionResponse, requestPermission] = Audio.usePermissions();
    const [loopPromise, setLoopPromise] = useState<Promise<void> | null>(null);
    const [transcript, setTranscript] = useState<string>('');
    const [status, setStatus] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const selectedProject = useAppSelector((state) => state.projects.selectedProject);
    const { project, is_sample, reloadData, session_id } = route.params;


    const [currentWord, setCurrentWord] = useState(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentWord((prev) => (prev + 1) % selectedProject.clean_text.split(" ").length);
            opacity.value = 1;
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        opacity.value = withTiming(0, { duration: 500 });
    }, [currentWord]);

    const animatedStyles = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        };
    });


    const handleTranscript = (data: any) => {
        data.split(" ").forEach((word: string) => {
            if (word === selectedProject.clean_text.split(" ")[index]) {
                setTranscript((prev) => prev + word + " ");
                index++;
            }
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

    const handleStopButtonClick = () => {
        setStatus('stopped');
        stopLoop();
        if (loopPromise) {
            loopPromise.then(() => {
                setLoopPromise(null);
            });
        }
    };

    const openDocumentPicker = async () => {
        try {
            const document = await DocumentPicker.getDocumentAsync();
            if (document) {
                if (document.type === 'cancel') {
                    return;
                }
                if (document.type === 'success') {
                    // Handle the selected document (e.g., display its details)
                }
                // Create FormData object to append the document
                const formData = new FormData();
                formData.append('audio', {
                    uri: document['assets'][0]['uri'],
                    name: document['assets'][0]['name'],
                    type: document['assets'][0]['mimeType'],
                });

                // Set your API URL
                const url = is_sample ? `${API_URL}/projects/${project.id}/uploade_sample` : `${API_URL}/projects/${project.id}/upload_version`;

                // Set headers for multipart/form-data
                const config = {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    },
                };

                // Send the document using Axios POST request
                //todo :put the res and err in alerts
                setIsLoading(true);
                await axios.post(url, formData, config).
                    then((response) => {
                        if (is_sample) {
                            const sampleUrl = response.data.sample_url;
                            dispatch(setSampleUrl(sampleUrl));
                            setIsLoading(false);
                        }
                        reloadData();
                        navigation.goBack();
                    })
                    .catch((error) => {
                        setIsLoading(false);
                        console.log('error', error);
                    }
                    );
            }
        } catch (error) {
            console.error('Failed to open document picker:', error);
        }
    };

    const sendAudioData = async (recording: Audio.Recording | undefined) => {
        try {
            const url = `${API_URL}/upload/${session_id}`;
            if (recording) {
                const uri = recording.getURI();
                const formData = new FormData();
                formData.append('audio', {
                    uri,
                    name: 'audio.wav',
                    type: 'audio/wav',
                });

                const config = {
                    headers: {
                        'content-type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                }

                const result = await axios.post(url, formData, config)
                handleTranscript(result.data);

            }
            // setTranscript(result.data);
        } catch (error) {
            console.error('Failed to send audio data:', error);
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
                {status == 'recording' && transcript.length > 0 && !is_sample ?
                    <>
                        <SafeAreaView style={styles.safeContainer}>
                            <View style={styles.textContainer}>
                                {selectedProject.clean_text.split(" ").map((word, index) => {
                                    let color = 'black';
                                    if (index < transcript?.split(" ").length) {
                                        color = word === transcript.split(" ")[index] ? 'green' : 'red';
                                    }

                                    return (
                                        <Animated.Text
                                            key={index}
                                            style={[
                                                styles.word,
                                                { color },
                                                currentWord === index && animatedStyles,
                                                currentWord === index && styles.highlight,
                                            ]}

                                        >
                                            {word}{' '}
                                        </Animated.Text>
                                    );
                                })}
                            </View>
                        </SafeAreaView>
                    </>
                    : null
                }
                <View style={styles.mainContainer}>
                    {status == '' ?
                        <>
                            {isLoading ? <ActivityIndicator animating={true} color={"#0ea5e9"} size={80} /> :
                                <View style={styles.itemsContainer}>

                                    <TouchableOpacity style={styles.itemContainer} onPress={handleStartButtonClick}>
                                        <FontAwesome name="microphone" size={24} color="black" />
                                        <Text style={defaultTheme.components.text}>Start Recording</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.itemContainer} onPress={openDocumentPicker}>
                                        <AntDesign name="addfile" size={24} color="black" />
                                        <Text style={defaultTheme.components.text}>Upload File</Text>
                                    </TouchableOpacity>
                                </View>
                            }
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
                            null
                    }
                </View>
            </View>
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


