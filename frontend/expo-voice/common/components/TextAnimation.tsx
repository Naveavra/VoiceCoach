import React, { useEffect, useRef } from 'react';
import { Text, View, StyleSheet, Animated } from 'react-native';

interface TextAnimatorProps {
    content: string;
    duration: number;
    onFinish?: () => void;
    style?: any;
    textStyle?: any;
}

const TextAnimator: React.FC<TextAnimatorProps> = ({
    content,
    duration,
    onFinish,
    style,
    textStyle,
}) => {
    const animatedValues = useRef<Animated.Value[]>([]);

    const textArr = content.trim().split(' ');

    useEffect(() => {
        textArr.forEach((_, i) => {
            animatedValues.current[i] = new Animated.Value(0);
        });
    }, [content]);

    const animated = (toValue: number) => {
        const animations = textArr.map((_, i) => {
            return Animated.timing(animatedValues.current[i], {
                toValue,
                duration,
                useNativeDriver: true,
            });
        });

        Animated.stagger(
            duration / 5,
            toValue === 0 ? animations.reverse() : animations
        ).start(() => {
            setTimeout(() => animated(toValue === 0 ? 1 : 0), 1000);
            if (onFinish) {
                onFinish();
            }
        });
    };

    useEffect(() => {
        animated(1);
    }, []);

    return (
        <View style={[style, styles.textWrapper]}>
            {textArr.map((word, index) => {
                return (
                    <Animated.Text
                        key={`${word}-${index}`}
                        style={[
                            textStyle,
                            {
                                opacity: animatedValues.current[index],
                                transform: [
                                    {
                                        translateY: Animated.multiply(
                                            animatedValues.current[index],
                                            new Animated.Value(-5)
                                        ),
                                    },
                                ],
                            },
                        ]}
                    >
                        {word}
                        {`${index < textArr.length ? ' ' : ''}`}
                    </Animated.Text>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    textWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
});

export default TextAnimator;
