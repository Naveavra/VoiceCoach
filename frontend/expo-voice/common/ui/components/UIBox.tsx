import { ReactNode } from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';

interface UIBoxProps extends ViewProps {
    children?: ReactNode
}

const UIBox: React.FC<UIBoxProps> = ({ children, ...rest }) => (
    <View {...rest}>
        {children}
    </View>
);

export default UIBox;