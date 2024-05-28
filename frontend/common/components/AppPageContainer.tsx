import React from 'react';
import { ViewStyle } from 'react-native';
import { UIBox } from '../ui/components';
import { defaultTheme } from '../ui/defaultTheme';

// UI Imports


interface AppPageContainerProps {
    style?: ViewStyle;
    children?: React.ReactNode;
}

const AppPageContainer: React.FC<AppPageContainerProps> = ({ style, children }) => (
    <UIBox
        style={{
            width: '100%',
            height: '100%',
            padding: defaultTheme.shape.spacing.medium,
            ...style
        }}
    >
        {children}
    </UIBox>
);

export default AppPageContainer;