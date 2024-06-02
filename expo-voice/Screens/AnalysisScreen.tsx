import React, { useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { RootStackParamList } from "../AppNavigation";

type AnalysisScreenProps = NativeStackScreenProps<RootStackParamList, 'Analysis'>;

export const AnalysisScreen = ({ route, navigation }: AnalysisScreenProps) => {
    const { analysis } = route.params;
    const [selectedTime, setSelectedTime] = useState<{ start: string, end: string } | null>(null);

    const handleWordClick = (index: number) => {
        const teamimEntry = analysis.teamim[index];
        setSelectedTime({ start: teamimEntry.start, end: teamimEntry.end });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.description}>{analysis.description}</Text>
            <View style={styles.wordsContainer}>
                {analysis.words.map((word, index) => {
                    const teamimEntry = analysis.teamim[index];
                    const wordColor = teamimEntry.result === "GOOD" ? "green" : "red";
                    return (
                        <TouchableOpacity key={index} onPress={() => handleWordClick(index)}>
                            <Text style={[styles.word, { color: wordColor }]}>{word}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
            {selectedTime && (
                <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>
                        Start: {selectedTime.start}, End: {selectedTime.end}
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    description: {
        fontSize: 16,
        marginBottom: 16,
    },
    wordsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    word: {
        fontSize: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    timeContainer: {
        marginTop: 16,
        padding: 8,
        backgroundColor: "#f0f0f0",
        borderRadius: 4,
    },
    timeText: {
        fontSize: 14,
        color: "#333",
    },
});
