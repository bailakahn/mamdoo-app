import React from "react";
import Spinner from "react-native-loading-spinner-overlay";
import { ActivityIndicator } from "react-native";

export default function Loading({
    visible,
    type,
    style,
    size,
    color,
    ...props
}) {
    return type === "spinner" ? (
        <Spinner
            visible={visible}
            size={size}
            color={color}
            textStyle={style}
            {...props}
        />
    ) : (
        (visible && <ActivityIndicator size={size} color={color} />) || null
    );
}
