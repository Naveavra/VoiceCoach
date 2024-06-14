import { Alert, StyleSheet, TouchableOpacity, View } from "react-native"
import { useAuth, useProjects, useUtilities } from "../common/hooks";
import AppFlatList from "../common/components/AppFlatList";
import { AppLoader } from "../common/components/Loader";
import React, { useEffect } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../AppNavigation";
import { Title } from "../common/components/Title";
import { AntDesign } from '@expo/vector-icons';
import { logout } from "../common/redux/authReducer";
import { Ionicons } from '@expo/vector-icons';
import { useNavigationState } from '@react-navigation/native';
import { cleanProjectsState, clearSelectedProject, deleteProject, selectProject } from "../common/redux/projectsReducer";
import { deleteAsync } from "expo-file-system";
import AppProjectCard from "../common/components/AppProjectCard";
import { SimpleLineIcons } from '@expo/vector-icons';
import { getAsync } from "../common/utils";
import AppCleanProjectCard from "../common/components/AppCleanProjectCard";

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen = ({ navigation }: HomeScreenProps) => {
    const { user, token } = useAuth({});
    const { dispatch, useAppSelector } = useUtilities();
    const state = useAppSelector((state) => state.global.state);
    const { isLoadingProjects, projects, error, msg, reloadData } = useProjects({ token: token });
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

    const cleanState = () => {
        projects.map(async (project) => {
            deleteAsync(await getAsync(`${project.id}_${project.created_at}`), { idempotent: true });
        })
        dispatch(cleanProjectsState())
    }
    const deleteProjectAlert = (id: number) => {
        Alert.alert('Are you sure?', 'Deleting a project deletes all recordings and information associated with it', [
            {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
            },
            {
                text: 'Delete', onPress: () => {
                    dispatch(deleteProject({
                        project_id: id,
                        token: token
                    }))
                },
            }
        ]);
    }

    const Myelements = projects.filter((project) => project.created_by == user?.email).map((project) => {
        return (
            <AppProjectCard
                key={project.id}
                project={project}
                onPress={() => {
                    dispatch(selectProject(project.id));
                    navigation.navigate('Project', { id: project.id });
                }}
                onDelete={() => deleteProjectAlert(project.id)}
                onEdit={() => console.log('edit')}
            />
        );
    });

    const sharedWithMeElements = projects.filter((project) => project.created_by != user?.email).map((project) => {
        return (
            <AppCleanProjectCard
                key={project.id}
                project={project}
                onPress={() => {
                    dispatch(selectProject(project.id));
                    navigation.navigate('Project', { id: project.id });
                }}
            />
        );
    });

    useEffect(() => {
        dispatch(clearSelectedProject())
        if (msg == "No projects found" && currentRouteName === 'Home' && state === 'MyProjects') {
            if (projects.length === 0) {
                AddProjectAlert()
            }
        }
    }, [msg, projects.length, state]);




    return (
        <>
            <View style={styles.container}>
                <Title title={`hi ${user?.name}`} subtitle="Your Projects" />
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: '30%',
                }}
                >
                    <Ionicons style={{
                        alignSelf: 'center',
                        color: '#1976d2',
                    }} name="add-circle-outline" size={40} color="black" onPress={() => navigation.navigate('AddProject')} />

                    <SimpleLineIcons name="refresh" size={35} color="#1976d2" onPress={reloadData} />

                </View>

                {isLoadingProjects ? <AppLoader /> :
                    state === 'MyProjects' ?
                        <AppFlatList isLoading={isLoadingProjects} objects={projects} elements={Myelements} />
                        :
                        <AppFlatList isLoading={isLoadingProjects} objects={projects} elements={sharedWithMeElements} />
                }
                <TouchableOpacity style={styles.itemContainer} onPress={() => {
                    cleanState()
                    dispatch(logout())
                }}>
                    <AntDesign name="logout" size={24} color="black" />
                </TouchableOpacity>
            </View>
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
