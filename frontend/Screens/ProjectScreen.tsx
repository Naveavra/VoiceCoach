import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../AppNavigation";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { useProject } from "../common/hooks/useProject";
import { useAuth, useProjects, useUtilities } from "../common/hooks";
import React, { useEffect } from "react";

import { AntDesign } from '@expo/vector-icons';
import { cleanStateMsg } from "../common/redux/projectReducer";
import { deleteAsync } from "expo-file-system";

type projectScreenProps = NativeStackScreenProps<RootStackParamList, 'Project'>;
import { LogBox } from 'react-native';
import { AudioRecord } from "../common/components/AudioRecord";
import { MaterialIcons } from '@expo/vector-icons';
LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
]);

export const ProjectScreen = ({ route, navigation }: projectScreenProps) => {
    const { useAppSelector } = useUtilities();
    const { token } = useAuth({});
    const selectedProject = useAppSelector((state) => state.projects.selectedProject);
    const { isLoadingProject, versions, error, msg, reloadData } = useProject({ token: token, project_id: selectedProject?.id || 0 })
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
                    reloadData: reloadData
                })
            },
        ]);
    }

    useEffect(() => {

        if (msg == "No sample found") {
            cleanStateMsg();
            if (!selectedProject.sample_url) {
                AddSampleAlert();
            }
        }
    }, [msg])


    return (
        <>
            <View style={styles.container}>

                <View style={styles.details}>
                    <Text style={styles.projectName}>{selectedProject.parasha} - {selectedProject.aliyah}</Text>
                    <Text style={styles.projectDescription}>{selectedProject.description}</Text>
                </View>
                <View style={styles.sampleContainer}>
                    {selectedProject.sample_url ?
                        <AudioRecord project={selectedProject}  />
                        :
                        <TouchableOpacity style={styles.addSampleContainer}
                            onPress={() => navigation.navigate('AddRecord', {
                                project: selectedProject,
                                is_sample: true,
                                reloadData: reloadData
                            })}
                        >
                            <MaterialIcons name="multitrack-audio" size={24} color='#1976d2' />
                            <Text style={styles.addSampleText}>add sample</Text>
                        </TouchableOpacity>
                    }
                </View>
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
        justifyContent: 'center',
    },
    details: {
        padding: 10,
        marginTop: 30,
        borderRadius: 10,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        bottom: 210,
    },
    sampleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        bottom: 200,
        borderRadius: 10,
        padding: 20,
        width: '90%'

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
