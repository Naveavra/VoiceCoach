import React, { useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Keyboard } from "react-native";
import { RootStackParamList } from "../AppNavigation";

type AnalysisScreenProps = NativeStackScreenProps<RootStackParamList, 'Analysis'>;
import { AntDesign } from '@expo/vector-icons';

export const AnalysisScreen = ({ route, navigation }: AnalysisScreenProps) => {
    const { analysis } = route.params;
    const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
    const handleWordClick = (index: number) => {
        setSelectedWordIndex(index);
    };

    const handleScreenClick = () => {
        setSelectedWordIndex(null);
    };

    return (
        <TouchableWithoutFeedback onPress={handleScreenClick}>
            <View style={styles.container}>
                <AntDesign name="warning" size={24} color="#f44336" />
                <View style={styles.wordsContainer}>
                    {analysis.words.map((word, index) => {
                        const status = word[1];
                        const wordColor = status === 0 ? '#4caf50' : status == 1 ? '#ffc107' : status == 2 ? '#f44336' : '#2196f3';
                        const word_been_said = word[0];
                        const word_to_say = word[2];
                        if (status == 2) {
                            return (
                                <TouchableOpacity key={index} onPress={() => handleWordClick(index)}>
                                    <Text style={[styles.word, { color: wordColor }]}>{`${word_been_said} - ${word_to_say}`}</Text>
                                </TouchableOpacity>
                            )
                        }
                        else {
                            return (
                                <TouchableOpacity key={index} onPress={() => handleWordClick(index)}>
                                    <Text style={[styles.word, { color: wordColor }]}>{`${word_been_said}`}</Text>
                                </TouchableOpacity>)
                        }
                    })}
                </View>

                {selectedWordIndex !== null && (
                    <View style={styles.timeContainer}>
                        <Text>Start: {analysis.teamim[selectedWordIndex].start}</Text>
                        <Text>End: {analysis.teamim[selectedWordIndex].end}</Text>
                        <Text>Review: {analysis.teamim[selectedWordIndex].review}</Text>
                    </View>
                )}
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        direction: "rtl",
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
