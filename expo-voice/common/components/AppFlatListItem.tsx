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
                {item.render}
            </Animated.View>
        );
    }
);


