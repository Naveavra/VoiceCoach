import { Text, Button, Alert, StyleSheet, TouchableOpacity } from "react-native"
import { useAuth, useProjects, useUtilities } from "../common/hooks";
import AppSellerFlatList from "../common/components/AppFlatList";
import { AppLoader } from "../common/components/Loader";
import { useEffect, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../AppNavigation";
import { Title } from "../common/components/Title";
import { AntDesign } from '@expo/vector-icons';
import { logout } from "../common/redux/authReducer";
type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
import { Ionicons } from '@expo/vector-icons';
import { useNavigationState } from '@react-navigation/native';
import { cleanProjectsState, clearSelectedProject } from "../common/redux/projectsReducer";
import { deleteAsync } from "expo-file-system";


export const HomeScreen = ({ navigation }: HomeScreenProps) => {
    const { user, token } = useAuth({});
    const { dispatch } = useUtilities();
    const { isLoadingProjects, projects, selectedProject, error, msg } = useProjects({ token: token });
    const routeNames = useNavigationState(state => state.routeNames);
    const index = useNavigationState(state => state.index);
    const currentRouteName = routeNames[index];


    const AddProjectAlert = () => {
        Alert.alert('No projects found', '', [
            {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
            },
            { text: 'Add Project', onPress: () => navigation.navigate('AddProject') },
        ]);
    }
    const cleanState = async () => {
        projects.map((project) => {
            deleteAsync(project.device_uri, { idempotent: true });
        })
        dispatch(cleanProjectsState())
    }

    useEffect(() => {
        dispatch(clearSelectedProject())
        if (msg == "No projects found" && currentRouteName === 'Home') {
            if (projects.length === 0) {
                AddProjectAlert()
            }
        }
    }, [msg, projects.length]);

    return (
        <>
            <Title title={`hi ${user?.name}`} subtitle="this is your projects" />
            <Ionicons style={{
                marginTop: 20,
                alignSelf: 'center',
                color: '#1976d2',

            }} name="add-circle-outline" size={30} color="black" onPress={() => navigation.navigate('AddProject')} />
            {isLoadingProjects ? <AppLoader /> :
                <AppSellerFlatList isLoading={isLoadingProjects} projects={projects} />
            }
            <TouchableOpacity style={styles.itemContainer} onPress={() => {
                cleanState()
                dispatch(logout())
            }}>
                <AntDesign name="logout" size={24} color="black" />
            </TouchableOpacity>

        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
