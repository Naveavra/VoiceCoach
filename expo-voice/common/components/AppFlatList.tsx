import { FlatList, StyleSheet, ViewStyle, ViewToken } from "react-native"


// Common Imports

import { useSharedValue } from "react-native-reanimated";
import { UIBox } from "../ui/components";
import { defaultTheme } from "../ui/defaultTheme";
import { AppFlatListItem } from "./AppFlatListItem";


interface AppDrawerProps {
    isLoading: boolean
    objects: any[]
    elements: any[]
    style?: ViewStyle
}
const AppFlatList = ({ isLoading, objects, elements, style = {} }: AppDrawerProps) => {
    const viewableItems = useSharedValue<ViewToken[]>([]);
    const data = objects?.map((object, index) => {
        return {
            object: object,
            render: elements[index],
            id: index
        }
    })

    return (
        <UIBox style={[styles.container, style]}>
            <FlatList
                data={data}
                contentContainerStyle={{ paddingTop: 30 }}
                renderItem={({ item, index }) => {
                    return (
                        <UIBox style={styles.contentItem}>
                            <AppFlatListItem item={{ object: item.object, render: item.render, id: item.id }} viewableItems={viewableItems} />
                        </UIBox >
                    )
                }}
            />
        </UIBox>
    );
}

export default AppFlatList;

const styles = StyleSheet.create({
    container: {
        height: '60%',
        flex: 1,
    },
    contentItem: {
        paddingHorizontal: defaultTheme.shape.spacing.small,
        bottom: 25
    }
});