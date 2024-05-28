import { FlatList, ListRenderItemInfo, StyleSheet, View, ViewStyle, ViewToken } from "react-native"


// Common Imports

import { ProjectData } from "../types/systemTypes";
import { useSharedValue } from "react-native-reanimated";
import { UIBox } from "../ui/components";
import { defaultTheme } from "../ui/defaultTheme";
import { AppFlatListItem } from "./AppFlatListItem";
import AppProjectCard from "./AppProjectCard";
import { useAuth, useUtilities } from "../hooks";
import { deleteProject, selectProject } from "../redux/projectsReducer";


interface AppDrawerProps {
    isLoading: boolean
    projects: ProjectData[]
    style?: ViewStyle
}
const AppSellerFlatList = ({ isLoading, projects, style = {} }: AppDrawerProps) => {
    const { navigate, dispatch } = useUtilities();
    const { token } = useAuth({});
    const viewableItems = useSharedValue<ViewToken[]>([]);
    const data = projects?.map((project, index) => {
        return {
            project: project,
            render: <AppProjectCard project={project} onPress={() => {
                dispatch(selectProject(project.id))
                navigate('Project')
            }

            } onDelete={() => dispatch(deleteProject({
                project_id: project.id,
                token: token
            }))} onEdit={() => console.log('edit')} />,
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
                        <UIBox style={index > 0 ? styles.contentItem : styles.contentItemFirst}>
                            <AppFlatListItem item={{ project: item.project, render: item.render, id: item.id }} viewableItems={viewableItems} />
                        </UIBox >
                    )
                }}
            />
        </UIBox>
    );
}

export default AppSellerFlatList;

const contentItemBase = {
    paddingHorizontal: defaultTheme.shape.spacing.medium,
}

const styles = StyleSheet.create({
    container: {
        height: '70%',
    },
    contentItem: {
        ...contentItemBase,
        paddingTop: defaultTheme.shape.spacing.large

    },
    contentItemFirst: {
        ...contentItemBase
    }
});