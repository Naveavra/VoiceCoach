import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Pressable, StyleSheet, Dimensions } from "react-native";
import { Audio, AVPlaybackStatus } from "expo-av";
import Slider from "@react-native-community/slider";
import { FontAwesome5 } from "@expo/vector-icons";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as FileSystem from 'expo-file-system';
import { API_URL } from "../../common/config";
import { AntDesign } from '@expo/vector-icons';
import { useUtilities } from "../hooks";
import { setDeviceUri } from "../redux/projectsReducer";
import { ProjectData } from "../types/systemTypes";

interface AudioRecordProps {
    project: ProjectData
}

const primaryColor = "#0ea5e9";

export const AudioRecord: React.FC<AudioRecordProps> = ({ project }) => {
    const { dispatch } = useUtilities();
    const [playing, setPlaying] = useState<boolean>(false);
    const [speedRate, setSpeedRate] = useState<0.5 | 1.0 | 1.5>(1.0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [duration, setDuration] = useState(0);
    const [position, setPosition] = useState(0);

    const [voice, setVoice] = useState<Audio.Sound | null>(null);
    const [uri, setUri] = useState<string>(project.device_uri || '');
    const [hasAudio, setHasAudio] = useState<boolean>(project.device_uri != '' && project.device_uri != undefined ? true : false);
    const handleSetUri = (uri: string) => {
        setUri(uri);
        dispatch(setDeviceUri(uri));
    };

    const setPlaybackRate = async () => {
        if (voice) {
            const newRate = speedRate === 0.5 ? 1.0 : speedRate === 1.0 ? 1.5 : 0.5;
            await voice.setStatusAsync({ rate: newRate });
            setSpeedRate(newRate);
        }
    };

    const downloadSampleResumable = FileSystem.createDownloadResumable(
        `${API_URL}/files/download/${project.sample_url}`,
        FileSystem.documentDirectory + `recording_${project.id}.wav`,
    );

    // const get = async () => {
    //     try {
    //         setIsLoading(true);
    //         const downloadResult = await downloadSampleResumable.downloadAsync();
    //         if (downloadResult) {
    //             const { uri } = downloadResult;
    //             handleSetUri(uri);
    //             setIsLoading(false);
    //             return uri;
    //         }
    //     } catch (e) {
    //         setIsLoading(false);
    //         console.error(e);
    //     }
    //     return '';
    // };

    const onPlaybackStatusUpdate = (status: any) => {
        if (status.isLoaded) {
            setPosition(status.positionMillis || 0);
            setDuration(status.durationMillis || 0);
        }
    };

    const createSound = async () => {
        try {
            let localUri = uri;
            if (!localUri) {
                setIsLoading(true);
                const downloadResult = await downloadSampleResumable.downloadAsync();
                if (downloadResult) {
                    localUri = downloadResult.uri;
                    handleSetUri(localUri);
                    setIsLoading(false);
                }
            }

            if (localUri) {
                const { sound } = await Audio.Sound.createAsync({ uri: localUri }, { shouldPlay: false }, onPlaybackStatusUpdate);
                setVoice(sound);
                setHasAudio(true);
            }
        } catch (error) {
            console.error(error);
        }
    };


    const play = async () => {
        if (voice) {
            await voice.playAsync();
            setPlaying(true);
            voice.setOnPlaybackStatusUpdate(async (status) => {
                onPlaybackStatusUpdate(status);
                if (status.didJustFinish) {
                    await voice.unloadAsync();
                    setPlaying(false);
                    setVoice(null);
                    setPosition(0);
                    const { sound } = await Audio.Sound.createAsync({ uri: uri }, { shouldPlay: false }, onPlaybackStatusUpdate);
                    setVoice(sound);
                    // FileSystem.deleteAsync(uri);

                }
            });
        }
    };

    const pausePlaying = async () => {
        if (voice) {
            await voice.pauseAsync();
            setPlaying(false);
        }
    };

    const handlePlayPause = async () => {
        if (voice) {
            const status = await voice.getStatusAsync();
            if (status.isPlaying) {
                pausePlaying();
            } else {
                play();
            }
        }
    };

    const handleSliderValueChange = async (value: number) => {
        if (voice) {
            await voice.setPositionAsync(value);
            setPosition(value);
        }
    };

    const handleSkip = async (amount: number) => {
        if (voice) {
            const status = await voice.getStatusAsync();
            if (status.isLoaded) {
                let newPosition = status.positionMillis + amount;
                if (newPosition < 0) newPosition = 0;
                if (newPosition > duration) newPosition = duration;
                await voice.setPositionAsync(newPosition);
                setPosition(newPosition);
            }
        }
    };
    const clearRecording = async () => {
        if (voice) {
            await voice.unloadAsync();
            FileSystem.deleteAsync(uri);
            dispatch(setDeviceUri(''));
            setVoice(null);
            setHasAudio(false);
            setUri('');
        }
    }

    const formatTime = (millis: number) => {
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    useEffect(() => {
        if (uri) {
            createSound();
        }
        return () => {
            if (voice) {
                voice.unloadAsync();
            }
        }
    }, [uri]);


    return (
        <>
            {hasAudio ? (
                <View style={styles.container}>
                    <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={duration}
                        value={position}
                        onSlidingComplete={handleSliderValueChange}
                    />
                    <View style={styles.timeContainer}>
                        <Text style={styles.timeText}>{formatTime(position)}</Text>
                        <Text style={styles.timeText}>{formatTime(duration)}</Text>
                    </View>
                    <TouchableOpacity onPress={setPlaybackRate} style={styles.speedButton}>
                        <Text style={styles.speedText}>&times;{speedRate.toFixed(1)}</Text>
                    </TouchableOpacity>
                    <View style={styles.controlsContainer}>
                        <AntDesign name="delete" size={35} color="black" style={{ marginRight: 30 }} />
                        <TouchableOpacity style={styles.controlButton} onPress={() => handleSkip(-10000)}>
                            <MaterialIcons name="replay-10" size={35} color="black" />
                        </TouchableOpacity>
                        <Pressable style={styles.controlButton} onPress={handlePlayPause}>
                            <FontAwesome5
                                name={playing ? "pause-circle" : "play-circle"}
                                solid
                                size={44}
                                color={primaryColor}
                            />
                        </Pressable>
                        <TouchableOpacity style={styles.controlButton} onPress={() => handleSkip(10000)}>
                            <MaterialIcons name="forward-10" size={35} color="black" />
                        </TouchableOpacity>
                        <MaterialIcons name="cleaning-services" size={35} color="black" style={{ marginLeft: 30 }} onPress={clearRecording} />

                    </View>
                </View>
            ) : (
                <>
                    {isLoading ? (
                        <>
                            <MaterialIcons name="downloading" size={24} color="black" />
                            <Text>Downloading...</Text>
                        </>
                    ) : (
                        <>
                            <TouchableOpacity onPress={createSound}>
                                <Ionicons name="cloud-download-outline" size={24} color="black" />
                            </TouchableOpacity>
                            <Text>Download sound</Text>
                        </>
                    )}
                </>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
    },
    slider: {
        width: '100%',
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 5,
    },
    timeText: {
        fontSize: 16,
    },
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginTop: 20,
    },
    controlButton: {
        marginHorizontal: 10, // Adjust this value to change spacing
    },
    speedButton: {
        alignItems: 'center', // Pushes the speed button to the far right
    },
    speedText: {
        fontSize: 16,
        color: primaryColor,
    },
});