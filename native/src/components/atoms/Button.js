import React from "react";
import { Button as PaperButton } from "react-native-paper";

export default function Button({ labelStyle, ...props }) {
    return (
        <PaperButton
            {...props}
            labelStyle={{ color: "#ffffff", ...labelStyle }}
        />
    );
}
