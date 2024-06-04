import React from 'react';
import { View, StyleSheet } from "react-native";
import { SessionData } from "../types/systemTypes";
import { UIButton } from '../ui/components';
import { Swipeable } from 'react-native-gesture-handler';
import { formatDate } from '../utils';

interface AppProjectCardProps {
    session: SessionData,
    onPress: () => void,
    onDelete: () => void,
    onEdit: () => void
}

const AppSessionCard: React.FC<AppProjectCardProps> = ({ session, onPress, onDelete, onEdit }) => {

    const renderRightActions = () => {
        return (
            <View style={styles.rightAction}>
                <UIButton
                    onClick={onDelete}
                    title="Delete"
                    style={styles.deleteButton}
                    textStyle={styles.actionText}
                />
            </View>
        );
    };
    const renderLeftActions = () => {
        return (
            <View style={styles.leftAction}>
                <UIButton
                    onClick={onEdit}
                    title="Edit"
                    style={styles.editButton}
                    textStyle={styles.actionText}
                />
            </View>
        );
    };


    return (
        <Swipeable
            renderRightActions={renderRightActions}
            renderLeftActions={renderLeftActions}
        >
            <UIButton
                to_tap={true}
                title={`${formatDate(session.created_at, false)}`}
                onClick={onPress}
                style={styles.card}
            />
        </Swipeable>
    );
}
const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        width: 300,
        height: 70,
        margin: 5,
        padding: 5,
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
    rightAction: {
        justifyContent: 'center',
        alignItems: 'flex-end',
        backgroundColor: 'red',
        borderRadius: 10,
        margin: 5,
        padding: 10,
    },
    leftAction: {
        justifyContent: 'center',
        alignItems: 'flex-start',
        backgroundColor: 'green',
        borderRadius: 10,
        margin: 5,
        padding: 10,
    },
    deleteButton: {
        backgroundColor: 'red',
    },
    editButton: {
        backgroundColor: 'green',
    },
    actionText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default AppSessionCard;