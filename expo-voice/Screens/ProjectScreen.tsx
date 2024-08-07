import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../AppNavigation";
import { useAuth, useUtilities } from "../common/hooks";
import AppFlatList from "../common/components/AppFlatList";
import { AntDesign, SimpleLineIcons, Ionicons } from '@expo/vector-icons';
import { LogBox } from 'react-native';
import { AudioRecord } from "../common/components/AudioRecord";
import { UploadDocument } from "../common/components/Btn/UploadDocument";
import { AppLoader } from "../common/components/Loader";
import { addSession, cleanSession, cleanStateMsg, deleteSession, selectSession, setSeenMsg } from "../common/redux/projectReducer";
import { formatDate, getAsync } from "../common/utils";
import AppSessionCard from "../common/components/AppSessionCard";
import { useProject } from "../common/hooks/useProject";
import AppCleanSessionCard from "../common/components/AppCleanSessionCard";
import { SessionData } from "../common/types/systemTypes";

LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
]);

type ProjectScreenProps = NativeStackScreenProps<RootStackParamList, 'Project'>;

export const ProjectScreen = ({ route, navigation }: ProjectScreenProps) => {

    const { useAppSelector, dispatch } = useUtilities();
    const { token } = useAuth({});

    const state = useAppSelector((state) => state.global.state);
    const selectedProject = useAppSelector((state) => state.projects.selectedProject);
    const { isLoadingProject, project, sessions, error, msg, reloadData } = useProject({ token: token, project_id: selectedProject.id });

    const [deviceUrl, setDeviceUrl] = useState<string>('');
    const [loadingUri, setLoadingUri] = useState<boolean>(true);

    useEffect(() => {
        const fetchSampleUri = async () => {
            if (selectedProject.sample_url) {
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
        dispatch(cleanSession())
    }, [msg]);

    const handlePress = async (session: SessionData, rabbi: boolean) => {
        //path_to_sample
        const path_sample_uri = `project_${project.id}`;
        const path_session_uri = `session_${session.id}`
        const sample_uri = await getAsync(path_sample_uri);
        const session_uri = await getAsync(path_session_uri);
        dispatch(selectSession(session.id))
        navigation.navigate('Session', { rabbi: rabbi, session: session, sample_url: selectedProject.sample_url, sample_uri: sample_uri, session_uri: session_uri });
    };

    const elements = sessions.map((session, index) => {
        const commonProps = {
            key: index,
            session: session,
            onPress: (rabbi: boolean) => handlePress(session, rabbi),
        };

        if (state === 'SharedProjects') {
            return <AppCleanSessionCard {...commonProps} />;
        }
        return (
            <AppSessionCard
                {...commonProps}
                onDelete={() => dispatch(deleteSession({ session_id: session.id, token }))}
                onEdit={() => {  }}
            />
        );
    });

    useEffect(() => {

    }, [sessions])
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
                                        path={`project_${selectedProject.id}`}
                                        is_sample={true} startTime={null} endTime={null}
                                        to_download={false}
                                    />
                            )
                            :
                            <UploadDocument token={token} selectedProject={selectedProject} reloadData={reloadData} />
                    }
                </View>
                <View style={styles.actionButtonsContainer}>
                    <Ionicons disabled={isLoadingProject || !selectedProject.sample_url} style={styles.addProjectIcon} color={isLoadingProject || !selectedProject.sample_url ? "#e0e0e0" : "#1976d2"} name="add-circle-outline" size={40} onPress={
                        () => {

                            dispatch(addSession({ project_id: selectedProject.id, token: token })).then((res: any) => {
                                navigation.navigate('AddRecord', {
                                    project: project,
                                    sample_uri: deviceUrl,
                                });
                            }).catch((err: any) => {
                                console.error("Error adding session:", err);
                            });
                        }
                    } />
                    <View
                        style={{
                            marginTop: 2,
                        }}>
                        <SimpleLineIcons disabled={isLoadingProject} name="refresh" size={35} color={isLoadingProject ? "#e0e0e0" : "#1976d2"} onPress={reloadData} />
                    </View>
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
        marginBottom: 20,
    },
    itemContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 10,
        marginBottom: 100,
        marginTop: 15
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
