import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SessionData } from '../types/systemTypes';
import { UIButton } from '../ui/components';
import { Swipeable } from 'react-native-gesture-handler';
import { formatDate } from '../utils';
import { AntDesign } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AppProjectCardProps {
    session: SessionData,
    onPress: (rabbi: boolean) => void,
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
            containerStyle={styles.container}
        >
            <View style={styles.cardContainer}>
                <UIButton
                    to_tap={true}
                    title={`${formatDate(session.created_at, false)} - ${session.score}%`}
                    onClick={() => onPress(false)}
                    style={styles.card}
                />
                {session.new_comment && (
                    <View style={styles.indicator}>
                        <MaterialCommunityIcons name="alert-decagram-outline" size={20} color="black" />
                    </View>
                )}
            </View>
        </Swipeable>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: 340,
        height: 110,
        alignItems: 'center',
        justifyContent: 'center'

    },
    cardContainer: {
        position: 'relative',
        width: 300,
        margin: 5,
    },
    card: {
        flexDirection: 'row',
        height: 70,
        padding: 5,
        backgroundColor: '#007BFF',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
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
    indicator: {
        position: 'absolute',
        top: -15,
        right: -15,
    },
});

export default AppSessionCard;
