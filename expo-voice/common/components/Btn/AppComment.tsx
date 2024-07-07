import { View, StyleSheet } from "react-native";
import { EvilIcons } from '@expo/vector-icons';
import { setCommentDialog } from "../../redux/globalReducer";
import { useUtilities } from "../../hooks";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { setSeenMsg } from "../../redux/projectReducer";
import { useEffect } from "react";
export const AppComment = () => {
    const { useAppSelector, dispatch } = useUtilities();
    const selectedSession = useAppSelector((state) => state.project.selectedSession)
    const new_message = selectedSession.new_comment
    const state = useAppSelector((state) => state.global.state)
    const handleOpen = () => {
        dispatch(setCommentDialog(true))
        if (state == 'MyProjects' && new_message) {
            dispatch(setSeenMsg(selectedSession.id))
        }
    }
    useEffect(() => {

    }, [new_message, state])

    return (
        <>
            <View style={styles.container}>
                <EvilIcons name="comment" size={35} color="#1976d2" onPress={handleOpen} />
                {state == 'MyProjects' && new_message &&
                    <View style={styles.indicator}>
                        <MaterialCommunityIcons name="alert-decagram-outline" size={20} color="black" />
                    </View>
                }
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',

    },
    indicator: {
        position: 'absolute',
        top: -8,
        right: -9,
    },
    // text: {
    //     fontSize: 20,
    // },
    // modalContainer: {
    //     flex: 1,
    //     backgroundColor: 'rgba(0, 0, 0, 0.5)',
    // },
});