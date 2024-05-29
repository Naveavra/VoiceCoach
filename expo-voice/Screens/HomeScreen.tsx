import { Alert, StyleSheet, TouchableOpacity } from "react-native"
import { useAuth, useProjects, useUtilities } from "../common/hooks";
import AppFlatList from "../common/components/AppFlatList";
import { AppLoader } from "../common/components/Loader";
import { useEffect } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../AppNavigation";
import { Title } from "../common/components/Title";
import { AntDesign } from '@expo/vector-icons';
import { logout } from "../common/redux/authReducer";
type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
import { Ionicons } from '@expo/vector-icons';
import { useNavigationState } from '@react-navigation/native';
import { cleanProjectsState, clearSelectedProject, deleteProject, selectProject } from "../common/redux/projectsReducer";
import { deleteAsync } from "expo-file-system";
import AppProjectCard from "../common/components/AppProjectCard";


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
    const elements = projects.map((project, index) => {
        return (
            <AppProjectCard project={project} onPress={() => {
                dispatch(selectProject(project.id))
                navigation.navigate('Project', { id: project.id })
            }

            } onDelete={() => deleteProjectAlert(project.id)} onEdit={() => console.log('edit')} />
        )
    })

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
                <AppFlatList isLoading={isLoadingProjects} objects={projects} elements={elements} />
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