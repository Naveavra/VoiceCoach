import React from 'react';
import { View, StyleSheet } from "react-native";
import { ProjectData } from "../types/systemTypes";
import { UIButton } from '../ui/components';
import { Swipeable } from 'react-native-gesture-handler';

interface AppProjectCardProps {
    project: ProjectData,
    onPress: () => void,
}

const AppCleanProjectCard: React.FC<AppProjectCardProps> = ({ project, onPress }) => {
    return (
        <UIButton
            to_tap={true}
            title={`${project.parasha} - ${project.aliyah}: ${project.description}`}
            onClick={onPress}
            style={styles.card}
        />
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
    }
});

export default AppCleanProjectCard;