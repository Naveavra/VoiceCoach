import axios from "axios";
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';

import { Audio } from "expo-av";
import { Recording } from "expo-av/build/Audio";
import { useRef, useState } from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../AppNavigation";
import { API_URL } from "../common/config";

import { AntDesign } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { defaultTheme } from "../common/ui/defaultTheme";
import { Entypo } from '@expo/vector-icons';
import { useAuth, useUtilities } from "../common/hooks";
let recording: Audio.Recording;
let recordings = [];

type AddRecordingScreenProps = NativeStackScreenProps<RootStackParamList, 'AddRecord'>;
import { LogBox } from 'react-native';
import { ActivityIndicator, MD2Colors } from 'react-native-paper';
import { setSampleUrl } from "../common/redux/projectsReducer";

LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
]);
export const AddRecordingScreen = ({ route, navigation }: AddRecordingScreenProps) => {
    const [permissionResponse, requestPermission] = Audio.usePermissions();
    const {dispatch} = useUtilities();
    const { token } = useAuth({});
    const [loopPromise, setLoopPromise] = useState<Promise<void> | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState<string[]>([]);
    const { project, is_sample, reloadData } = route.params;
    const [status, setStatus] = useState<string>('');
    const loopRunning = useRef<boolean>(false);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const delay = (milliseconds: number | undefined) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    };

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
        setIsRecording(true);
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
        setIsRecording(false);
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
                        const sampleUrl = response.data.sample_url;
                        dispatch(setSampleUrl(sampleUrl));
                        setIsLoading(false);
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
            const url = `${API_URL}/upload`;
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
                setTranscript([...transcript, result.data])
            }
            // setTranscript(result.data);
        } catch (error) {
            console.error('Failed to send audio data:', error);
        }
    }

    return (
        <>
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',

            }}>
                {status == '' ?

                    <>
                        <View style={styles.mainContainer}>
                            {isLoading ? <ActivityIndicator animating={true} color={"#0ea5e9"} size={80} /> :
                                <View style={styles.lineContainer}>

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

                        </View>

                    </> :
                    status == 'recording' ?
                        <>
                            <View style={styles.mainContainer}>
                                <View style={styles.itemContainer}>
                                    <AntDesign name="pause" size={24} color="black" onPress={pauseRecording} />
                                    <Text>Pause Recording</Text>
                                </View>
                                <View style={styles.itemContainer}>
                                    <Entypo name="controller-stop" size={24} color="black" onPress={handleStopButtonClick} />
                                    <Text>Stop Recording</Text>
                                </View>
                            </View>
                        </> :
                        <View style={styles.itemContainer}>
                            <AntDesign name="playcircleo" size={24} color="black" />
                            <Text>Play full Sound </Text>
                        </View>
                }

                {transcript &&
                    transcript.map((sentence, index) => (
                        <Text key={index}>{sentence}</Text>
                    ))}
                {sound && <Text>Playing Sound</Text>}
                <TouchableOpacity style={styles.itemContainer} onPress={() => navigation.navigate('Home')}>
                    <AntDesign name="home" size={24} color="black" />
                </TouchableOpacity>
            </View>
        </>
    );
}



const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 350,
    },
    lineContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemContainer: {
        margin: 5,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 10,
        marginBottom: 100,
    },
});

// const styles = StyleSheet.create({
//     mainContainer: {
//         flex: 1,
//         flexDirection: 'row',
//         justifyContent: 'center',
//         alignItems: 'flex-end', // Align items at the bottom
//         marginBottom: 20, // Add margin at the bottom
//     },
//     itemContainer: {
//         marginHorizontal: 10, // Add horizontal margin between items
//     },
// });