import { Alert, Modal, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native"
import { useAuth, useProjects, useUtilities } from "../common/hooks";
import AppFlatList from "../common/components/AppFlatList";
import { AppLoader } from "../common/components/Loader";
import React, { useEffect, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../AppNavigation";
import { Title } from "../common/components/Title";
import { AntDesign } from '@expo/vector-icons';
import { cleanError, logout } from "../common/redux/authReducer";
import { Ionicons } from '@expo/vector-icons';
import { useNavigationState } from '@react-navigation/native';
import { cleanProjectsState, clearSelectedProject, deleteProject, selectProject } from "../common/redux/projectsReducer";
import { deleteAsync } from "expo-file-system";
import AppProjectCard from "../common/components/AppProjectCard";
import { SimpleLineIcons } from '@expo/vector-icons';
import { alertError, getAsync } from "../common/utils";
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
    const [visible, setVisible] = useState(false);

    const AddProjectAlert = () => {
        Alert.alert('No projects found', '', [
            {
                text: 'Cancel',
                onPress: () => { },
                style: 'cancel',
            },
            { text: 'Add Project', onPress: () => navigation.navigate('AddEditProject', { state: 'add', project_id: -1 }) },
        ]);
    }

    const cleanState = () => {
        projects.map(async (project) => {
            //todo fix
            // path_to_sample = `project_#{project.id}`
            // path_to_session = `session_${session.id}`
            deleteAsync(await getAsync(`project_${project.id}`), { idempotent: true });
        })
        dispatch(cleanProjectsState())
    }
    const deleteProjectAlert = (id: number) => {
        Alert.alert('Are you sure?', 'Deleting a project deletes all recordings and information associated with it', [
            {
                text: 'Cancel',
                onPress: () => { },
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
                onEdit={() => navigation.navigate('AddEditProject', { state: 'edit', project_id: project.id })}
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

    const handleScreenClick = () => {
        setVisible(false);
    }

    useEffect(() => {
        dispatch(clearSelectedProject())
        if (msg == "No projects found" && currentRouteName === 'Home' && state === 'MyProjects') {
            if (projects.length === 0) {
                AddProjectAlert()
            }
        }
    }, [msg, projects.length, state]);


    useEffect(() => {
        if (error)
            alertError(error, () => cleanError)
    }, [error]);

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
                        marginBottom: 1
                    }} name="add-circle-outline" size={40} color="black" onPress={() => navigation.navigate('AddEditProject', { state: 'add', project_id: -1 })} />

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



                {visible &&
                    <Modal visible={true} transparent={true} animationType="fade">
                        <TouchableWithoutFeedback onPress={handleScreenClick}>
                            <View style={styles.modalContainer}>
                                <View style={{ width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
                                    //todo : add a UITextField component for project description and title
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>
                }
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
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
