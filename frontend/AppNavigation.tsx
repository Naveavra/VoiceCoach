import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useUtilities } from './common/hooks';
import { AddProjectScreen } from './Screens/AddProjectScreen';
import { HomeScreen } from './Screens/HomeScreen';
import { LogInScreen } from './Screens/LogInScreen';
import { ProjectScreen } from './Screens/ProjectScreen'; // Make sure to import ProjectScreen
import { ProjectData, SessionData } from './common/types/systemTypes';
import { AddRecordingScreen } from './Screens/AddRecordingPage';
import { RegisterScreen } from './Screens/RegisterScreen';
import { useEffect } from 'react';
import { initializeDetails } from './common/redux/authReducer';

export type RootStackParamList = {
    LogIn: undefined;
    Register: undefined;
    Home: undefined;
    AddProject: undefined;
    Project: { id: number };
    AddRecord: { project: ProjectData, is_sample: boolean, reloadData: () => void };
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
                    <NavigationStack.Screen name="AddProject" component={AddProjectScreen} />
                    <NavigationStack.Screen name="Project" component={ProjectScreen} />
                    <NavigationStack.Screen name="AddRecord" component={AddRecordingScreen} />
                </>
            ) : (
                <>
                    <NavigationStack.Screen name="LogIn" component={LogInScreen} />
                    <NavigationStack.Screen name="Register" component={RegisterScreen} />
                </>
            )}
        </NavigationStack.Navigator>
    );
}
