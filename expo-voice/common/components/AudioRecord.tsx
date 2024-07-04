import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { Audio } from "expo-av";
import Slider from "@react-native-community/slider";
import { FontAwesome5 } from "@expo/vector-icons";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as FileSystem from 'expo-file-system';
import { API_URL } from "../../common/config";
import { alertError, calculateDuration, getAsync, millisToTimeString, saveAsync, timeStringToMillis } from "../utils";

interface AudioRecordProps {
    device_uri: string | null;
    url: string;
    path: string;
    is_sample: boolean
    startTime: string | null; // Start time in milliseconds
    endTime: string | null;
}


const primaryColor = "#0ea5e9";

export const AudioRecord: React.FC<AudioRecordProps> = ({ url, device_uri, is_sample, path, startTime, endTime }) => {
    const [playing, setPlaying] = useState<boolean>(false);
    const [speedRate, setSpeedRate] = useState<0.5 | 1.0 | 1.5>(1.0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [duration, setDuration] = useState(0);
    const [position, setPosition] = useState(0);
    const [formatted_position, set_formatted_position] = useState(startTime ? startTime : '00:00:00')
    const [formatted_duration, set_formatted_duration] = useState(millisToTimeString(duration))
    const [downloadProgress, setDownloadProgress] = useState<number>(0);

    const [voice, setVoice] = useState<Audio.Sound | null>(null);
    const [uri, setUri] = useState<string>(device_uri || '');
    const [hasAudio, setHasAudio] = useState<boolean>(device_uri && device_uri != '' && device_uri != undefined ? true : false);


    const handleSetUri = (uri: string) => {
        setUri(uri);
        saveAsync(path, uri);
    };

    const setPlaybackRate = async () => {
        if (voice) {
            const newRate = speedRate === 0.5 ? 1.0 : speedRate === 1.0 ? 1.5 : 0.5;
            await voice.setStatusAsync({ rate: newRate });
            setSpeedRate(newRate);
        }
    };

    const callback = (downloadProgress: FileSystem.DownloadProgressData) => {
        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        setDownloadProgress(progress);
    };

    const downloadSampleResumable = FileSystem.createDownloadResumable(
        is_sample ? `${API_URL}/files/download/${url}` : `${API_URL}/session/download/${url}`,
        FileSystem.documentDirectory + `${path}.wav`,
        {},
        callback
    );

    const onPlaybackStatusUpdate = (status: any) => {
        if (status.isLoaded) {
            if (startTime && endTime) {
                setPosition(status.positionMillis - timeStringToMillis(startTime) || 0);
                setDuration(calculateDuration(startTime, endTime));
                set_formatted_position(millisToTimeString(status.positionMillis ?? startTime ?? 0))
                set_formatted_duration(endTime)
            }

            else {
                setPosition(status.positionMillis || 0);
                setDuration(status.durationMillis || 0);
                set_formatted_duration(millisToTimeString(status.durationMillis || 0))
                set_formatted_position(millisToTimeString(status.positionMillis || 0))

            }
            if (endTime && startTime && status.positionMillis >= timeStringToMillis(endTime)) {
                pausePlaying();
                setPosition(0);
                set_formatted_position(startTime)
            }
        }
    };
    const get_and_create = async () => {
        //need to download
        setIsLoading(true);
        const downloadResult = await downloadSampleResumable.downloadAsync();
        if (downloadResult) {
            handleSetUri(downloadResult.uri);
            saveAsync(path, downloadResult.uri);
            createSound();
        }
    }

    const createSound = async () => {
        try {
            // success fetch from async storage
            const { sound } = await Audio.Sound.createAsync({ uri: uri }, { shouldPlay: false }, onPlaybackStatusUpdate);
            if (startTime)
                await sound.setPositionAsync(timeStringToMillis(startTime));
            setVoice(sound);
            setIsLoading(false);
            setHasAudio(true);

        } catch (error) {
            setIsLoading(false);
            setHasAudio(false);
            alertError(String(error) ?? "Error fetching audio data", () => { });
        }
    };


    const play = async () => {
        if (voice) {
            if (startTime)
                await voice.setPositionAsync(timeStringToMillis(startTime));
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
            set_formatted_position(millisToTimeString(value))
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
            setVoice(null);
            setHasAudio(false);
            setUri('');
        }
    }
    const handlePlay = async () => {
        play()
    }


    useEffect(() => {
        if (!device_uri || device_uri == '') {
            getAsync(path).then((res) => {
                if (res) {
                    setUri(res)
                    createSound();
                }
                else {
                    get_and_create()
                }
            })
        }
        else {
            createSound()
        }
        return () => {
            if (voice) {
                voice.unloadAsync();
            }
        }
    }, [uri]);


    return (
        <>
            {hasAudio ?
                <View style={styles.container}>
                    <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={duration}
                        value={position}
                        onSlidingComplete={handleSliderValueChange}
                    />
                    <View style={styles.timeContainer}>
                        <Text style={styles.timeText}>{formatted_position}</Text>
                        <Text style={styles.timeText}>{formatted_duration}</Text>
                    </View>
                    <TouchableOpacity onPress={setPlaybackRate} style={styles.speedButton}>
                        <Text style={styles.speedText}>&times;{speedRate.toFixed(1)}</Text>
                    </TouchableOpacity>
                    <View style={styles.controlsContainer}>
                        {!startTime ?
                            <>
                                <TouchableOpacity style={{ ...styles.controlButton, marginLeft: 80 }} onPress={() => handleSkip(-10000)}>
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
                            </>
                            :
                            <Pressable style={styles.controlButton} onPress={handlePlay}>
                                <FontAwesome5
                                    name={playing ? "pause-circle" : "play-circle"}
                                    solid
                                    size={44}
                                    color={primaryColor}

                                />
                            </Pressable>
                        }

                    </View>
                </View>
                :
                <>
                    {isLoading ?
                        <>
                            <ActivityIndicator size="large" color={primaryColor} />
                            <Text>Downloading... {Math.round(downloadProgress * 100)}%</Text>
                        </>
                        :
                        <>
                            <View style={styles.downloadButton}>
                                <TouchableOpacity onPress={createSound}>
                                    <Ionicons name="cloud-download-outline" size={24} color="black" />
                                </TouchableOpacity>
                                <Text>{is_sample ? 'Download sample' : 'Download session'}</Text>
                            </View>
                        </>
                    }
                </>
            }
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        direction: 'ltr',
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
    downloadButton: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
