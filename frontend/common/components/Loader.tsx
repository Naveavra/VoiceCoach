import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { Easing, withRepeat, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { defaultTheme } from '../ui/defaultTheme';

export const AppLoader = () => {
    const rotation = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${rotation.value}deg` }]
        };
    });

    rotation.value = withRepeat(
        withTiming(360, { duration: 2000, easing: Easing.linear }),
        -1,
        true
    );

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.loader, animatedStyle]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loader: {
        width: 50,
        height: 50,
        backgroundColor: defaultTheme.palette.primary.main,
    }
});