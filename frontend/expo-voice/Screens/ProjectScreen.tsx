import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../AppNavigation";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { useProject } from "../common/hooks/useProject";
import { useAuth, useProjects, useUtilities } from "../common/hooks";
import React, { useEffect } from "react";
import AppFlatList from "../common/components/AppFlatList";

import { AntDesign } from '@expo/vector-icons';
import { cleanStateMsg } from "../common/redux/projectReducer";
import { deleteAsync } from "expo-file-system";

type projectScreenProps = NativeStackScreenProps<RootStackParamList, 'Project'>;
import { LogBox } from 'react-native';
import { AudioRecord } from "../common/components/AudioRecord";
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import AppSessionCard from "../common/components/AppSessionCard";
import { sessionApi } from "../common/api/sessionApi";
import { clearSession } from "../common/redux/projectsReducer";

LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
]);

export const ProjectScreen = ({ route, navigation }: projectScreenProps) => {
    const { useAppSelector, dispatch } = useUtilities();
    const { token } = useAuth({});
    const selectedProject = useAppSelector((state) => state.projects.selectedProject);
    const { isLoadingProject, versions, error, msg, reloadData } = useProject({ token: token, project_id: selectedProject?.id || 0 });

    const AddSampleAlert = () => {
        Alert.alert('No sample found', '', [
            {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
            },
            {
                text: 'Add Sample', onPress: () => navigation.navigate('AddRecord', {
                    project: selectedProject,
                    is_sample: true,
                    reloadData: reloadData,
                    session_id: -1,
                })
            },
        ]);
    }
    const elements = selectedProject.sessions.map((session, index) => {
        return (
            <AppSessionCard
                session={session}
                onPress={() => { }}
                onDelete={() =>
                    sessionApi.deleteSession({ session_id: session.id, token: token }).then((res: any) => {
                        dispatch(clearSession(session.id));
                    })
                }
                onEdit={() => console.log('edit')}
            />
        )
    })

    useEffect(() => {
        if (msg == "No sample found") {
            cleanStateMsg();
            if (!selectedProject.sample_url) {
                AddSampleAlert();
            }
        }
    }, [msg]);

    return (
        <>
            <View style={styles.container}>
                <View style={styles.details}>
                    <Text style={styles.projectName}>{selectedProject.parasha} - {selectedProject.aliyah}</Text>
                    <Text style={styles.projectDescription}>{selectedProject.description}</Text>
                </View>

                <View style={styles.sampleContainer}>
                    {selectedProject.sample_url ?
                        <AudioRecord project={selectedProject} is_sample={true} />
                        :
                        <TouchableOpacity style={styles.addSampleContainer}
                            onPress={() => navigation.navigate('AddRecord', {
                                project: selectedProject,
                                is_sample: true,
                                reloadData: reloadData,
                                session_id: -1,
                            })}
                        >
                            <MaterialIcons name="multitrack-audio" size={24} color='#1976d2' />
                            <Text style={styles.addSampleText}>add sample</Text>
                        </TouchableOpacity>
                    }
                </View>
                <Ionicons style={styles.addProjectIcon} name="add-circle-outline" size={30} onPress={

                    () => {
                        sessionApi.addSession({ project_id: selectedProject.id, token: token }).then((res: any) => {
                            console.log(res, 'session added');

                            navigation.navigate('AddRecord', {
                                project: selectedProject,
                                is_sample: false,
                                reloadData: reloadData,
                                session_id: Number(res.id)
                            })
                        })
                            .catch((err: any) => {
                                console.error(err, 'error');
                            })
                    }
                } />

                <AppFlatList isLoading={false} objects={selectedProject.sessions} elements={elements} />


            </View>
            <TouchableOpacity style={styles.itemContainer} onPress={() => navigation.navigate('Home')}>
                <AntDesign name="home" size={24} color="black" />
            </TouchableOpacity>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 20, // Adjust as needed for top padding
    },
    details: {
        width: '90%',
        padding: 10,
        borderRadius: 10,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10, // Adjust spacing between elements
    },
    sampleContainer: {
        width: '90%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        padding: 20,
        marginBottom: 20, // Adjust spacing between elements
        height: 150, // Adjust height as needed
    },
    addProjectIcon: {
        color: '#1976d2',
        marginBottom: 20, // Adjust spacing between elements
    },
    itemContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 10,
        marginBottom: 100,
    },
    projectName: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    projectDescription: {
        fontSize: 16,
    },
    addSampleContainer: {
        alignItems: 'center',
    },
    addSampleText: {
        marginTop: 8,
        color: '#1976d2',
        fontSize: 16,
    },
});
