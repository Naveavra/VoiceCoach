import React, { useState } from "react";
import { View, Text, StyleSheet, Linking } from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
// import { Navigation } from 'react-native-navigation';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';

import { RootStackParamList } from "../AppNavigation";
import { defaultTheme } from "../common/ui/defaultTheme";
import { AppLoader } from "../common/components/Loader";
import { UITextField, UIButton } from "../common/ui/components";
import { useAuth, useUtilities } from "../common/hooks";
import AppPageContainer from "../common/components/AppPageContainer";
import { Title } from "../common/components/Title";
import { register } from "../common/redux/authReducer";

type registerScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>;

export const RegisterScreen = ({ navigation }: registerScreenProps) => {
    const { dispatch } = useUtilities();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [success, setSuccess] = useState<boolean>(false);
    const { isLoadingUser, user, error, token } = useAuth({});
    const [title, setTitle] = useState<string>('Register');

    const openOutLook = () => {
        Linking.openURL('ms-outlook://')
    }

    const openImessage = () => {
        Linking.openURL('message://')
    }

    const openGmail = () => {
        Linking.openURL('https://gmail.app.goo.gl')
    }
    if (isLoadingUser) {
        return <AppLoader />
    }

    return (
        <AppPageContainer style={styles.pageContainer}>

            <View style={styles.panelContainer}>
                <Title title={'enter credentials'} subtitle={""} />
                <UITextField
                    value={email}
                    onChangeText={setEmail}
                    placeholder={"email"}
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
                <UIButton
                    title={title}
                    onClick={() => {
                        console.log('[DEBUG]Register!');
                        // console.log('[DEBUG] userName: ' + userName);
                        dispatch(register({ email: email, password: password })).then((res) => {
                            setTitle('confirmation mail sent!')
                            setSuccess(true);
                        }).catch((err) => {
                            setTitle('error!')
                        });
                    }}
                    style={styles.menuButton}
                />
                {success ?
                    <View style={styles.buttonRow}>
                        <Text>
                            <MaterialCommunityIcons name="microsoft-outlook" size={24} color="black" onPress={openOutLook} />
                            <View style={styles.buttonSpace} /> {/* Add space between buttons */}
                            <Feather name="message-circle" size={24} color="black" onPress={openImessage} />
                            <View style={styles.buttonSpace} /> {/* Add space between buttons */}
                            <MaterialCommunityIcons name="gmail" size={24} color="black" onPress={openGmail} />
                        </Text>
                    </View>
                    : null}
            </View>
        </AppPageContainer>

    );
}



const styles = StyleSheet.create({
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
    email: {
        // marginTop: defaultTheme.shape.spacing.small
    },
    password: {
        marginTop: defaultTheme.shape.spacing.small
    },
    menuButton: {
        marginTop: defaultTheme.shape.spacing.large
    },
    menuButtonInline: {
        marginHorizontal: defaultTheme.shape.spacing.small
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center', // Center the buttons within the row
        marginTop: defaultTheme.shape.spacing.medium,
        alignItems: 'center', // Align buttons vertically
    },
    buttonSpace: {
        width: defaultTheme.shape.spacing.medium, // Add space between buttons
    },
    forgetPassword: {
        marginTop: defaultTheme.shape.spacing.small
    },
});