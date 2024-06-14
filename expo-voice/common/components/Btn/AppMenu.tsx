import * as React from 'react';
import { Button, View, StyleSheet, Modal, TouchableWithoutFeedback } from 'react-native';
import { useUtilities } from '../../hooks';
import { setGlobalState } from '../../redux/globalReducer';

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

            <Button
                onPress={() => setVisible(!visible)}
                title={state}
                color="#1976d2"
            />
            {visible &&
                <Modal visible={true} transparent={true} animationType="fade">
                    <TouchableWithoutFeedback onPress={handleScreenClick}>
                        <View style={styles.modalContainer}>
                            <View style={{ width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
                                <Button
                                    title="MyProjects"
                                    onPress={
                                        () => {
                                            dispatch(setGlobalState('MyProjects'))
                                            closeMenu()
                                        }
                                    } />
                                <Button title="SharedProjects" onPress={
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