import React from 'react';
import { StyleSheet, View, ViewToken } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withTiming,
} from 'react-native-reanimated';

type ListItemProps = {
    viewableItems: Animated.SharedValue<ViewToken[]>;
    item: {
        object: any;
        render: React.ReactNode;
        id: number;
    };
};

export const AppFlatListItem: React.FC<ListItemProps> = React.memo(
    ({ item, viewableItems }) => {
        const rStyle = useAnimatedStyle(() => {
            const isVisible = Boolean(
                viewableItems.value
                    .filter((item) => item.isViewable)
                    .find((viewableItem) => viewableItem.item.id === item.id)
            );

            return {
                opacity: withTiming(isVisible ? 1 : 0),
                transform: [
                    {
                        scale: withTiming(isVisible ? 1 : 0.6),
                    },
                ],
            };
        }, []);

        return (
            <Animated.View
                style={[
                    {
                        marginTop: 10,
                        marginBottom: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                    },

                ]}
            >
                {/* Replace the Animated.View with AppPartyCard */}
                {item.render}
            </Animated.View>
        );
    }
);


