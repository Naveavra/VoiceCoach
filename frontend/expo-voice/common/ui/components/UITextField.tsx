import React from 'react';
import { TextInput, TextInputProps, Text, View, StyleSheet } from 'react-native';

import { defaultTheme } from '../defaultTheme';

interface UITextFieldProps extends TextInputProps {
    error: string | null; // Error message
}

const UITextField: React.FC<UITextFieldProps> = ({ style, error, ...restProps }) => (
    <View style={styles.container}>
        <TextInput
            style={[defaultTheme.components.textField.textInput, style]}
            {...restProps}

        />
        <Text>
            {error ? <Text style={styles.errorText}>{error}</Text>
                : null
            }
        </Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        marginBottom: 8, // Add some bottom margin to create space for the error message
    },
    errorText: {
        color: 'red', // Error message color
        fontSize: 12, // Error message font size
    },
});

export default UITextField;
