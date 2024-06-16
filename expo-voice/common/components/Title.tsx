import { View, StyleSheet, Text } from "react-native";

export const Title = ({ title, subtitle, ...restProps }: { title: string, subtitle: string }) => {
    return (
        <View style={{
        }}>
            <Text style={[styles.title, restProps]}>{title}</Text>
            {subtitle != "" && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
    );
}


const styles = StyleSheet.create({
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center', // Center the text within the Text component
        marginVertical: 20,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center', // Center the text within the Text component
        marginBottom: 20,
    }
});