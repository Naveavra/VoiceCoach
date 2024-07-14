import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useUtilities } from './common/hooks';
import { AddEditProjectScreen } from './Screens/AddEditProjectScreen';
import { HomeScreen } from './Screens/HomeScreen';
import { LogInScreen } from './Screens/LogInScreen';
import { ProjectScreen } from './Screens/ProjectScreen'; // Make sure to import ProjectScreen
import { Analysis, ProjectData, SessionData } from './common/types/systemTypes';
import { AddRecordingScreen } from './Screens/AddRecordingPage';
import { RegisterScreen } from './Screens/RegisterScreen';
import { useEffect } from 'react';
import { initializeDetails } from './common/redux/authReducer';
import { AnalysisScreen } from './Screens/AnalysisScreen';
import { SessionScreen } from './Screens/SessionScreen';
import { AppMenu } from './common/components/Btn/AppMenu';
import { AppComment } from './common/components/Btn/AppComment';
import { useNavigation } from '@react-navigation/native';

export type RootStackParamList = {
    LogIn: undefined;
    Register: undefined;
    Home: undefined;
    AddEditProject: { state: 'add' | 'edit' ,project_id:number};
    Project: { id: number };
    Session: { rabbi: boolean, session: SessionData, sample_url: string, session_uri: string, sample_uri: string };
    AddRecord: { project: ProjectData, sample_uri: string };
    Analysis: { session_id: number, result: Analysis, sample_uri: string, sample_url: string, path_to_sample: string, path_to_session: string };
};

const NavigationStack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigation = () => {
    const { useAppSelector, dispatch } = useUtilities();
    const isLoggedIn = useAppSelector((state) => !!state.auth.token);
    const shared = useAppSelector((state) => state.global.state);
    useEffect(() => {
        dispatch(initializeDetails());
    }, [dispatch]);





    return (

        <NavigationStack.Navigator>
            {
                isLoggedIn ?
                    (

                        (
                            <>
                                <NavigationStack.Screen name="Home" component={HomeScreen} options={{
                                    headerRight: () => <AppMenu />
                                }} />
                                <NavigationStack.Screen name="AddEditProject" component={AddEditProjectScreen} options={{ title: 'Add Project' }} />
                                <NavigationStack.Screen name="Project" component={ProjectScreen} />
                                <NavigationStack.Screen name="AddRecord" component={AddRecordingScreen} options={{ title: 'Add Recording' }} />
                                <NavigationStack.Screen name="Analysis" component={AnalysisScreen} options={{ headerLeft: () => null, headerBackVisible: false }} />
                                <NavigationStack.Screen name="Session" component={SessionScreen} options={{
                                    headerRight: () => (shared ? <AppComment /> : null),
                                }} />
                            </>
                        )
                    )
                    :
                    (
                        <>
                            <NavigationStack.Screen
                                name="LogIn"
                                component={LogInScreen}
                                options={{
                                    title: 'Log In',
                                }}

                            />
                            <NavigationStack.Screen name="Register" component={RegisterScreen} />
                        </>
                    )}
        </NavigationStack.Navigator>
    );
}
