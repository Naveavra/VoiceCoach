import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';
import { FontAwesome5 } from '@expo/vector-icons';

interface AudioSlicePlayerProps {
    uri: string;
    startTime: number; // Start time in milliseconds
    endTime: number; // End time in milliseconds
}

const primaryColor = "#0ea5e9";

export const AudioSlicePlayer: React.FC<AudioSlicePlayerProps> = ({ uri, startTime, endTime }) => {
    const [playing, setPlaying] = useState<boolean>(false);
    const [position, setPosition] = useState<number>(startTime);
    const [duration, setDuration] = useState<number>(endTime - startTime);
    const [voice, setVoice] = useState<Audio.Sound | null>(null);

    const onPlaybackStatusUpdate = (status: any) => {
        if (status.isLoaded) {
            setPosition(status.positionMillis || 0);

            if (status.positionMillis >= endTime) {
                pausePlaying();
                setPosition(startTime);
            }
        }
    };

    const loadSound = async () => {
        try {
            const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: false }, onPlaybackStatusUpdate);
            setVoice(sound);
        } catch (error) {
            console.error("Error loading sound:", error);
        }
    };

    const play = async () => {
        if (voice) {
            await voice.playFromPositionAsync(startTime);
            setPlaying(true);
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

    const formatTime = (millis: number) => {
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    useEffect(() => {
        loadSound();
        return () => {
            if (voice) {
                voice.unloadAsync();
            }
        };
    }, [uri]);

    return (
        <View style={styles.container}>
            <Slider
                style={styles.slider}
                minimumValue={startTime}
                maximumValue={endTime}
                value={position}
                onSlidingComplete={async (value) => {
                    if (voice) {
                        await voice.setPositionAsync(value);
                        setPosition(value);
                    }
                }}
            />
            <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{formatTime(position)}</Text>
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
            <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
                <FontAwesome5
                    name={playing ? "pause-circle" : "play-circle"}
                    solid
                    size={44}
                    color={primaryColor}
                />
            </TouchableOpacity>
        </View>
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
    playButton: {
        marginTop: 20,
    },
});
