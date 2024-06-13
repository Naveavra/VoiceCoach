import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Button } from "react-native";
import Checkbox from 'expo-checkbox';

import { NativeStackScreenProps } from "@react-navigation/native-stack";
// import { Navigation } from 'react-native-navigation';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

import { RootStackParamList } from "../AppNavigation";
import { defaultTheme } from "../common/ui/defaultTheme";
import { AppLoader } from "../common/components/Loader";
import { UITextField, UIButton } from "../common/ui/components";
import { useAuth, useUtilities } from "../common/hooks";
import { cleanError, logIn } from "../common/redux/authReducer";
import AppPageContainer from "../common/components/AppPageContainer";
import { Title } from "../common/components/Title";
import { io } from 'socket.io-client';

type LogInScreenProps = NativeStackScreenProps<RootStackParamList, 'LogIn'>;
const SERVER_URL = 'http://192.168.68.112:3000';

export const LogInScreen = ({ navigation }: LogInScreenProps) => {
    const { dispatch } = useUtilities();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const { isLoadingUser, error, user, token } = useAuth({});
    const [remember_me, setRememberMe] = useState<boolean>(false);


    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const socket = useRef<ReturnType<typeof io> | null>(null);

    useEffect(() => {
        // Initialize WebSocket connection
        socket.current = io(SERVER_URL);

        socket.current.on('connect', () => {
            console.log('WebSocket connection opened');
        });

        socket.current.on('disconnect', () => {
            console.log('WebSocket connection closed');
        });

        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            console.log('Requesting permissions..');
            await Audio.requestPermissionsAsync();

            console.log('Starting recording..');
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            setRecording(recording);
            setIsRecording(true);

            recording.setOnRecordingStatusUpdate(async (status) => {
                if (status.isRecording) {

                }
            });

            await recording.startAsync();
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };

    const stopRecording = async () => {
        console.log('Stopping recording..');
        setIsRecording(false);
        // await recording?.stopAndUnloadAsync();
        if (recording) {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            if (uri) {
                const info = await FileSystem.getInfoAsync(uri);
                if (info.exists) {
                    const file = await FileSystem.readAsStringAsync(uri, {
                        encoding: FileSystem.EncodingType.Base64
                    });
                    if (socket.current && socket.current.connected) {
                        socket.current.emit('audio_data', file); // Send audio data to the server as base64 string
                    }
                }
            }
        }
        setRecording(null);
    };

    if (isLoadingUser) {
        return <AppLoader />
    }

    return (
        <AppPageContainer style={styles.pageContainer}>
            <>
                <View style={styles.panelContainer}>
                    <Title title={'Enter Credentials'} subtitle="" />
                    <UITextField
                        value={email}
                        onChangeText={setEmail}
                        placeholder={"Email"}
                        style={styles.email}
                        error={error}
                    />
                    <UITextField
                        value={password}
                        onChangeText={setPassword}
                        placeholder={"Password"}
                        secureTextEntry={true}
                        style={styles.password}
                        error={error}
                    />
                    <View style={styles.section}>
                        <Checkbox
                            style={styles.checkbox}
                            value={remember_me}
                            onValueChange={setRememberMe}
                        />
                        <Text style={styles.paragraph}>Remember me</Text>
                        <TouchableOpacity onPress={() => console.log('[DEBUG] forget password!')}>
                            <Text style={styles.forgetPasswordText}>Forget password?</Text>
                        </TouchableOpacity>
                    </View>

                    <UIButton
                        title={'Log In'}
                        onClick={() => {
                            dispatch(logIn({ email: email, password: password, remember_me: remember_me }));
                        }}
                        style={styles.menuButton}
                    />
                    <UIButton
                        title={'Register'}
                        onClick={() => {
                            dispatch(cleanError());
                            navigation.navigate('Register');
                        }}
                        style={styles.menuButton}
                    />
                </View>
                <View style={styles.container}>
                    <Button
                        title={isRecording ? 'Stop Recording' : 'Start Recording'}
                        onPress={isRecording ? stopRecording : startRecording}
                    />
                    <Text>{isRecording ? 'Recording...' : 'Press the button to start recording'}</Text>
                </View>
            </>
        </AppPageContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pageContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    panelContainer: {
        display: 'flex',
        width: '100%',
        marginBottom: 150,
    },
    section: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    paragraph: {
        fontSize: 15,
        marginRight: 80,
    },
    email: {
        // marginTop: defaultTheme.shape.spacing.small
    },
    password: {
        marginTop: defaultTheme.shape.spacing.small
    },
    menuButton: {
        marginTop: defaultTheme.shape.spacing.large
    },
    forgetPasswordText: {
        fontSize: 15,
        color: 'black', // Adjust the color as needed

    },
    checkbox: {
        margin: 8,
    },
});
