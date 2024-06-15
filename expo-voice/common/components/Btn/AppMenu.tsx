import * as React from 'react';
import { Button, View, StyleSheet, Modal, TouchableWithoutFeedback } from 'react-native';
import { useUtilities } from '../../hooks';
import { setGlobalState } from '../../redux/globalReducer';
import { Feather } from '@expo/vector-icons';
export const AppMenu = () => {
    const { useAppSelector, dispatch } = useUtilities();
    const state = useAppSelector((state) => state.global.state);
    const [visible, setVisible] = React.useState(false);


    const closeMenu = () => setVisible(false);

    const handleScreenClick = () => {
        setVisible(false);
    }
    return (
        <>

            {state === 'MyProjects' ?
                <Feather name="user" size={30} color="black" onPress={() => setVisible(true)} />
                :
                <Feather name="users" size={30} color="black" onPress={() => setVisible(true)} />
            }
            {visible &&
                <Modal visible={true} transparent={true} animationType="fade">
                    <TouchableWithoutFeedback onPress={handleScreenClick}>
                        <View style={styles.modalContainer}>
                            <View style={{ width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
                                <Button
                                    title="My Projects"
                                    onPress={
                                        () => {
                                            dispatch(setGlobalState('MyProjects'))
                                            closeMenu()
                                        }
                                    } />
                                <Button title="Shared With Me" onPress={
                                    () => {
                                        dispatch(setGlobalState('SharedProjects'))
                                        closeMenu()
                                    }
                                } />
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            }
        </>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
});