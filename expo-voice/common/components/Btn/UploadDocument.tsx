import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Text, Alert, TouchableOpacity, StyleSheet, View } from 'react-native';
import { API_URL } from '../../config';
import { setSampleUrl } from '../../redux/projectsReducer';
import { ProjectData } from '../../types/systemTypes';
import { useUtilities } from '../../hooks';
import { MaterialIcons } from '@expo/vector-icons';
import axios, { AxiosProgressEvent } from 'axios';

export interface uploadDocumentProps {
    token: string | null;
    selectedProject: ProjectData;
    reloadData: () => void;
}
const onUploadProgress = (progressEvent: AxiosProgressEvent) => {
    const { loaded, total } = progressEvent;
    if (total === 0 || total === null || total === undefined) {
        return;
    }
    let percent = Math.floor((loaded * 100) / total);
    console.log('percent:', percent);
    if (percent < 100) {
        console.log(`${loaded} bytes of ${total} bytes. ${percent}%`);
    }
};

export const UploadDocument: React.FC<uploadDocumentProps> = ({ token, selectedProject, reloadData }) => {
    const { dispatch } = useUtilities();
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    const errorAlert = (error: string) => {
        Alert.alert('Something went wrong', error, [
            {
                text: 'Okay',
                onPress: () => { },
                style: 'cancel',
            },
        ]);
    };

  
    const openDocumentPicker = async () => {
        let document: any;
        try {
            document = await DocumentPicker.getDocumentAsync();
            if (document) {
                if (document.type === 'cancel') {
                    return;
                }
                // Handle the selected document (e.g., display its details)
                const formData = new FormData();
                formData.append('audio', {
                    uri: document['assets'][0]['uri'],
                    name: document['assets'][0]['name'],
                    type: document['assets'][0]['mimeType'],
                } as any);

                // Set your API URL
                const url = `${API_URL}/projects/${selectedProject.id}/uploade_sample`;

                // Set headers for multipart/form-data
                const config = {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    },
                };

                // Send the document using Axios POST request
                setIsLoading(true);
                await axios.post(url, formData, config)
                    .then((response) => {
                        const sampleUrl = response.data.sample_url;
                        dispatch(setSampleUrl(sampleUrl));
                        setIsLoading(false);
                        reloadData();
                    })
                    .catch((error) => {
                        setIsLoading(false);
                        errorAlert('Failed to upload sample');
                    });
            }
        } catch (error) {
            if (!document.canceled) {
                errorAlert('Failed to open document picker');
            }
            return;
        }
    };

    return (
        <>
            {
                isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator animating={true} color={"#1976d2"} size={80} />
                        <Text>this may take some time ...</Text>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.addSampleContainer}
                        onPress={openDocumentPicker}
                    >
                        <MaterialIcons name="multitrack-audio" size={35} color='#1976d2' />
                        <Text style={styles.addSampleText}>Add sample</Text>
                    </TouchableOpacity>
                )
            }
        </>
    );
};

const styles = StyleSheet.create({
    addSampleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        padding: 10,
    },
    addSampleText: {
        marginTop: 10,
        fontSize: 16,
        color: '#1976d2',
        textAlign: 'center',
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
