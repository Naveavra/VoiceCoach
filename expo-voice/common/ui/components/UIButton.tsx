import React, { useState } from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle, TouchableOpacityProps } from 'react-native';

import { defaultTheme } from '../defaultTheme';
import { UIColor } from '../types';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface UIButtonProps {
    onClick: () => void;
    title?: string;
    color?: UIColor;
    style?: ViewStyle;
    textStyle?: TextStyle;
    to_tap?: boolean;
}

const UIButton: React.FC<UIButtonProps> = ({ onClick: onPress, color = 'primary', to_tap = false, title, style, textStyle }) => {
    const [isPressed, setIsPressed] = useState(false);
    const tap = Gesture.Tap();

    const handlePressIn = () => {
        setIsPressed(true);
    };

    const handlePressOut = () => {
        setIsPressed(false);

    };

    return (
        <>
            {
                to_tap ?
                    <GestureDetector gesture={tap}>
                        < TouchableOpacity
                            onPress={onPress}
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                            
                            style={
                                [
                                    defaultTheme.components.button.default,
                                    isPressed ? defaultTheme.components.button.pressed : {},
                                    style,
                                ]}
                        >
                            <Text style={[defaultTheme.components.button.text, textStyle]}>{title}</Text>
                        </TouchableOpacity >
                    </GestureDetector >
                    :
                    <TouchableOpacity
                        onPress={onPress}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        style={[
                            defaultTheme.components.button.default,
                            isPressed ? defaultTheme.components.button.pressed : {},
                            style,
                        ]}
                    >
                        <Text style={[defaultTheme.components.button.text, textStyle]}>{title}</Text>
                    </TouchableOpacity>
            }
        </>
    );
};

export default UIButton;