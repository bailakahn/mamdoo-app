import React from "react";
import Spinner from "react-native-loading-spinner-overlay";
import { ActivityIndicator, View } from "react-native";
import { Classes } from "_styles";
import { useTheme } from "react-native-paper";
export default function Loading({
    visible,
    type,
    style,
    size,
    color,
    ...props
}) {
    const { colors } = useTheme();
    return (
        <View style={Classes.container(colors)}>
            {type === "spinner" ? (
                <Spinner
                    {...{
                        visible,
                        size,
                        color: colors.primary,
                        textStyle: style,
                        props
                    }}
                />
            ) : (
                (visible && (
                    <ActivityIndicator
                        {...{ size, color: colors.primary, style, props }}
                    />
                )) ||
                null
            )}
        </View>
    );
}
