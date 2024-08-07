import { useEffect, useState } from "react";
import { useUtilities, useAuth, useProjects } from "../common/hooks";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import AppPageContainer from "../common/components/AppPageContainer";
import { addProject, cleanError, editProject } from "../common/redux/projectsReducer";
import { UITextField, UIButton } from "../common/ui/components";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../AppNavigation";
import { Title } from "../common/components/Title";
import AppSelector from "../common/components/AppSelector";
import { aliyot, parashot } from "../common/data/torah";


type AddProjectScreenProps = NativeStackScreenProps<RootStackParamList, 'AddEditProject'>;

export const AddEditProjectScreen = ({ route, navigation }: AddProjectScreenProps) => {

    const { dispatch } = useUtilities();
    const { token } = useAuth({});
    const { error } = useProjects({ token: token });
    const { state, project_id } = route.params;

    const [parasha, setParasha] = useState('');
    const [aliyah, setAliyah] = useState('');
    const [description, setDescription] = useState('');
    const [rabbi, setRabbi] = useState('');

    const [showParashaList, setShowParashaList] = useState<boolean>(false); // Initialize showList state
    const [showAliyahList, setShowAliyahList] = useState<boolean>(false); // Initialize showList state

    const ErrorAlert = (msg: string) => {
        Alert.alert('Error', msg, [
            {
                text: 'OK',
                onPress: () => dispatch(cleanError()),
                style: 'cancel',
            }
        ]);
    }

    useEffect(() => {
        if (error) {
            ErrorAlert(error);
        }
    }, [error]);
    return (
        <AppPageContainer style={styles.pageContainer}>
            <View style={styles.formContainer}>
                <Title title={state == 'add' ? 'Add details' : 'Edit details'} subtitle="" />
                {state == 'add' &&
                    <>
                        <View style={[styles.parashaContainer, showParashaList && styles.openParashaContainer]}>
                            <AppSelector
                                showList={showParashaList}
                                setShowList={(value: boolean) => setShowParashaList(value)}
                                handleSelect={(selectedParasha: string) => setParasha(selectedParasha)}
                                data={parashot}
                                label={"פרשה"} />
                        </View>
                        <View style={[styles.parashaContainer, showAliyahList && styles.openParashaContainer]}>
                            <AppSelector
                                showList={showAliyahList}
                                setShowList={(value: boolean) => setShowAliyahList(value)}
                                handleSelect={(selectedAliyah: string) => setAliyah(selectedAliyah)}
                                data={aliyot}
                                label={"עליה"} />
                        </View>
                    </>
                }
                <UITextField
                    value={rabbi}
                    onChangeText={setRabbi}
                    onFocus={() => {
                        setShowParashaList(false)
                        setShowAliyahList(false)
                    }}
                    placeholder={"אימייל של הרב"}
                    style={styles.rabbi_email}
                    error={null}
                />
                <UITextField
                    value={description}
                    onChangeText={setDescription}
                    onFocus={() => {
                        setShowParashaList(false)
                        setShowAliyahList(false)
                    }}
                    placeholder={"תיאור"}
                    style={styles.description}
                    error={null}
                />
                <UIButton
                    title={state == 'add' ? 'Add Project' : 'Edit Project'}
                    onClick={() => {
                        if (state == 'add') {
                            dispatch(addProject({ parasha: parasha, aliyah: aliyah, description: description, token: token, rabbi_email: rabbi })).then(() => {
                                navigation.navigate('Home');
                            })
                                .catch((error) => {
                                    ErrorAlert(error.message);
                                })
                        }
                        else {
                            dispatch(editProject({
                                project_id: project_id,
                                description: description,
                                rabbi_email: rabbi,
                                token: token
                            })).then(() => {
                                navigation.navigate('Home');
                            })
                                .catch((error) => {
                                    ErrorAlert(error.message);
                                });
                        }
                    }}
                    style={styles.menuButton}
                />
            </View>
        </AppPageContainer>
    );

}

// styles
const styles = StyleSheet.create({
    pageContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    formContainer: {
        display: 'flex',// Adjust this value to move the fields up or down
        alignItems: 'center', // Center the contents horizontally
        marginBottom: 100
    },
    rabbi_email: {
        width: 300,
        height: 50,
        margin: 10,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        direction: 'rtl',
    },
    description: {
        width: 300,
        height: 100,
        margin: 10,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        direction: 'rtl', // Add direction to make the text right-to-left
    },
    parashaContainer: { // Add styles for ParashaSelector container
        height: 100, // Set a fixed height
        width: 300 // Add marginBottom to create space between ParashaSelector and other fields
    },
    openParashaContainer: { // Add styles for ParashaSelector container
        height: 250, // Set a fixed height
        width: 300 // Add marginBottom to create space between ParashaSelector and other fields
    },
    menuButton: {
        width: 300,
        height: 50,
        margin: 10,
        padding: 10,
        backgroundColor: '#007BFF', // Change the background color to make it stand out
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000', // Add shadow for a 3D effect
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5, // Add elevation for Android shadow
    },
    menuButtonText: {
        color: '#fff', // Change text color to contrast with the button background
        fontSize: 18,
        fontWeight: 'bold',
    },
});
