import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../AppNavigation";
import { useAuth, useUtilities } from "../common/hooks";
import axios from "axios";
import { API_URL } from "../common/config";
import AppFlatList from "../common/components/AppFlatList";
import { AntDesign, SimpleLineIcons, Ionicons } from '@expo/vector-icons';
import { LogBox } from 'react-native';
import { AudioRecord } from "../common/components/AudioRecord";
import { UploadDocument } from "../common/components/Btn/UploadDocument";
import { AppLoader } from "../common/components/Loader";
import { addSession, cleanStateMsg, deleteSession, selectSession } from "../common/redux/projectReducer";
import { selectProject } from "../common/redux/projectsReducer";
import { getAsync } from "../common/utils";
import AppSessionCard from "../common/components/AppSessionCard";
import { useProject } from "../common/hooks/useProject";

LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
]);

type ProjectScreenProps = NativeStackScreenProps<RootStackParamList, 'Project'>;

export const ProjectScreen = ({ route, navigation }: ProjectScreenProps) => {
    const { useAppSelector, dispatch } = useUtilities();
    const { token } = useAuth({});
    const selectedProject = useAppSelector((state) => state.projects.selectedProject);
    const { isLoadingProject, sessions, error, msg, reloadData } = useProject({ token: token, project_id: selectedProject?.id || 0 });
    const [deviceUrl, setDeviceUrl] = useState<string>('');
    const [loadingUri, setLoadingUri] = useState<boolean>(true);
    console.log(sessions)
    useEffect(() => {
        const fetchSampleUri = async () => {
            if (selectedProject?.sample_url) {
                try {
                    const res = await getAsync(`${selectedProject.id}_${selectedProject.created_at}`);
                    setDeviceUrl(res ?? '');
                    setLoadingUri(false);
                } catch (err) {
                    console.error("Error fetching sample URI:", err);
                    setLoadingUri(false);
                }
            }
        };

        fetchSampleUri();
    }, [selectedProject]);

    useEffect(() => {
        if (msg == "No sample found") {
            cleanStateMsg();
            if (!selectedProject.sample_url) {
                // AddSampleAlert();
            }
        }
    }, [msg]);

    const elements = sessions.map((session, index) => {
        return (
            <AppSessionCard
                key={index}
                session={session}
                onPress={() => {
                    navigation.navigate('Session', { session: session });
                }}
                onDelete={() => dispatch(deleteSession({ session_id: session.id, token: token }))}
                onEdit={() => { console.log("Function not implemented."); }}
            />
        );
    });

    return (
        <>
            <View style={styles.container}>
                <View style={styles.details}>
                    <Text style={styles.projectName}>{selectedProject.parasha} - {selectedProject.aliyah}</Text>
                    <Text style={styles.projectDescription}>{selectedProject.description}</Text>
                </View>

                <View style={styles.sampleContainer}>
                    {
                        selectedProject.sample_url ?
                            (
                                loadingUri ?
                                    <AppLoader /> :
                                    <AudioRecord
                                        device_uri={deviceUrl}
                                        url={selectedProject.sample_url}
                                        path={`${selectedProject.id}_${selectedProject.created_at}`}
                                        is_sample={true} />
                            )
                            :
                            <UploadDocument token={token} selectedProject={selectedProject} reloadData={reloadData} styles={styles} />
                    }
                </View>
                <View style={styles.actionButtonsContainer}>
                    <Ionicons style={styles.addProjectIcon} color="#1976d2" name="add-circle-outline" size={40} onPress={
                        () => {
                            dispatch(addSession({ project_id: selectedProject.id, token: token })).then((res: any) => {
                                navigation.navigate('AddRecord', {
                                    project: selectedProject,
                                    reloadData: reloadData,
                                });
                            }).catch((err: any) => {
                                console.error("Error adding session:", err);
                            });
                        }
                    } />
                    <SimpleLineIcons name="refresh" size={35} color="#1976d2" onPress={reloadData} />
                </View>
                {isLoadingProject ?
                    <View style={styles.loaderContainer}>
                        <AppLoader />
                    </View>
                    :
                    <AppFlatList isLoading={isLoadingProject} objects={sessions} elements={elements} />
                }
            </View>
            <TouchableOpacity style={styles.itemContainer} onPress={() => navigation.navigate('Home')}>
                <AntDesign name="home" size={24} color="black" />
            </TouchableOpacity>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 20,
    },
    details: {
        width: '90%',
        padding: 10,
        borderRadius: 10,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    sampleContainer: {
        width: '90%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
        height: 150,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '30%',
    },
    addProjectIcon: {
        color: '#1976d2',
        marginBottom: 20,
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
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
