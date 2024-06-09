import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useUtilities } from './common/hooks';
import { AddProjectScreen } from './Screens/AddProjectScreen';
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

export type RootStackParamList = {
    LogIn: undefined;
    Register: undefined;
    Home: undefined;
    AddProject: undefined;
    Project: { id: number };
    Session: { session: SessionData, local_uri: string };
    AddRecord: { project: ProjectData };
    Analysis: { session_id: number, analysis: Analysis };
};

const NavigationStack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigation = () => {
    const { useAppSelector, dispatch } = useUtilities();
    const isLoggedIn = useAppSelector((state) => !!state.auth.token);


    useEffect(() => {
        dispatch(initializeDetails());
    }, [dispatch]);

    return (

        <NavigationStack.Navigator>
            {isLoggedIn ? (
                <>
                    <NavigationStack.Screen name="Home" component={HomeScreen} />
                    <NavigationStack.Screen
                        name="AddProject"
                        component={AddProjectScreen}
                        options={{
                            title: 'Add Project',
                        }}
                    />
                    <NavigationStack.Screen name="Project" component={ProjectScreen} />
                    <NavigationStack.Screen
                        name="AddRecord"
                        component={AddRecordingScreen}
                        options={{
                            title: 'Add Recording',
                        }}

                    />
                    <NavigationStack.Screen name="Analysis" component={AnalysisScreen} />
                    <NavigationStack.Screen name="Session" component={SessionScreen} />
                </>
            ) : (
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
