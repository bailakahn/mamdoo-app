import React from "react";
import { TextInput as RNTI, Platform } from "react-native";
import { TextInput as RNPTI } from "react-native-paper";

export default function TextInput(props) {
    return Platform.OS === "ios" ? <RNPTI {...props} /> : <RNTI {...props} />;
}
