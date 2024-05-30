import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../AppNavigation";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useProject } from "../common/hooks/useProject";
import { useAuth, useUtilities } from "../common/hooks";
import React, { useEffect } from "react";
import AppFlatList from "../common/components/AppFlatList";

import { AntDesign } from '@expo/vector-icons';
import { addSession, cleanStateMsg, deleteSession, selectSession } from "../common/redux/projectReducer";

import { LogBox } from 'react-native';
import { AudioRecord } from "../common/components/AudioRecord";
import { Ionicons } from '@expo/vector-icons';
import AppSessionCard from "../common/components/AppSessionCard";
import { UploadDocument } from "../common/components/Btn/UploadDocument";
import { AppLoader } from "../common/components/Loader";
import { SimpleLineIcons } from '@expo/vector-icons';

LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
]);
type projectScreenProps = NativeStackScreenProps<RootStackParamList, 'Project'>;

export const ProjectScreen = ({ route, navigation }: projectScreenProps) => {
    const { useAppSelector, dispatch } = useUtilities();
    const { token } = useAuth({});
    const selectedProject = useAppSelector((state) => state.projects.selectedProject);
    const { isLoadingProject, sessions, error, msg, reloadData } = useProject({ token: token, project_id: selectedProject?.id || 0 });
    const elements = sessions.map((session, index) => {
        return (
            <AppSessionCard
                session={session}
                onPress={() => {
                    dispatch(selectSession({ id: session.id }));
                }}
                onDelete={() => dispatch(deleteSession({ session_id: session.id, token: token }))}//.then((res: any) => {
                //console.log(res, 'session deleted');

                // sessionApi.deleteSession({ session_id: session.id, token: token }).then((res: any) => {
                //     dispatch(cleanSession(session.id));
                // })
                // })}
                onEdit={() => { console.log("Function not implemented."); }} />
        )
    })

    useEffect(() => {
        if (msg == "No sample found") {
            cleanStateMsg();
            if (!selectedProject.sample_url) {
                // AddSampleAlert();
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
                    {
                        selectedProject.sample_url ?
                            <AudioRecord project={selectedProject} is_sample={true} />
                            :
                            <UploadDocument token={token} selectedProject={selectedProject} reloadData={reloadData} styles={styles} />
                    }
                </View>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: '30%',
                }}
                >

                    <Ionicons style={styles.addProjectIcon} color="#1976d2" name="add-circle-outline" size={40} onPress={
                        () => {
                            dispatch(addSession({ project_id: selectedProject.id, token: token })).then((res: any) => {
                                navigation.navigate('AddRecord', {
                                    project: selectedProject,
                                    reloadData: reloadData,
                                })
                            })
                                .catch((err: any) => {
                                    console.error(err, 'error');
                                })
                        }
                    } />
                    <SimpleLineIcons name="refresh" size={35} color="#1976d2" onPress={reloadData} />

                </View>
                {isLoadingProject ?
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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