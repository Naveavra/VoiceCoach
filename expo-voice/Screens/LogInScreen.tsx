import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
import Checkbox from 'expo-checkbox';

import { NativeStackScreenProps } from "@react-navigation/native-stack";
// import { Navigation } from 'react-native-navigation';

import { RootStackParamList } from "../AppNavigation";
import { defaultTheme } from "../common/ui/defaultTheme";
import { AppLoader } from "../common/components/Loader";
import { UITextField, UIButton } from "../common/ui/components";
import { useAuth, useUtilities } from "../common/hooks";
import { cleanError, logIn } from "../common/redux/authReducer";
import AppPageContainer from "../common/components/AppPageContainer";
import { Title } from "../common/components/Title";

type LogInScreenProps = NativeStackScreenProps<RootStackParamList, 'LogIn'>;

export const LogInScreen = ({ navigation }: LogInScreenProps) => {
    const { dispatch } = useUtilities();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const { isLoadingUser, error, user, token } = useAuth({});
    const [remember_me, setRememberMe] = useState<boolean>(false);

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
