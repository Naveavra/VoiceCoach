import { useState } from "react";
import { View, StyleSheet, Text, Modal, TouchableWithoutFeedback } from "react-native";
import { EvilIcons } from '@expo/vector-icons';

export const AppComment = () => {
    const [open, setOpen] = useState(false);

    const handleScreenClick = () => {
        setOpen(false);
    }

    return (
        <>
            <View style={styles.container}>
                <Text style={styles.text}>This is a comment</Text>
                <EvilIcons name="comment" size={24} color="#1976d2" onPress={() => setOpen(true)} />
            </View>
            <Modal visible={open} transparent={true} animationType="fade">
                <TouchableWithoutFeedback onPress={handleScreenClick}>
                    <View style={styles.modalContainer}>

                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 20,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
});